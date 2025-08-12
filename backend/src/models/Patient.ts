import { pool } from '../database/connection';
import { Patient, CreatePatientInput, UpdatePatientInput, PatientRow } from '../types/Patient';
import { patientValidationSchema, formatValidationError } from '../utils/validation';

/**
 * 患者モデルクラス
 */
export class PatientModel {
  /**
   * データベース行を Patient オブジェクトに変換
   */
  private static rowToPatient(row: PatientRow): Patient {
    const patient: Patient = {
      id: row.id,
      patientId: row.patient_id,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    
    if (row.phone) patient.phone = row.phone;
    if (row.email) patient.email = row.email;
    if (row.address) patient.address = row.address;
    
    return patient;
  }

  /**
   * 全患者を取得
   */
  static async findAll(): Promise<Patient[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM patients ORDER BY created_at DESC'
      );
      return result.rows.map(this.rowToPatient);
    } catch (error) {
      throw new Error(`患者一覧の取得に失敗しました: ${error}`);
    }
  }

  /**
   * IDで患者を取得
   */
  static async findById(id: number): Promise<Patient | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM patients WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.rowToPatient(result.rows[0]);
    } catch (error) {
      throw new Error(`患者の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 患者IDで患者を取得
   */
  static async findByPatientId(patientId: string): Promise<Patient | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM patients WHERE patient_id = $1',
        [patientId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.rowToPatient(result.rows[0]);
    } catch (error) {
      throw new Error(`患者の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 患者を作成
   */
  static async create(input: CreatePatientInput): Promise<Patient> {
    // バリデーション
    const { error } = patientValidationSchema.create.validate(input);
    if (error) {
      throw new Error(`バリデーションエラー: ${formatValidationError(error).join(', ')}`);
    }

    try {
      // 患者IDの重複チェック
      const existing = await this.findByPatientId(input.patientId);
      if (existing) {
        throw new Error('この患者IDは既に使用されています');
      }

      const result = await pool.query(
        `INSERT INTO patients (patient_id, name, phone, email, address) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [input.patientId, input.name, input.phone, input.email, input.address]
      );
      
      return this.rowToPatient(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('患者ID')) {
        throw error;
      }
      throw new Error(`患者の作成に失敗しました: ${error}`);
    }
  }

  /**
   * 患者を更新
   */
  static async update(id: number, input: UpdatePatientInput): Promise<Patient | null> {
    // バリデーション
    const { error } = patientValidationSchema.update.validate(input);
    if (error) {
      throw new Error(`バリデーションエラー: ${formatValidationError(error).join(', ')}`);
    }

    try {
      // 患者の存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }

      // 患者IDの重複チェック（自分以外）
      if (input.patientId) {
        const duplicateCheck = await pool.query(
          'SELECT id FROM patients WHERE patient_id = $1 AND id != $2',
          [input.patientId, id]
        );
        if (duplicateCheck.rows.length > 0) {
          throw new Error('この患者IDは既に使用されています');
        }
      }

      // 更新するフィールドを動的に構築
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.patientId !== undefined) {
        updateFields.push(`patient_id = $${paramIndex++}`);
        values.push(input.patientId);
      }
      if (input.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(input.name);
      }
      if (input.phone !== undefined) {
        updateFields.push(`phone = $${paramIndex++}`);
        values.push(input.phone);
      }
      if (input.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(input.email);
      }
      if (input.address !== undefined) {
        updateFields.push(`address = $${paramIndex++}`);
        values.push(input.address);
      }

      if (updateFields.length === 0) {
        return existing; // 更新するフィールドがない場合は既存データを返す
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE patients SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      return this.rowToPatient(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('患者ID')) {
        throw error;
      }
      throw new Error(`患者の更新に失敗しました: ${error}`);
    }
  }

  /**
   * 患者を削除
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // 患者の存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      // 関連する訪問記録があるかチェック
      const visitRecordsCheck = await pool.query(
        'SELECT COUNT(*) as count FROM visit_records WHERE patient_id = $1',
        [id]
      );
      
      if (parseInt(visitRecordsCheck.rows[0].count) > 0) {
        throw new Error('この患者には訪問記録が存在するため削除できません');
      }

      const result = await pool.query(
        'DELETE FROM patients WHERE id = $1',
        [id]
      );
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      if (error instanceof Error && error.message.includes('訪問記録')) {
        throw error;
      }
      throw new Error(`患者の削除に失敗しました: ${error}`);
    }
  }

  /**
   * 患者名で検索
   */
  static async searchByName(name: string): Promise<Patient[]> {
    try {
      const result = await pool.query(
        'SELECT * FROM patients WHERE name ILIKE $1 ORDER BY name',
        [`%${name}%`]
      );
      return result.rows.map(this.rowToPatient);
    } catch (error) {
      throw new Error(`患者の検索に失敗しました: ${error}`);
    }
  }
}