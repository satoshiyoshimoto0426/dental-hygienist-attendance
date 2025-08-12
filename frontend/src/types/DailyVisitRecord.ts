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
  visitDate: string; // ISO date string
  startTime?: string;
  endTime?: string;
  status: DailyVisitStatus;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  visitDate: string;
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
  visitDate?: string;
  startTime?: string;
  endTime?: string;
  status?: DailyVisitStatus;
  cancellationReason?: string;
  notes?: string;
}

/**
 * カレンダーイベント用の型定義
 */
export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: DailyVisitRecord;
}

/**
 * 日次訪問記録フォーム用の型定義
 */
export interface DailyVisitRecordFormData {
  patientId: number | '';
  hygienistId: number | '';
  visitDate: string;
  startTime: string;
  endTime: string;
  status: DailyVisitStatus;
  cancellationReason: string;
  notes: string;
}