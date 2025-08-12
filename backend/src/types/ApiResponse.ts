export interface ApiResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResult<T = any> = ApiResponse<T> | ApiError;

// エラーコード定数
export const ERROR_CODES = {
  // 認証関連
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // バリデーション関連
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // データベース関連
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // 一般的なエラー
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  
  // 業務固有エラー
  PATIENT_NOT_FOUND: 'PATIENT_NOT_FOUND',
  HYGIENIST_NOT_FOUND: 'HYGIENIST_NOT_FOUND',
  VISIT_RECORD_NOT_FOUND: 'VISIT_RECORD_NOT_FOUND',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  OVERLAPPING_VISIT: 'OVERLAPPING_VISIT'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// カスタムエラークラス
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, statusCode: number = 400, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

// よく使用されるエラーのファクトリー関数
export const createError = {
  unauthorized: (message: string = '認証が必要です') => 
    new AppError(ERROR_CODES.UNAUTHORIZED, message, 401),
  
  forbidden: (message: string = 'アクセス権限がありません') => 
    new AppError(ERROR_CODES.FORBIDDEN, message, 403),
  
  notFound: (resource: string = 'リソース') => 
    new AppError(ERROR_CODES.NOT_FOUND, `${resource}が見つかりません`, 404),
  
  validation: (message: string, details?: any) => 
    new AppError(ERROR_CODES.VALIDATION_ERROR, message, 400, details),
  
  duplicate: (resource: string) => 
    new AppError(ERROR_CODES.DUPLICATE_ENTRY, `${resource}は既に存在します`, 409),
  
  internal: (message: string = 'サーバー内部エラーが発生しました') => 
    new AppError(ERROR_CODES.INTERNAL_SERVER_ERROR, message, 500),
  
  patientNotFound: () => 
    new AppError(ERROR_CODES.PATIENT_NOT_FOUND, '患者が見つかりません', 404),
  
  hygienistNotFound: () => 
    new AppError(ERROR_CODES.HYGIENIST_NOT_FOUND, '歯科衛生士が見つかりません', 404),
  
  visitRecordNotFound: () => 
    new AppError(ERROR_CODES.VISIT_RECORD_NOT_FOUND, '訪問記録が見つかりません', 404),
  
  invalidDateRange: () => 
    new AppError(ERROR_CODES.INVALID_DATE_RANGE, '無効な日付範囲です', 400),
  
  overlappingVisit: () => 
    new AppError(ERROR_CODES.OVERLAPPING_VISIT, '重複する訪問予定があります', 409)
};