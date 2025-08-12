import { 
  PatientMonthlyStats, 
  PatientReportParams, 
  PatientComparisonReport 
} from '../types/PatientReport';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * 患者別レポートサービス
 */
export class PatientReportService {
  /**
   * 患者別月間統計を取得
   */
  static async getPatientMonthlyStats(params: PatientReportParams): Promise<PatientMonthlyStats> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/patient-reports/${params.patientId}/monthly?year=${params.year}&month=${params.month}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '患者別月間統計の取得に失敗しました');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('患者別月間統計取得エラー:', error);
      throw error;
    }
  }

  /**
   * 患者別年間統計を取得
   */
  static async getPatientYearlyStats(patientId: number, year: number): Promise<PatientMonthlyStats[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/patient-reports/${patientId}/yearly?year=${year}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '患者別年間統計の取得に失敗しました');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('患者別年間統計取得エラー:', error);
      throw error;
    }
  }

  /**
   * 複数患者の月間統計比較を取得
   */
  static async getPatientComparisonReport(year: number, month: number): Promise<PatientComparisonReport> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/patient-reports/comparison?year=${year}&month=${month}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '患者比較レポートの取得に失敗しました');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('患者比較レポート取得エラー:', error);
      throw error;
    }
  }
}