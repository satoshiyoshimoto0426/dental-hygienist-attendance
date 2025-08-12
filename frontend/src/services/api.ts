import axios, { AxiosError } from 'axios';
import { ApiResponse, ApiError } from '../types/Api';
import { config, shouldLog } from '../config/environment';

// エラーメッセージのマッピング
const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: '認証が必要です。再度ログインしてください。',
  FORBIDDEN: 'この操作を実行する権限がありません。',
  TOKEN_EXPIRED: 'セッションの有効期限が切れました。再度ログインしてください。',
  INVALID_CREDENTIALS: 'ユーザー名またはパスワードが正しくありません。',
  VALIDATION_ERROR: '入力内容に不備があります。',
  REQUIRED_FIELD_MISSING: '必須項目が入力されていません。',
  INVALID_FORMAT: '入力形式が正しくありません。',
  NOT_FOUND: '指定されたデータが見つかりません。',
  DUPLICATE_ENTRY: '既に存在するデータです。',
  DATABASE_ERROR: 'データベースエラーが発生しました。',
  INTERNAL_SERVER_ERROR: 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。',
  BAD_REQUEST: '不正なリクエストです。',
  PATIENT_NOT_FOUND: '患者が見つかりません。',
  HYGIENIST_NOT_FOUND: '歯科衛生士が見つかりません。',
  VISIT_RECORD_NOT_FOUND: '訪問記録が見つかりません。',
  INVALID_DATE_RANGE: '日付の範囲が正しくありません。',
  OVERLAPPING_VISIT: '重複する訪問予定があります。'
};

// カスタムエラークラス
export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: string, message: string, statusCode: number, details?: any) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiClientError';
  }
}

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒のタイムアウト
  withCredentials: false,
});

// リクエストインターセプター（認証トークンの追加）
apiClient.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    // 開発環境でのリクエストログ
    if (shouldLog('debug')) {
      console.log(`API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }
    
    return requestConfig;
  },
  (error) => {
    if (shouldLog('error')) {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // ネットワークエラーの場合
    if (!error.response) {
      const networkError = new ApiClientError(
        'NETWORK_ERROR',
        'ネットワークエラーが発生しました。インターネット接続を確認してください。',
        0
      );
      return Promise.reject(networkError);
    }

    // タイムアウトエラーの場合
    if (error.code === 'ECONNABORTED') {
      const timeoutError = new ApiClientError(
        'TIMEOUT_ERROR',
        'リクエストがタイムアウトしました。しばらく時間をおいて再度お試しください。',
        408
      );
      return Promise.reject(timeoutError);
    }

    const response = error.response;
    const statusCode = response.status;

    // APIエラーレスポンスの場合
    if (response.data && typeof response.data === 'object' && 'error' in response.data) {
      const apiError = response.data as ApiError;
      const userFriendlyMessage = ERROR_MESSAGES[apiError.error.code] || apiError.error.message;
      
      const clientError = new ApiClientError(
        apiError.error.code,
        userFriendlyMessage,
        statusCode,
        apiError.error.details
      );

      // 認証エラーの場合、ローカルストレージをクリアしてログインページにリダイレクト
      if (statusCode === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        // 現在のページがログインページでない場合のみリダイレクト
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      return Promise.reject(clientError);
    }

    // その他のHTTPエラー
    let message = 'エラーが発生しました。';
    switch (statusCode) {
      case 400:
        message = '不正なリクエストです。';
        break;
      case 403:
        message = 'この操作を実行する権限がありません。';
        break;
      case 404:
        message = '指定されたリソースが見つかりません。';
        break;
      case 500:
        message = 'サーバーエラーが発生しました。';
        break;
      case 503:
        message = 'サービスが一時的に利用できません。';
        break;
    }

    const httpError = new ApiClientError(
      'HTTP_ERROR',
      message,
      statusCode
    );

    return Promise.reject(httpError);
  }
);

// APIリクエストのヘルパー関数
export const apiRequest = {
  get: async <T>(url: string, params?: any): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  },

  post: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data.data;
  },

  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data.data;
  }
};

export const api = apiClient;
export default apiClient;