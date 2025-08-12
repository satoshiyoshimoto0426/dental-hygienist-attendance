import { Patient } from './Patient';
import { Hygienist } from './Hygienist';

export type VisitStatus = 'scheduled' | 'completed' | 'cancelled';

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

export interface CreateVisitRecordRequest {
  patientId: number;
  hygienistId: number;
  visitDate: string;
  startTime?: string;
  endTime?: string;
  status: VisitStatus;
  cancellationReason?: string;
  notes?: string;
}

export interface UpdateVisitRecordRequest extends Partial<CreateVisitRecordRequest> {
  id: number;
}