import { pool } from '../database/connection';
import { 
  PatientMonthlyStats, 
  PatientVisitDetail, 
  PatientReportParams,
  PatientComparisonReport
} from '../types/PatientReport';

/**
 * 患者別レポートモデルクラス
 */
export class PatientReportModel {
  /**
   * 患者別月間統計を取得
   */
  static async getPatientMonthlyStats(params: PatientReportParams): Promise<PatientMonthlyStats | null> {
    try {
      // 患者情報を取得
      const patientResult = await pool.query(
        'SELECT id, name, patient_id FROM patients WHERE id = $1',
        [params.patientId]
      );

      if (patientResult.rows.length === 0) {
        return null;
      }

      const patient = patientResult.rows[0];

      // 月間訪問記録を取得
      const visitResult = await pool.query(`
        SELECT 
          dvr.id,
          dvr.visit_date,
          dvr.start_time,
          dvr.end_time,
          dvr.status,
          dvr.cancellation_reason,
          dvr.notes,
          h.name as hygienist_name,
          h.staff_id as hygienist_staff_id
        FROM daily_visit_records dvr
        LEFT JOIN hygienists h ON dvr.hygienist_id = h.id
        WHERE dvr.patient_id = $1 
          AND EXTRACT(YEAR FROM dvr.visit_date) = $2 
          AND EXTRACT(MONTH FROM dvr.visit_date) = $3
        ORDER BY dvr.visit_date ASC, dvr.start_time ASC
      `, [params.patientId, params.year, params.month]);

      const visits = visitResult.rows;

      // 統計を計算
      const totalVisits = visits.length;
      const completedVisits = visits.filter(v => v.status === 'completed').length;
      const cancelledVisits = visits.filter(v => v.status === 'cancelled').length;
      const scheduledVisits = visits.filter(v => v.status === 'scheduled').length;

      // 総時間と平均時間を計算
      let totalMinutes = 0;
      const visitDetails: PatientVisitDetail[] = visits.map(visit => {
        let duration: number | undefined;
        
        if (visit.start_time && visit.end_time && visit.status === 'completed') {
          const start = new Date(`2000-01-01 ${visit.start_time}`);
          const end = new Date(`2000-01-01 ${visit.end_time}`);
          duration = (end.getTime() - start.getTime()) / (1000 * 60);
          totalMinutes += duration;
        }

        const detail: PatientVisitDetail = {
          id: visit.id,
          visitDate: visit.visit_date,
          startTime: visit.start_time,
          endTime: visit.end_time,
          status: visit.status,
          hygienistName: visit.hygienist_name || '未設定',
          hygienistStaffId: visit.hygienist_staff_id || '',
          cancellationReason: visit.cancellation_reason,
          notes: visit.notes
        };

        if (duration !== undefined) {
          detail.duration = duration;
        }

        return detail;
      });

      const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
      const averageVisitDuration = completedVisits > 0 ? 
        Math.round((totalMinutes / completedVisits) * 100) / 100 : 0;

      return {
        patientId: patient.id,
        patientName: patient.name,
        year: params.year,
        month: params.month,
        totalVisits,
        completedVisits,
        cancelledVisits,
        scheduledVisits,
        totalHours,
        averageVisitDuration,
        visitDetails
      };
    } catch (error) {
      throw new Error(`患者別月間統計の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 複数患者の月間統計比較を取得
   */
  static async getPatientComparisonReport(year: number, month: number): Promise<PatientComparisonReport> {
    try {
      // 該当月に訪問記録がある患者一覧を取得
      const patientResult = await pool.query(`
        SELECT DISTINCT p.id, p.name, p.patient_id
        FROM patients p
        INNER JOIN daily_visit_records dvr ON p.id = dvr.patient_id
        WHERE EXTRACT(YEAR FROM dvr.visit_date) = $1 
          AND EXTRACT(MONTH FROM dvr.visit_date) = $2
        ORDER BY p.name
      `, [year, month]);

      const patients: PatientMonthlyStats[] = [];
      let totalVisitsSum = 0;

      // 各患者の統計を取得
      for (const patient of patientResult.rows) {
        const stats = await this.getPatientMonthlyStats({
          patientId: patient.id,
          year,
          month
        });

        if (stats) {
          patients.push(stats);
          totalVisitsSum += stats.totalVisits;
        }
      }

      const totalPatients = patients.length;
      const averageVisitsPerPatient = totalPatients > 0 ? 
        Math.round((totalVisitsSum / totalPatients) * 100) / 100 : 0;

      return {
        year,
        month,
        patients,
        totalPatients,
        averageVisitsPerPatient
      };
    } catch (error) {
      throw new Error(`患者比較レポートの取得に失敗しました: ${error}`);
    }
  }

  /**
   * 患者の年間統計を取得
   */
  static async getPatientYearlyStats(patientId: number, year: number): Promise<PatientMonthlyStats[]> {
    try {
      const monthlyStats: PatientMonthlyStats[] = [];

      // 1月から12月まで各月の統計を取得
      for (let month = 1; month <= 12; month++) {
        const stats = await this.getPatientMonthlyStats({
          patientId,
          year,
          month
        });

        if (stats && stats.totalVisits > 0) {
          monthlyStats.push(stats);
        }
      }

      return monthlyStats;
    } catch (error) {
      throw new Error(`患者年間統計の取得に失敗しました: ${error}`);
    }
  }
}