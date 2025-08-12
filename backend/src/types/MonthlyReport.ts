import { Patient } from './Patient';
import { Hygienist } from './Hygienist';
import { DailyVisitRecord } from './DailyVisitRecord';

/**
 * 月次報告記録の状態
 */
export type MonthlyReportStatus = 'draft' | 'submitted' | 'approved';

/**
 * 月次報告記録データの型定義
 */
export interface MonthlyReport {
  id: number;
  patientId: number;
  hygienistId: number;
  reportYear: number;
  reportMonth: number;
  totalVisits: number;
  totalHours: number;
  completedVisits: number;
  cancelledVisits: number;
  summary?: string;
  careManagerNotes?: string;
  status: MonthlyReportStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // 関連データ
  patient?: Patient;
  hygienist?: Hygienist;
  dailyRecords?: DailyVisitRecord[];
}

/**
 * 月次報告記録作成時の入力データ型
 */
export interface CreateMonthlyReportInput {
  patientId: number;
  hygienistId: number;
  reportYear: number;
  reportMonth: number;
  summary?: string;
  careManagerNotes?: string;
}

/**
 * 月次報告記録更新時の入力データ型
 */
export interface UpdateMonthlyReportInput {
  summary?: string;
  careManagerNotes?: string;
  status?: MonthlyReportStatus;
}

/**
 * データベースから取得した月次報告記録データの型
 */
export interface MonthlyReportRow {
  id: number;
  patient_id: number;
  hygienist_id: number;
  report_year: number;
  report_month: number;
  total_visits: number;
  total_hours: number;
  completed_visits: number;
  cancelled_visits: number;
  summary?: string;
  care_manager_notes?: string;
  status: MonthlyReportStatus;
  submitted_at?: Date;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * 関連データを含む月次報告記録の型
 */
export interface MonthlyReportWithRelations extends MonthlyReportRow {
  patient_name?: string;
  patient_patient_id?: string;
  hygienist_name?: string;
  hygienist_staff_id?: string;
}

/**
 * 月次報告記録生成用の統計データ
 */
export interface MonthlyReportStats {
  totalVisits: number;
  totalHours: number;
  completedVisits: number;
  cancelledVisits: number;
  scheduledVisits: number;
  averageVisitDuration: number;
  visitDates: Date[];
}