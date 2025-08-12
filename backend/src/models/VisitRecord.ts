import { pool } from '../database/connection';
import { 
  VisitRecord, 
  CreateVisitRecordInput, 
  UpdateVisitRecordInput, 
  VisitRecordRow,
  VisitRecordWithRelations
} from '../types/VisitRecord';
import { dailyVisitRecordValidationSchema, formatValidationError } from '../utils/validation';

/**
 * 訪問記録モデルクラス
 */
export class VisitRecordModel {
  /**
   * データベース行を VisitRecord オブジェクトに変換
   */
  private static rowToVisitRecord(row: VisitRecordRow): VisitRecord {
    const record: VisitRecord = {
      id: row.id,
      patientId: row.patient_id,
      hygienistId: row.hygienist_id,
      visitDate: row.visit_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    
    if (row.start_time !== null && row.start_time !== undefined) {
      record.startTime = row.start_time;
    }
    
    if (row.end_time !== null && row.end_time !== undefined) {
      record.endTime = row.end_time;
    }
    
    if (row.cancellation_reason !== null && row.cancellation_reason !== undefined) {
      record.cancellationReason = row.cancellation_reason;
    }
    
    if (row.notes !== null && row.notes !== undefined) {
      record.notes = row.notes;
    }
    
    return record;
  }

  /**
   * 関連データを含む行を VisitRecord オブジェクトに変換
   */
  private static rowWithRelationsToVisitRecord(row: VisitRecordWithRelations): VisitRecord {
    const visitRecord = this.rowToVisitRecord(row);
    
    if (row.patient_name) {
      visitRecord.patient = {
        id: row.patient_id,
        patientId: row.patient_patient_id || '',
        name: row.patient_name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    if (row.hygienist_name) {
      visitRecord.hygienist = {
        id: row.hygienist_id,
        staffId: row.hygienist_staff_id || '',
        name: row.hygienist_name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    return visitRecord;
  }

  /**
   * 全訪問記録を取得
   */
  static async findAll(): Promise<VisitRecord[]> {
    try {
      const result = await pool.query(`
        SELECT 
          vr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM visit_records vr
        LEFT JOIN patients p ON vr.patient_id = p.id
        LEFT JOIN hygienists h ON vr.hygienist_id = h.id
        ORDER BY vr.visit_date DESC, vr.created_at DESC
      `);
      return result.rows.map(this.rowWithRelationsToVisitRecord);
    } catch (error) {
      throw new Error(`訪問記録一覧の取得に失敗しました: ${error}`);
    }
  }

  /**
   * IDで訪問記録を取得
   */
  static async findById(id: number): Promise<VisitRecord | null> {
    try {
      const result = await pool.query(`
        SELECT 
          vr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM visit_records vr
        LEFT JOIN patients p ON vr.patient_id = p.id
        LEFT JOIN hygienists h ON vr.hygienist_id = h.id
        WHERE vr.id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.rowWithRelationsToVisitRecord(result.rows[0]);
    } catch (error) {
      throw new Error(`訪問記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 月間訪問記録を取得
   */
  static async findByMonth(year: number, month: number): Promise<VisitRecord[]> {
    try {
      const result = await pool.query(`
        SELECT 
          vr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM visit_records vr
        LEFT JOIN patients p ON vr.patient_id = p.id
        LEFT JOIN hygienists h ON vr.hygienist_id = h.id
        WHERE EXTRACT(YEAR FROM vr.visit_date) = $1 
          AND EXTRACT(MONTH FROM vr.visit_date) = $2
        ORDER BY vr.visit_date ASC, vr.start_time ASC
      `, [year, month]);
      
      return result.rows.map(this.rowWithRelationsToVisitRecord);
    } catch (error) {
      throw new Error(`月間訪問記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 患者別訪問記録を取得
   */
  static async findByPatientId(patientId: number, year?: number, month?: number): Promise<VisitRecord[]> {
    try {
      let query = `
        SELECT 
          vr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM visit_records vr
        LEFT JOIN patients p ON vr.patient_id = p.id
        LEFT JOIN hygienists h ON vr.hygienist_id = h.id
        WHERE vr.patient_id = $1
      `;
      
      const params: any[] = [patientId];
      
      if (year && month) {
        query += ` AND EXTRACT(YEAR FROM vr.visit_date) = $2 AND EXTRACT(MONTH FROM vr.visit_date) = $3`;
        params.push(year, month);
      }
      
      query += ` ORDER BY vr.visit_date DESC`;
      
      const result = await pool.query(query, params);
      return result.rows.map(this.rowWithRelationsToVisitRecord);
    } catch (error) {
      throw new Error(`患者別訪問記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 歯科衛生士別訪問記録を取得
   */
  static async findByHygienistId(hygienistId: number, year?: number, month?: number): Promise<VisitRecord[]> {
    try {
      let query = `
        SELECT 
          vr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM visit_records vr
        LEFT JOIN patients p ON vr.patient_id = p.id
        LEFT JOIN hygienists h ON vr.hygienist_id = h.id
        WHERE vr.hygienist_id = $1
      `;
      
      const params: any[] = [hygienistId];
      
      if (year && month) {
        query += ` AND EXTRACT(YEAR FROM vr.visit_date) = $2 AND EXTRACT(MONTH FROM vr.visit_date) = $3`;
        params.push(year, month);
      }
      
      query += ` ORDER BY vr.visit_date DESC`;
      
      const result = await pool.query(query, params);
      return result.rows.map(this.rowWithRelationsToVisitRecord);
    } catch (error) {
      throw new Error(`歯科衛生士別訪問記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 訪問記録を作成
   */
  static async create(input: CreateVisitRecordInput): Promise<VisitRecord> {
    // バリデーション
    const { error } = dailyVisitRecordValidationSchema.create.validate(input);
    if (error) {
      throw new Error(`バリデーションエラー: ${formatValidationError(error).join(', ')}`);
    }

    try {
      // 患者と歯科衛生士の存在確認
      const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [input.patientId]);
      if (patientCheck.rows.length === 0) {
        throw new Error('指定された患者が存在しません');
      }

      const hygienistCheck = await pool.query('SELECT id FROM hygienists WHERE id = $1', [input.hygienistId]);
      if (hygienistCheck.rows.length === 0) {
        throw new Error('指定された歯科衛生士が存在しません');
      }

      // 時間の整合性チェック
      if (input.startTime && input.endTime && input.startTime >= input.endTime) {
        throw new Error('終了時間は開始時間より後である必要があります');
      }

      const result = await pool.query(`
        INSERT INTO visit_records (
          patient_id, hygienist_id, visit_date, start_time, end_time, 
          status, cancellation_reason, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
      `, [
        input.patientId,
        input.hygienistId,
        input.visitDate,
        input.startTime,
        input.endTime,
        input.status || 'completed',
        input.cancellationReason,
        input.notes
      ]);
      
      return this.rowToVisitRecord(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('患者') || error.message.includes('歯科衛生士') || error.message.includes('時間'))) {
        throw error;
      }
      throw new Error(`訪問記録の作成に失敗しました: ${error}`);
    }
  }

  /**
   * 訪問記録を更新
   */
  static async update(id: number, input: UpdateVisitRecordInput): Promise<VisitRecord | null> {
    // バリデーション
    const { error } = dailyVisitRecordValidationSchema.update.validate(input);
    if (error) {
      throw new Error(`バリデーションエラー: ${formatValidationError(error).join(', ')}`);
    }

    try {
      // 訪問記録の存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }

      // 患者と歯科衛生士の存在確認
      if (input.patientId) {
        const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [input.patientId]);
        if (patientCheck.rows.length === 0) {
          throw new Error('指定された患者が存在しません');
        }
      }

      if (input.hygienistId) {
        const hygienistCheck = await pool.query('SELECT id FROM hygienists WHERE id = $1', [input.hygienistId]);
        if (hygienistCheck.rows.length === 0) {
          throw new Error('指定された歯科衛生士が存在しません');
        }
      }

      // 時間の整合性チェック
      const startTime = input.startTime !== undefined ? input.startTime : existing.startTime;
      const endTime = input.endTime !== undefined ? input.endTime : existing.endTime;
      
      if (startTime && endTime && startTime >= endTime) {
        throw new Error('終了時間は開始時間より後である必要があります');
      }

      // 更新するフィールドを動的に構築
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.patientId !== undefined) {
        updateFields.push(`patient_id = $${paramIndex++}`);
        values.push(input.patientId);
      }
      if (input.hygienistId !== undefined) {
        updateFields.push(`hygienist_id = $${paramIndex++}`);
        values.push(input.hygienistId);
      }
      if (input.visitDate !== undefined) {
        updateFields.push(`visit_date = $${paramIndex++}`);
        values.push(input.visitDate);
      }
      if (input.startTime !== undefined) {
        updateFields.push(`start_time = $${paramIndex++}`);
        values.push(input.startTime);
      }
      if (input.endTime !== undefined) {
        updateFields.push(`end_time = $${paramIndex++}`);
        values.push(input.endTime);
      }
      if (input.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(input.status);
      }
      if (input.cancellationReason !== undefined) {
        updateFields.push(`cancellation_reason = $${paramIndex++}`);
        values.push(input.cancellationReason);
      }
      if (input.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex++}`);
        values.push(input.notes);
      }

      if (updateFields.length === 0) {
        return existing; // 更新するフィールドがない場合は既存データを返す
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE visit_records SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      return this.rowToVisitRecord(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('患者') || error.message.includes('歯科衛生士') || error.message.includes('時間'))) {
        throw error;
      }
      throw new Error(`訪問記録の更新に失敗しました: ${error}`);
    }
  }

  /**
   * 訪問記録を削除
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // 訪問記録の存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      const result = await pool.query(
        'DELETE FROM visit_records WHERE id = $1',
        [id]
      );
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      throw new Error(`訪問記録の削除に失敗しました: ${error}`);
    }
  }

  /**
   * 患者の月間訪問回数を取得
   */
  static async getPatientMonthlyVisitCount(patientId: number, year: number, month: number): Promise<number> {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM visit_records 
        WHERE patient_id = $1 
          AND EXTRACT(YEAR FROM visit_date) = $2 
          AND EXTRACT(MONTH FROM visit_date) = $3
          AND status = 'completed'
      `, [patientId, year, month]);
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`患者の月間訪問回数の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 歯科衛生士の月間訪問回数を取得
   */
  static async getHygienistMonthlyVisitCount(hygienistId: number, year: number, month: number): Promise<number> {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM visit_records 
        WHERE hygienist_id = $1 
          AND EXTRACT(YEAR FROM visit_date) = $2 
          AND EXTRACT(MONTH FROM visit_date) = $3
          AND status = 'completed'
      `, [hygienistId, year, month]);
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`歯科衛生士の月間訪問回数の取得に失敗しました: ${error}`);
    }
  }
}