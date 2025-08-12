import { Patient } from './Patient';
import { Hygienist } from './Hygienist';

/**
 * 訪問記録の状態
 */
export type VisitStatus = 'scheduled' | 'completed' | 'cancelled';

/**
 * 訪問記録データの型定義
 */
export interface VisitRecord {
  id: number;
  patientId: number;
  hygienistId: number;
  visitDate: Date;
  startTime?: string;
  endTime?: string;
  status: VisitStatus;
  cancellationReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // 関連データ
  patient?: Patient;
  hygienist?: Hygienist;
}

/**
 * 訪問記録作成時の入力データ型
 */
export interface CreateVisitRecordInput {
  patientId: number;
  hygienistId: number;
  visitDate: Date;
  startTime?: string;
  endTime?: string;
  status?: VisitStatus;
  cancellationReason?: string;
  notes?: string;
}

/**
 * 訪問記録更新時の入力データ型
 */
export interface UpdateVisitRecordInput {
  patientId?: number;
  hygienistId?: number;
  visitDate?: Date;
  startTime?: string;
  endTime?: string;
  status?: VisitStatus;
  cancellationReason?: string;
  notes?: string;
}

/**
 * データベースから取得した訪問記録データの型
 */
export interface VisitRecordRow {
  id: number;
  patient_id: number;
  hygienist_id: number;
  visit_date: Date;
  start_time?: string;
  end_time?: string;
  status: VisitStatus;
  cancellation_reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 関連データを含む訪問記録の型
 */
export interface VisitRecordWithRelations extends VisitRecordRow {
  patient_name?: string;
  patient_patient_id?: string;
  hygienist_name?: string;
  hygienist_staff_id?: string;
}