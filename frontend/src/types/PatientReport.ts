/**
 * 患者別統計レポートの型定義
 */

/**
 * 患者別月間統計データ
 */
export interface PatientMonthlyStats {
  patientId: number;
  patientName: string;
  year: number;
  month: number;
  totalVisits: number;
  completedVisits: number;
  cancelledVisits: number;
  scheduledVisits: number;
  totalHours: number;
  averageVisitDuration: number; // 分単位
  visitDetails: PatientVisitDetail[];
}

/**
 * 患者の訪問詳細
 */
export interface PatientVisitDetail {
  id: number;
  visitDate: string; // ISO date string
  startTime?: string;
  endTime?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  hygienistName: string;
  hygienistStaffId: string;
  cancellationReason?: string;
  notes?: string;
  duration?: number; // 分単位
}

/**
 * 患者別統計レポート取得パラメータ
 */
export interface PatientReportParams {
  patientId: number;
  year: number;
  month: number;
}

/**
 * 複数患者の月間統計比較データ
 */
export interface PatientComparisonReport {
  year: number;
  month: number;
  patients: PatientMonthlyStats[];
  totalPatients: number;
  averageVisitsPerPatient: number;
}