import { Request, Response } from 'express';
import { DailyVisitRecordModel } from '../models/DailyVisitRecord';
import { CreateDailyVisitRecordInput, UpdateDailyVisitRecordInput } from '../types/DailyVisitRecord';

/**
 * 日次訪問記録コントローラー
 */
export class DailyVisitRecordController {
  /**
   * 日次訪問記録一覧を取得
   */
  static async getDailyVisitRecords(req: Request, res: Response): Promise<void> {
    try {
      const { year, month, patientId, hygienistId } = req.query;

      let dailyVisitRecords;

      if (year && month) {
        // 月間日次訪問記録を取得
        dailyVisitRecords = await DailyVisitRecordModel.findByMonth(
          parseInt(year as string),
          parseInt(month as string)
        );
      } else if (patientId) {
        // 患者別日次訪問記録を取得
        dailyVisitRecords = await DailyVisitRecordModel.findByPatientId(
          parseInt(patientId as string),
          year ? parseInt(year as string) : undefined,
          month ? parseInt(month as string) : undefined
        );
      } else if (hygienistId) {
        // 歯科衛生士別日次訪問記録を取得
        dailyVisitRecords = await DailyVisitRecordModel.findByHygienistId(
          parseInt(hygienistId as string),
          year ? parseInt(year as string) : undefined,
          month ? parseInt(month as string) : undefined
        );
      } else {
        // 全日次訪問記録を取得
        dailyVisitRecords = await DailyVisitRecordModel.findAll();
      }

      res.json({
        success: true,
        data: dailyVisitRecords
      });
    } catch (error) {
      console.error('日次訪問記録一覧取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DAILY_VISIT_RECORD_FETCH_ERROR',
          message: error instanceof Error ? error.message : '日次訪問記録の取得に失敗しました'
        }
      });
    }
  }

  /**
   * 日次訪問記録を取得
   */
  static async getDailyVisitRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dailyVisitRecord = await DailyVisitRecordModel.findById(parseInt(id));

      if (!dailyVisitRecord) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DAILY_VISIT_RECORD_NOT_FOUND',
            message: '指定された日次訪問記録が見つかりません'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: dailyVisitRecord
      });
    } catch (error) {
      console.error('日次訪問記録取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DAILY_VISIT_RECORD_FETCH_ERROR',
          message: error instanceof Error ? error.message : '日次訪問記録の取得に失敗しました'
        }
      });
    }
  }

  /**
   * 日次訪問記録を作成
   */
  static async createDailyVisitRecord(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateDailyVisitRecordInput = {
        patientId: req.body.patientId,
        hygienistId: req.body.hygienistId,
        visitDate: new Date(req.body.visitDate),
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        status: req.body.status || 'completed',
        cancellationReason: req.body.cancellationReason,
        notes: req.body.notes
      };

      const dailyVisitRecord = await DailyVisitRecordModel.create(input);

      res.status(201).json({
        success: true,
        data: dailyVisitRecord
      });
    } catch (error) {
      console.error('日次訪問記録作成エラー:', error);
      
      if (error instanceof Error && error.message.includes('バリデーションエラー')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          }
        });
        return;
      }

      if (error instanceof Error && (
        error.message.includes('患者が存在しません') ||
        error.message.includes('歯科衛生士が存在しません') ||
        error.message.includes('時間')
      )) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: error.message
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'DAILY_VISIT_RECORD_CREATE_ERROR',
          message: error instanceof Error ? error.message : '日次訪問記録の作成に失敗しました'
        }
      });
    }
  }

  /**
   * 日次訪問記録を更新
   */
  static async updateDailyVisitRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateDailyVisitRecordInput = {};

      // 更新するフィールドのみを設定
      if (req.body.patientId !== undefined) input.patientId = req.body.patientId;
      if (req.body.hygienistId !== undefined) input.hygienistId = req.body.hygienistId;
      if (req.body.visitDate !== undefined) input.visitDate = new Date(req.body.visitDate);
      if (req.body.startTime !== undefined) input.startTime = req.body.startTime;
      if (req.body.endTime !== undefined) input.endTime = req.body.endTime;
      if (req.body.status !== undefined) input.status = req.body.status;
      if (req.body.cancellationReason !== undefined) input.cancellationReason = req.body.cancellationReason;
      if (req.body.notes !== undefined) input.notes = req.body.notes;

      const dailyVisitRecord = await DailyVisitRecordModel.update(parseInt(id), input);

      if (!dailyVisitRecord) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DAILY_VISIT_RECORD_NOT_FOUND',
            message: '指定された日次訪問記録が見つかりません'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: dailyVisitRecord
      });
    } catch (error) {
      console.error('日次訪問記録更新エラー:', error);
      
      if (error instanceof Error && error.message.includes('バリデーションエラー')) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message
          }
        });
        return;
      }

      if (error instanceof Error && (
        error.message.includes('患者が存在しません') ||
        error.message.includes('歯科衛生士が存在しません') ||
        error.message.includes('時間')
      )) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: error.message
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'DAILY_VISIT_RECORD_UPDATE_ERROR',
          message: error instanceof Error ? error.message : '日次訪問記録の更新に失敗しました'
        }
      });
    }
  }

  /**
   * 日次訪問記録を削除
   */
  static async deleteDailyVisitRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await DailyVisitRecordModel.delete(parseInt(id));

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DAILY_VISIT_RECORD_NOT_FOUND',
            message: '指定された日次訪問記録が見つかりません'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '日次訪問記録を削除しました'
      });
    } catch (error) {
      console.error('日次訪問記録削除エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DAILY_VISIT_RECORD_DELETE_ERROR',
          message: error instanceof Error ? error.message : '日次訪問記録の削除に失敗しました'
        }
      });
    }
  }

  /**
   * 月間統計を取得
   */
  static async getMonthlyStats(req: Request, res: Response): Promise<void> {
    try {
      const { year, month } = req.query;

      if (!year || !month) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: '年と月のパラメータが必要です'
          }
        });
        return;
      }

      const dailyVisitRecords = await DailyVisitRecordModel.findByMonth(
        parseInt(year as string),
        parseInt(month as string)
      );

      // 患者別統計
      const patientStats = dailyVisitRecords.reduce((acc, record) => {
        if (record.status === 'completed') {
          const patientId = record.patientId;
          if (!acc[patientId]) {
            acc[patientId] = {
              patientId,
              patientName: record.patient?.name || '',
              visitCount: 0
            };
          }
          acc[patientId].visitCount++;
        }
        return acc;
      }, {} as Record<number, any>);

      // 歯科衛生士別統計
      const hygienistStats = dailyVisitRecords.reduce((acc, record) => {
        if (record.status === 'completed') {
          const hygienistId = record.hygienistId;
          if (!acc[hygienistId]) {
            acc[hygienistId] = {
              hygienistId,
              hygienistName: record.hygienist?.name || '',
              visitCount: 0
            };
          }
          acc[hygienistId].visitCount++;
        }
        return acc;
      }, {} as Record<number, any>);

      res.json({
        success: true,
        data: {
          totalVisits: dailyVisitRecords.filter(r => r.status === 'completed').length,
          patientStats: Object.values(patientStats),
          hygienistStats: Object.values(hygienistStats),
          dailyVisitRecords
        }
      });
    } catch (error) {
      console.error('月間統計取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MONTHLY_STATS_ERROR',
          message: error instanceof Error ? error.message : '月間統計の取得に失敗しました'
        }
      });
    }
  }
}