import { Request, Response } from 'express';
import { PatientReportModel } from '../models/PatientReport';
import { CsvExportService } from '../services/csvExportService';

/**
 * 患者別レポートコントローラー
 */
export class PatientReportController {
  /**
   * 患者別月間統計を取得
   */
  static async getPatientMonthlyStats(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.patientId);
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      // パラメータバリデーション
      if (isNaN(patientId) || isNaN(year) || isNaN(month)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: '患者ID、年、月は数値である必要があります'
          }
        });
      }

      if (month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MONTH',
            message: '月は1から12の間で指定してください'
          }
        });
      }

      if (year < 2000 || year > 2100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_YEAR',
            message: '年は2000から2100の間で指定してください'
          }
        });
      }

      const stats = await PatientReportModel.getPatientMonthlyStats({
        patientId,
        year,
        month
      });

      if (!stats) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: '指定された患者が見つかりません'
          }
        });
      }

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('患者別月間統計取得エラー:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '患者別月間統計の取得に失敗しました'
        }
      });
    }
  }

  /**
   * 複数患者の月間統計比較を取得
   */
  static async getPatientComparisonReport(req: Request, res: Response) {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      // パラメータバリデーション
      if (isNaN(year) || isNaN(month)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: '年、月は数値である必要があります'
          }
        });
      }

      if (month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MONTH',
            message: '月は1から12の間で指定してください'
          }
        });
      }

      if (year < 2000 || year > 2100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_YEAR',
            message: '年は2000から2100の間で指定してください'
          }
        });
      }

      const report = await PatientReportModel.getPatientComparisonReport(year, month);

      return res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('患者比較レポート取得エラー:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '患者比較レポートの取得に失敗しました'
        }
      });
    }
  }

  /**
   * 患者の年間統計を取得
   */
  static async getPatientYearlyStats(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.patientId);
      const year = parseInt(req.query.year as string);

      // パラメータバリデーション
      if (isNaN(patientId) || isNaN(year)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: '患者ID、年は数値である必要があります'
          }
        });
      }

      if (year < 2000 || year > 2100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_YEAR',
            message: '年は2000から2100の間で指定してください'
          }
        });
      }

      const stats = await PatientReportModel.getPatientYearlyStats(patientId, year);

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('患者年間統計取得エラー:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '患者年間統計の取得に失敗しました'
        }
      });
    }
  }

  /**
   * 患者別レポートをCSV形式で出力
   */
  static async exportPatientReportCsv(req: Request, res: Response) {
    try {
      const patientId = parseInt(req.params.patientId);
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      // パラメータバリデーション
      if (isNaN(patientId) || isNaN(year) || isNaN(month)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: '患者ID、年、月は数値である必要があります'
          }
        });
      }

      if (month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MONTH',
            message: '月は1から12の間で指定してください'
          }
        });
      }

      if (year < 2000 || year > 2100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_YEAR',
            message: '年は2000から2100の間で指定してください'
          }
        });
      }

      const stats = await PatientReportModel.getPatientMonthlyStats({
        patientId,
        year,
        month
      });

      if (!stats) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PATIENT_NOT_FOUND',
            message: '指定された患者が見つかりません'
          }
        });
      }

      const csvData = CsvExportService.convertPatientReportToCsv(stats);
      const filename = `患者別レポート_${stats.patientName}_${year}年${month}月.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvData, 'utf8'));

      // BOMを追加してExcelで正しく表示されるようにする
      res.write('\uFEFF');
      return res.end(csvData);
    } catch (error) {
      console.error('患者別レポートCSV出力エラー:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '患者別レポートのCSV出力に失敗しました'
        }
      });
    }
  }
}