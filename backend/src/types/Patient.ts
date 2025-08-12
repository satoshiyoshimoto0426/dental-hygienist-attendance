/**
 * 患者データの型定義
 */
export interface Patient {
  id: number;
  patientId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 患者作成時の入力データ型
 */
export interface CreatePatientInput {
  patientId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * 患者更新時の入力データ型
 */
export interface UpdatePatientInput {
  patientId?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * データベースから取得した患者データの型
 */
export interface PatientRow {
  id: number;
  patient_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: Date;
  updated_at: Date;
}