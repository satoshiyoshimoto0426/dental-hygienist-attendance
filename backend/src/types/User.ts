/**
 * ユーザーの役割
 */
export type UserRole = 'admin' | 'user';

/**
 * ユーザーデータの型定義
 */
export interface User {
  id: number;
  username: string;
  role: UserRole;
  hygienistId?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 認証用のユーザーデータの型定義（パスワードハッシュを含む）
 */
export interface UserWithPassword extends User {
  passwordHash: string;
}

/**
 * ユーザー作成時の入力データ型
 */
export interface CreateUserInput {
  username: string;
  password: string;
  role?: UserRole;
  hygienistId?: number;
}

/**
 * ユーザー更新時の入力データ型
 */
export interface UpdateUserInput {
  username?: string;
  password?: string;
  role?: UserRole;
  hygienistId?: number;
}

/**
 * データベースから取得したユーザーデータの型
 */
export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  role: UserRole;
  hygienist_id?: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * ログイン時の入力データ型
 */
export interface LoginInput {
  username: string;
  password: string;
}

/**
 * JWT ペイロードの型
 */
export interface JWTPayload {
  userId: number;
  username: string;
  role: UserRole;
  hygienistId?: number;
}