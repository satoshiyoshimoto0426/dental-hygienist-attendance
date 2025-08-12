import { pool } from '../database/connection';
import { 
  MonthlyReport, 
  CreateMonthlyReportInput, 
  UpdateMonthlyReportInput, 
  MonthlyReportRow,
  MonthlyReportWithRelations,
  MonthlyReportStats
} from '../types/MonthlyReport';
import { DailyVisitRecordModel } from './DailyVisitRecord';
import { monthlyReportValidationSchema, formatValidationError } from '../utils/validation';

/**
 * 月次報告記録モデルクラス
 */
export class MonthlyReportModel {
  /**
   * データベース行を MonthlyReport オブジェクトに変換
   */
  private static rowToMonthlyReport(row: MonthlyReportRow): MonthlyReport {
    return {
      id: row.id,
      patientId: row.patient_id,
      hygienistId: row.hygienist_id,
      reportYear: row.report_year,
      reportMonth: row.report_month,
      totalVisits: row.total_visits,
      totalHours: parseFloat(row.total_hours.toString()),
      completedVisits: row.completed_visits,
      cancelledVisits: row.cancelled_visits,
      summary: row.summary,
      careManagerNotes: row.care_manager_notes,
      status: row.status,
      submittedAt: row.submitted_at,
      approvedAt: row.approved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  /**
   * 関連データを含む行を MonthlyReport オブジェクトに変換
   */
  private static rowWithRelationsToMonthlyReport(row: MonthlyReportWithRelations): MonthlyReport {
    const monthlyReport = this.rowToMonthlyReport(row);
    
    if (row.patient_name) {
      monthlyReport.patient = {
        id: row.patient_id,
        patientId: row.patient_patient_id || '',
        name: row.patient_name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    if (row.hygienist_name) {
      monthlyReport.hygienist = {
        id: row.hygienist_id,
        staffId: row.hygienist_staff_id || '',
        name: row.hygienist_name,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    return monthlyReport;
  }

  /**
   * 全月次報告記録を取得
   */
  static async findAll(): Promise<MonthlyReport[]> {
    try {
      const result = await pool.query(`
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM monthly_reports mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN hygienists h ON mr.hygienist_id = h.id
        ORDER BY mr.report_year DESC, mr.report_month DESC, mr.created_at DESC
      `);
      return result.rows.map(this.rowWithRelationsToMonthlyReport);
    } catch (error) {
      throw new Error(`月次報告記録一覧の取得に失敗しました: ${error}`);
    }
  }

  /**
   * IDで月次報告記録を取得
   */
  static async findById(id: number): Promise<MonthlyReport | null> {
    try {
      const result = await pool.query(`
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM monthly_reports mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN hygienists h ON mr.hygienist_id = h.id
        WHERE mr.id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const report = this.rowWithRelationsToMonthlyReport(result.rows[0]);
      
      // 関連する日次記録も取得
      const dailyRecords = await DailyVisitRecordModel.findByPatientId(
        report.patientId, 
        report.reportYear, 
        report.reportMonth
      );
      report.dailyRecords = dailyRecords.filter(r => r.hygienistId === report.hygienistId);
      
      return report;
    } catch (error) {
      throw new Error(`月次報告記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 年月で月次報告記録を取得
   */
  static async findByYearMonth(year: number, month: number): Promise<MonthlyReport[]> {
    try {
      const result = await pool.query(`
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM monthly_reports mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN hygienists h ON mr.hygienist_id = h.id
        WHERE mr.report_year = $1 AND mr.report_month = $2
        ORDER BY mr.created_at DESC
      `, [year, month]);
      
      return result.rows.map(this.rowWithRelationsToMonthlyReport);
    } catch (error) {
      throw new Error(`年月別月次報告記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 患者別月次報告記録を取得
   */
  static async findByPatientId(patientId: number): Promise<MonthlyReport[]> {
    try {
      const result = await pool.query(`
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM monthly_reports mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN hygienists h ON mr.hygienist_id = h.id
        WHERE mr.patient_id = $1
        ORDER BY mr.report_year DESC, mr.report_month DESC
      `, [patientId]);
      
      return result.rows.map(this.rowWithRelationsToMonthlyReport);
    } catch (error) {
      throw new Error(`患者別月次報告記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 歯科衛生士別月次報告記録を取得
   */
  static async findByHygienistId(hygienistId: number): Promise<MonthlyReport[]> {
    try {
      const result = await pool.query(`
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM monthly_reports mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN hygienists h ON mr.hygienist_id = h.id
        WHERE mr.hygienist_id = $1
        ORDER BY mr.report_year DESC, mr.report_month DESC
      `, [hygienistId]);
      
      return result.rows.map(this.rowWithRelationsToMonthlyReport);
    } catch (error) {
      throw new Error(`歯科衛生士別月次報告記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 特定の患者・歯科衛生士・年月の月次報告記録を取得
   */
  static async findByPatientHygienistYearMonth(
    patientId: number, 
    hygienistId: number, 
    year: number, 
    month: number
  ): Promise<MonthlyReport | null> {
    try {
      const result = await pool.query(`
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM monthly_reports mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN hygienists h ON mr.hygienist_id = h.id
        WHERE mr.patient_id = $1 AND mr.hygienist_id = $2 
          AND mr.report_year = $3 AND mr.report_month = $4
      `, [patientId, hygienistId, year, month]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.rowWithRelationsToMonthlyReport(result.rows[0]);
    } catch (error) {
      throw new Error(`月次報告記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 月次報告記録を作成（日次記録から自動生成）
   */
  static async create(input: CreateMonthlyReportInput): Promise<MonthlyReport> {
    // バリデーション
    const { error } = monthlyReportValidationSchema.create.validate(input);
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

      // 既存の月次報告記録をチェック
      const existing = await this.findByPatientHygienistYearMonth(
        input.patientId, 
        input.hygienistId, 
        input.reportYear, 
        input.reportMonth
      );
      if (existing) {
        throw new Error('指定された年月の月次報告記録は既に存在します');
      }

      // 日次記録から統計データを計算
      const stats = await DailyVisitRecordModel.calculateMonthlyStats(
        input.patientId, 
        input.hygienistId, 
        input.reportYear, 
        input.reportMonth
      );

      const result = await pool.query(`
        INSERT INTO monthly_reports (
          patient_id, hygienist_id, report_year, report_month,
          total_visits, total_hours, completed_visits, cancelled_visits,
          summary, care_manager_notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *
      `, [
        input.patientId,
        input.hygienistId,
        input.reportYear,
        input.reportMonth,
        stats.totalVisits,
        stats.totalHours,
        stats.completedVisits,
        stats.cancelledVisits,
        input.summary,
        input.careManagerNotes,
        'draft'
      ]);
      
      return this.rowToMonthlyReport(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('患者が存在しません') ||
        error.message.includes('歯科衛生士が存在しません') ||
        error.message.includes('既に存在します')
      )) {
        throw error;
      }
      throw new Error(`月次報告記録の作成に失敗しました: ${error}`);
    }
  }

  /**
   * 月次報告記録を更新
   */
  static async update(id: number, input: UpdateMonthlyReportInput): Promise<MonthlyReport | null> {
    // バリデーション
    const { error } = monthlyReportValidationSchema.update.validate(input);
    if (error) {
      throw new Error(`バリデーションエラー: ${formatValidationError(error).join(', ')}`);
    }

    try {
      // 月次報告記録の存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }

      // 更新するフィールドを動的に構築
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (input.summary !== undefined) {
        updateFields.push(`summary = $${paramIndex++}`);
        values.push(input.summary);
      }
      if (input.careManagerNotes !== undefined) {
        updateFields.push(`care_manager_notes = $${paramIndex++}`);
        values.push(input.careManagerNotes);
      }
      if (input.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(input.status);
        
        // ステータス変更時のタイムスタンプ更新
        if (input.status === 'submitted') {
          updateFields.push(`submitted_at = $${paramIndex++}`);
          values.push(new Date());
        } else if (input.status === 'approved') {
          updateFields.push(`approved_at = $${paramIndex++}`);
          values.push(new Date());
        }
      }

      if (updateFields.length === 0) {
        return existing; // 更新するフィールドがない場合は既存データを返す
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE monthly_reports SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      return this.rowToMonthlyReport(result.rows[0]);
    } catch (error) {
      throw new Error(`月次報告記録の更新に失敗しました: ${error}`);
    }
  }

  /**
   * 月次報告記録を削除
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // 月次報告記録の存在確認
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      const result = await pool.query(
        'DELETE FROM monthly_reports WHERE id = $1',
        [id]
      );
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      throw new Error(`月次報告記録の削除に失敗しました: ${error}`);
    }
  }

  /**
   * 日次記録から月次報告記録を再生成
   */
  static async regenerateFromDailyRecords(id: number): Promise<MonthlyReport | null> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }

      // 日次記録から統計データを再計算
      const stats = await DailyVisitRecordModel.calculateMonthlyStats(
        existing.patientId, 
        existing.hygienistId, 
        existing.reportYear, 
        existing.reportMonth
      );

      const result = await pool.query(`
        UPDATE monthly_reports 
        SET total_visits = $1, total_hours = $2, completed_visits = $3, cancelled_visits = $4
        WHERE id = $5 
        RETURNING *
      `, [
        stats.totalVisits,
        stats.totalHours,
        stats.completedVisits,
        stats.cancelledVisits,
        id
      ]);
      
      return this.rowToMonthlyReport(result.rows[0]);
    } catch (error) {
      throw new Error(`月次報告記録の再生成に失敗しました: ${error}`);
    }
  }

  /**
   * 提出可能な月次報告記録を取得（下書き状態のもの）
   */
  static async findSubmittableReports(): Promise<MonthlyReport[]> {
    try {
      const result = await pool.query(`
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM monthly_reports mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN hygienists h ON mr.hygienist_id = h.id
        WHERE mr.status = 'draft'
        ORDER BY mr.report_year DESC, mr.report_month DESC
      `);
      
      return result.rows.map(this.rowWithRelationsToMonthlyReport);
    } catch (error) {
      throw new Error(`提出可能な月次報告記録の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 承認待ちの月次報告記録を取得
   */
  static async findPendingApprovalReports(): Promise<MonthlyReport[]> {
    try {
      const result = await pool.query(`
        SELECT 
          mr.*,
          p.name as patient_name,
          p.patient_id as patient_patient_id,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM monthly_reports mr
        LEFT JOIN patients p ON mr.patient_id = p.id
        LEFT JOIN hygienists h ON mr.hygienist_id = h.id
        WHERE mr.status = 'submitted'
        ORDER BY mr.submitted_at ASC
      `);
      
      return result.rows.map(this.rowWithRelationsToMonthlyReport);
    } catch (error) {
      throw new Error(`承認待ち月次報告記録の取得に失敗しました: ${error}`);
    }
  }
}