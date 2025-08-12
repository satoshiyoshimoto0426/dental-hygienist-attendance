/**
 * 歯科衛生士別レポート関連の型定義
 */

/**
 * 歯科衛生士別訪問詳細
 */
export interface HygienistVisitDetail {
  id: number;
  visitDate: string;
  startTime?: string;
  endTime?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  patientName: string;
  patientId: string;
  cancellationReason?: string;
  notes?: string;
  duration?: number; // 分単位
}

/**
 * 歯科衛生士別月間統計
 */
export interface HygienistMonthlyStats {
  hygienistId: number;
  hygienistName: string;
  staffId: string;
  year: number;
  month: number;
  totalVisits: number;
  completedVisits: number;
  cancelledVisits: number;
  scheduledVisits: number;
  totalHours: number;
  averageVisitDuration: number; // 分単位
  visitDetails: HygienistVisitDetail[];
}

/**
 * 歯科衛生士別レポートパラメータ
 */
export interface HygienistReportParams {
  hygienistId: number;
  year: number;
  month: number;
}

/**
 * 歯科衛生士比較レポート
 */
export interface HygienistComparisonReport {
  year: number;
  month: number;
  hygienists: HygienistMonthlyStats[];
  totalHygienists: number;
  averageVisitsPerHygienist: number;
}