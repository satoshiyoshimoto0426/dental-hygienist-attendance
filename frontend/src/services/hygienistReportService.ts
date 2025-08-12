import { 
  HygienistMonthlyStats, 
  HygienistComparisonReport,
  HygienistReportParams 
} from '../types/HygienistReport';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * 歯科衛生士別レポートサービス
 */
export class HygienistReportService {
  /**
   * 歯科衛生士別月間統計を取得
   */
  static async getHygienistMonthlyStats(params: HygienistReportParams): Promise<HygienistMonthlyStats> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証トークンが見つかりません');
    }

    const response = await fetch(
      `${API_BASE_URL}/hygienist-reports/hygienist/${params.hygienistId}/monthly?year=${params.year}&month=${params.month}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '歯科衛生士別月間統計の取得に失敗しました');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * 歯科衛生士別年間統計を取得
   */
  static async getHygienistYearlyStats(hygienistId: number, year: number): Promise<HygienistMonthlyStats[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証トークンが見つかりません');
    }

    const response = await fetch(
      `${API_BASE_URL}/hygienist-reports/hygienist/${hygienistId}/yearly?year=${year}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '歯科衛生士別年間統計の取得に失敗しました');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * 複数歯科衛生士の月間統計比較を取得
   */
  static async getHygienistComparisonReport(year: number, month: number): Promise<HygienistComparisonReport> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('認証トークンが見つかりません');
    }

    const response = await fetch(
      `${API_BASE_URL}/hygienist-reports/hygienist-comparison?year=${year}&month=${month}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || '歯科衛生士比較レポートの取得に失敗しました');
    }

    const data = await response.json();
    return data.data;
  }
}