import { Request, Response } from 'express';
import { HygienistReportModel } from '../models/HygienistReport';
import { CsvExportService } from '../services/csvExportService';

/**
 * 歯科衛生士別レポートコントローラー
 */
export class HygienistReportController {
  /**
   * 歯科衛生士別月間統計を取得
   */
  static async getHygienistMonthlyStats(req: Request, res: Response): Promise<void> {
    try {
      const hygienistId = parseInt(req.params.hygienistId);
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      // パラメータバリデーション
      if (isNaN(hygienistId) || isNaN(year) || isNaN(month)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: '歯科衛生士ID、年、月は数値である必要があります'
          }
        });
        return;
      }

      if (month < 1 || month > 12) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MONTH',
            message: '月は1から12の間で指定してください'
          }
        });
        return;
      }

      if (year < 2000 || year > 2100) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_YEAR',
            message: '年は2000から2100の間で指定してください'
          }
        });
        return;
      }

      const stats = await HygienistReportModel.getHygienistMonthlyStats({
        hygienistId,
        year,
        month
      });

      if (!stats) {
        res.status(404).json({
          success: false,
          error: {
            code: 'HYGIENIST_NOT_FOUND',
            message: '指定された歯科衛生士が見つかりません'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('歯科衛生士別月間統計取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '歯科衛生士別月間統計の取得に失敗しました'
        }
      });
    }
  }

  /**
   * 複数歯科衛生士の月間統計比較を取得
   */
  static async getHygienistComparisonReport(req: Request, res: Response): Promise<void> {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      // パラメータバリデーション
      if (isNaN(year) || isNaN(month)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: '年、月は数値である必要があります'
          }
        });
        return;
      }

      if (month < 1 || month > 12) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MONTH',
            message: '月は1から12の間で指定してください'
          }
        });
        return;
      }

      if (year < 2000 || year > 2100) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_YEAR',
            message: '年は2000から2100の間で指定してください'
          }
        });
        return;
      }

      const report = await HygienistReportModel.getHygienistComparisonReport(year, month);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('歯科衛生士比較レポート取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '歯科衛生士比較レポートの取得に失敗しました'
        }
      });
    }
  }

  /**
   * 歯科衛生士の年間統計を取得
   */
  static async getHygienistYearlyStats(req: Request, res: Response): Promise<void> {
    try {
      const hygienistId = parseInt(req.params.hygienistId);
      const year = parseInt(req.query.year as string);

      // パラメータバリデーション
      if (isNaN(hygienistId) || isNaN(year)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: '歯科衛生士ID、年は数値である必要があります'
          }
        });
        return;
      }

      if (year < 2000 || year > 2100) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_YEAR',
            message: '年は2000から2100の間で指定してください'
          }
        });
        return;
      }

      const stats = await HygienistReportModel.getHygienistYearlyStats(hygienistId, year);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('歯科衛生士年間統計取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '歯科衛生士年間統計の取得に失敗しました'
        }
      });
    }
  }

  /**
   * 歯科衛生士別レポートをCSV形式で出力
   */
  static async exportHygienistReportCsv(req: Request, res: Response): Promise<void> {
    try {
      const hygienistId = parseInt(req.params.hygienistId);
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);

      // パラメータバリデーション
      if (isNaN(hygienistId) || isNaN(year) || isNaN(month)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: '歯科衛生士ID、年、月は数値である必要があります'
          }
        });
        return;
      }

      if (month < 1 || month > 12) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_MONTH',
            message: '月は1から12の間で指定してください'
          }
        });
        return;
      }

      if (year < 2000 || year > 2100) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_YEAR',
            message: '年は2000から2100の間で指定してください'
          }
        });
        return;
      }

      const stats = await HygienistReportModel.getHygienistMonthlyStats({
        hygienistId,
        year,
        month
      });

      if (!stats) {
        res.status(404).json({
          success: false,
          error: {
            code: 'HYGIENIST_NOT_FOUND',
            message: '指定された歯科衛生士が見つかりません'
          }
        });
        return;
      }

      const csvData = CsvExportService.convertHygienistReportToCsv(stats);
      const filename = `歯科衛生士別レポート_${stats.hygienistName}_${year}年${month}月.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvData, 'utf8'));

      // BOMを追加してExcelで正しく表示されるようにする
      res.write('\uFEFF');
      res.end(csvData);
    } catch (error) {
      console.error('歯科衛生士別レポートCSV出力エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: '歯科衛生士別レポートのCSV出力に失敗しました'
        }
      });
    }
  }
}