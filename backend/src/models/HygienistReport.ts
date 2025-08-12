import { pool } from '../database/connection';
import { 
  HygienistMonthlyStats, 
  HygienistVisitDetail, 
  HygienistReportParams,
  HygienistComparisonReport
} from '../types/HygienistReport';

/**
 * 歯科衛生士別レポートモデルクラス
 */
export class HygienistReportModel {
  /**
   * 歯科衛生士別月間統計を取得
   */
  static async getHygienistMonthlyStats(params: HygienistReportParams): Promise<HygienistMonthlyStats | null> {
    try {
      // 歯科衛生士情報を取得
      const hygienistResult = await pool.query(
        'SELECT id, name, staff_id FROM hygienists WHERE id = $1',
        [params.hygienistId]
      );

      if (hygienistResult.rows.length === 0) {
        return null;
      }

      const hygienist = hygienistResult.rows[0];

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
          p.name as patient_name,
          p.patient_id as patient_id
        FROM daily_visit_records dvr
        LEFT JOIN patients p ON dvr.patient_id = p.id
        WHERE dvr.hygienist_id = $1 
          AND EXTRACT(YEAR FROM dvr.visit_date) = $2 
          AND EXTRACT(MONTH FROM dvr.visit_date) = $3
        ORDER BY dvr.visit_date ASC, dvr.start_time ASC
      `, [params.hygienistId, params.year, params.month]);

      const visits = visitResult.rows;

      // 統計を計算
      const totalVisits = visits.length;
      const completedVisits = visits.filter(v => v.status === 'completed').length;
      const cancelledVisits = visits.filter(v => v.status === 'cancelled').length;
      const scheduledVisits = visits.filter(v => v.status === 'scheduled').length;

      // 総時間と平均時間を計算
      let totalMinutes = 0;
      const visitDetails: HygienistVisitDetail[] = visits.map(visit => {
        let duration: number | undefined;
        
        if (visit.start_time && visit.end_time && visit.status === 'completed') {
          const start = new Date(`2000-01-01 ${visit.start_time}`);
          const end = new Date(`2000-01-01 ${visit.end_time}`);
          duration = (end.getTime() - start.getTime()) / (1000 * 60);
          totalMinutes += duration;
        }

        const detail: HygienistVisitDetail = {
          id: visit.id,
          visitDate: visit.visit_date,
          startTime: visit.start_time,
          endTime: visit.end_time,
          status: visit.status,
          patientName: visit.patient_name || '未設定',
          patientId: visit.patient_id || '',
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
        hygienistId: hygienist.id,
        hygienistName: hygienist.name,
        staffId: hygienist.staff_id,
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
      throw new Error(`歯科衛生士別月間統計の取得に失敗しました: ${error}`);
    }
  }

  /**
   * 複数歯科衛生士の月間統計比較を取得
   */
  static async getHygienistComparisonReport(year: number, month: number): Promise<HygienistComparisonReport> {
    try {
      // 該当月に訪問記録がある歯科衛生士一覧を取得
      const hygienistResult = await pool.query(`
        SELECT DISTINCT h.id, h.name, h.staff_id
        FROM hygienists h
        INNER JOIN daily_visit_records dvr ON h.id = dvr.hygienist_id
        WHERE EXTRACT(YEAR FROM dvr.visit_date) = $1 
          AND EXTRACT(MONTH FROM dvr.visit_date) = $2
        ORDER BY h.name
      `, [year, month]);

      const hygienists: HygienistMonthlyStats[] = [];
      let totalVisitsSum = 0;

      // 各歯科衛生士の統計を取得
      for (const hygienist of hygienistResult.rows) {
        const stats = await this.getHygienistMonthlyStats({
          hygienistId: hygienist.id,
          year,
          month
        });

        if (stats) {
          hygienists.push(stats);
          totalVisitsSum += stats.totalVisits;
        }
      }

      const totalHygienists = hygienists.length;
      const averageVisitsPerHygienist = totalHygienists > 0 ? 
        Math.round((totalVisitsSum / totalHygienists) * 100) / 100 : 0;

      return {
        year,
        month,
        hygienists,
        totalHygienists,
        averageVisitsPerHygienist
      };
    } catch (error) {
      throw new Error(`歯科衛生士比較レポートの取得に失敗しました: ${error}`);
    }
  }

  /**
   * 歯科衛生士の年間統計を取得
   */
  static async getHygienistYearlyStats(hygienistId: number, year: number): Promise<HygienistMonthlyStats[]> {
    try {
      const monthlyStats: HygienistMonthlyStats[] = [];

      // 1月から12月まで各月の統計を取得
      for (let month = 1; month <= 12; month++) {
        const stats = await this.getHygienistMonthlyStats({
          hygienistId,
          year,
          month
        });

        if (stats && stats.totalVisits > 0) {
          monthlyStats.push(stats);
        }
      }

      return monthlyStats;
    } catch (error) {
      throw new Error(`歯科衛生士年間統計の取得に失敗しました: ${error}`);
    }
  }
}