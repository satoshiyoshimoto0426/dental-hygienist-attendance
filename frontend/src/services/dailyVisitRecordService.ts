import { 
  DailyVisitRecord, 
  CreateDailyVisitRecordInput, 
  UpdateDailyVisitRecordInput 
} from '../types/DailyVisitRecord';
import { ApiResult } from '../types/Api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * 日次訪問記録サービス
 */
export class DailyVisitRecordService {
  /**
   * 認証トークンを取得
   */
  private static getAuthToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証トークンが見つかりません');
    }
    return token;
  }

  /**
   * 日次訪問記録一覧を取得
   */
  static async getDailyVisitRecords(params?: {
    year?: number;
    month?: number;
    patientId?: number;
    hygienistId?: number;
  }): Promise<DailyVisitRecord[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.month) queryParams.append('month', params.month.toString());
      if (params?.patientId) queryParams.append('patientId', params.patientId.toString());
      if (params?.hygienistId) queryParams.append('hygienistId', params.hygienistId.toString());

      const url = `${API_BASE_URL}/api/daily-visit-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResult<DailyVisitRecord[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '日次訪問記録の取得に失敗しました');
      }

      return result.data;
    } catch (error) {
      console.error('日次訪問記録取得エラー:', error);
      throw error;
    }
  }

  /**
   * 日次訪問記録を取得
   */
  static async getDailyVisitRecord(id: number): Promise<DailyVisitRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-visit-records/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResult<DailyVisitRecord> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '日次訪問記録の取得に失敗しました');
      }

      return result.data;
    } catch (error) {
      console.error('日次訪問記録取得エラー:', error);
      throw error;
    }
  }

  /**
   * 日次訪問記録を作成
   */
  static async createDailyVisitRecord(input: CreateDailyVisitRecordInput): Promise<DailyVisitRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-visit-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResult<DailyVisitRecord> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '日次訪問記録の作成に失敗しました');
      }

      return result.data;
    } catch (error) {
      console.error('日次訪問記録作成エラー:', error);
      throw error;
    }
  }

  /**
   * 日次訪問記録を更新
   */
  static async updateDailyVisitRecord(id: number, input: UpdateDailyVisitRecordInput): Promise<DailyVisitRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-visit-records/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResult<DailyVisitRecord> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '日次訪問記録の更新に失敗しました');
      }

      return result.data;
    } catch (error) {
      console.error('日次訪問記録更新エラー:', error);
      throw error;
    }
  }

  /**
   * 日次訪問記録を削除
   */
  static async deleteDailyVisitRecord(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-visit-records/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResult<void> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '日次訪問記録の削除に失敗しました');
      }
    } catch (error) {
      console.error('日次訪問記録削除エラー:', error);
      throw error;
    }
  }

  /**
   * 月間統計を取得
   */
  static async getMonthlyStats(year: number, month: number): Promise<{
    totalVisits: number;
    patientStats: Array<{
      patientId: number;
      patientName: string;
      visitCount: number;
    }>;
    hygienistStats: Array<{
      hygienistId: number;
      hygienistName: string;
      visitCount: number;
    }>;
    dailyVisitRecords: DailyVisitRecord[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/daily-visit-records/stats/monthly?year=${year}&month=${month}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResult<any> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || '月間統計の取得に失敗しました');
      }

      return result.data;
    } catch (error) {
      console.error('月間統計取得エラー:', error);
      throw error;
    }
  }
}