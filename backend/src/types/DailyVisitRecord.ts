import { Patient } from './Patient';
import { Hygienist } from './Hygienist';

/**
 * 日次訪問記録の状態
 */
export type DailyVisitStatus = 'scheduled' | 'completed' | 'cancelled';

/**
 * 日次訪問記録データの型定義
 */
export interface DailyVisitRecord {
  id: number;
  patientId: number;
  hygienistId: number;
  visitDate: Date;
  startTime?: string;
  endTime?: string;
  status: DailyVisitStatus;
  cancellationReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // 関連データ
  patient?: Patient;
  hygienist?: Hygienist;
}

/**
 * 日次訪問記録作成時の入力データ型
 */
export interface CreateDailyVisitRecordInput {
  patientId: number;
  hygienistId: number;
  visitDate: Date;
  startTime?: string;
  endTime?: string;
  status?: DailyVisitStatus;
  cancellationReason?: string;
  notes?: string;
}

/**
 * 日次訪問記録更新時の入力データ型
 */
export interface UpdateDailyVisitRecordInput {
  patientId?: number;
  hygienistId?: number;
  visitDate?: Date;
  startTime?: string;
  endTime?: string;
  status?: DailyVisitStatus;
  cancellationReason?: string;
  notes?: string;
}

/**
 * データベースから取得した日次訪問記録データの型
 */
export interface DailyVisitRecordRow {
  id: number;
  patient_id: number;
  hygienist_id: number;
  visit_date: Date;
  start_time?: string;
  end_time?: string;
  status: DailyVisitStatus;
  cancellation_reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 関連データを含む日次訪問記録の型
 */
export interface DailyVisitRecordWithRelations extends DailyVisitRecordRow {
  patient_name?: string;
  patient_patient_id?: string;
  hygienist_name?: string;
  hygienist_staff_id?: string;
}