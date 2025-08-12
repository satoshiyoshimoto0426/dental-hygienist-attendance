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

// エラーコード定数（バックエンドと同期）
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
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // 業務固有エラー
  PATIENT_NOT_FOUND: 'PATIENT_NOT_FOUND',
  HYGIENIST_NOT_FOUND: 'HYGIENIST_NOT_FOUND',
  VISIT_RECORD_NOT_FOUND: 'VISIT_RECORD_NOT_FOUND',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  OVERLAPPING_VISIT: 'OVERLAPPING_VISIT'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];