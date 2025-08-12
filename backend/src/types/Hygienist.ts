/**
 * 歯科衛生士データの型定義
 */
export interface Hygienist {
  id: number;
  staffId: string;
  name: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 歯科衛生士作成時の入力データ型
 */
export interface CreateHygienistInput {
  staffId: string;
  name: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
}

/**
 * 歯科衛生士更新時の入力データ型
 */
export interface UpdateHygienistInput {
  staffId?: string;
  name?: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
}

/**
 * データベースから取得した歯科衛生士データの型
 */
export interface HygienistRow {
  id: number;
  staff_id: string;
  name: string;
  license_number?: string;
  phone?: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}