import api from './api';

/**
 * CSV出力サービス
 */
export class CsvExportService {
  /**
   * 患者別レポートをCSV形式で出力
   */
  static async exportPatientReport(params: {
    patientId: number;
    year: number;
    month: number;
  }): Promise<void> {
    try {
      const response = await api.get(
        `/patient-reports/${params.patientId}/csv`,
        {
          params: {
            year: params.year,
            month: params.month
          },
          responseType: 'blob'
        }
      );

      // ファイル名をレスポンスヘッダーから取得
      const contentDisposition = response.headers['content-disposition'];
      let filename = `患者別レポート_${params.year}年${params.month}月.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]+)['"]?/);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Blobからダウンロードリンクを作成
      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('患者別レポートCSV出力エラー:', error);
      throw new Error('患者別レポートのCSV出力に失敗しました');
    }
  }

  /**
   * 歯科衛生士別レポートをCSV形式で出力
   */
  static async exportHygienistReport(params: {
    hygienistId: number;
    year: number;
    month: number;
  }): Promise<void> {
    try {
      const response = await api.get(
        `/hygienist-reports/hygienist/${params.hygienistId}/csv`,
        {
          params: {
            year: params.year,
            month: params.month
          },
          responseType: 'blob'
        }
      );

      // ファイル名をレスポンスヘッダーから取得
      const contentDisposition = response.headers['content-disposition'];
      let filename = `歯科衛生士別レポート_${params.year}年${params.month}月.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";]+)['"]?/);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Blobからダウンロードリンクを作成
      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('歯科衛生士別レポートCSV出力エラー:', error);
      throw new Error('歯科衛生士別レポートのCSV出力に失敗しました');
    }
  }
}