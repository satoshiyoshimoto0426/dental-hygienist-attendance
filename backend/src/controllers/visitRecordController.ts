import { Request, Response } from 'express';
import { VisitRecordModel } from '../models/VisitRecord';
import { CreateVisitRecordInput, UpdateVisitRecordInput } from '../types/VisitRecord';

/**
 * 訪問記録コントローラー
 */
export class VisitRecordController {
  /**
   * 訪問記録一覧を取得
   */
  static async getVisitRecords(req: Request, res: Response): Promise<void> {
    try {
      const { year, month, patientId, hygienistId } = req.query;

      let visitRecords;

      if (year && month) {
        // 月間訪問記録を取得
        visitRecords = await VisitRecordModel.findByMonth(
          parseInt(year as string),
          parseInt(month as string)
        );
      } else if (patientId) {
        // 患者別訪問記録を取得
        visitRecords = await VisitRecordModel.findByPatientId(
          parseInt(patientId as string),
          year ? parseInt(year as string) : undefined,
          month ? parseInt(month as string) : undefined
        );
      } else if (hygienistId) {
        // 歯科衛生士別訪問記録を取得
        visitRecords = await VisitRecordModel.findByHygienistId(
          parseInt(hygienistId as string),
          year ? parseInt(year as string) : undefined,
          month ? parseInt(month as string) : undefined
        );
      } else {
        // 全訪問記録を取得
        visitRecords = await VisitRecordModel.findAll();
      }

      res.json({
        success: true,
        data: visitRecords
      });
    } catch (error) {
      console.error('訪問記録一覧取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VISIT_RECORD_FETCH_ERROR',
          message: error instanceof Error ? error.message : '訪問記録の取得に失敗しました'
        }
      });
    }
  }

  /**
   * 訪問記録を取得
   */
  static async getVisitRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const visitRecord = await VisitRecordModel.findById(parseInt(id));

      if (!visitRecord) {
        res.status(404).json({
          success: false,
          error: {
            code: 'VISIT_RECORD_NOT_FOUND',
            message: '指定された訪問記録が見つかりません'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: visitRecord
      });
    } catch (error) {
      console.error('訪問記録取得エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VISIT_RECORD_FETCH_ERROR',
          message: error instanceof Error ? error.message : '訪問記録の取得に失敗しました'
        }
      });
    }
  }

  /**
   * 訪問記録を作成
   */
  static async createVisitRecord(req: Request, res: Response): Promise<void> {
    try {
      const input: CreateVisitRecordInput = {
        patientId: req.body.patientId,
        hygienistId: req.body.hygienistId,
        visitDate: new Date(req.body.visitDate),
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        status: req.body.status || 'completed',
        cancellationReason: req.body.cancellationReason,
        notes: req.body.notes
      };

      const visitRecord = await VisitRecordModel.create(input);

      res.status(201).json({
        success: true,
        data: visitRecord
      });
    } catch (error) {
      console.error('訪問記録作成エラー:', error);
      
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
          code: 'VISIT_RECORD_CREATE_ERROR',
          message: error instanceof Error ? error.message : '訪問記録の作成に失敗しました'
        }
      });
    }
  }

  /**
   * 訪問記録を更新
   */
  static async updateVisitRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const input: UpdateVisitRecordInput = {};

      // 更新するフィールドのみを設定
      if (req.body.patientId !== undefined) input.patientId = req.body.patientId;
      if (req.body.hygienistId !== undefined) input.hygienistId = req.body.hygienistId;
      if (req.body.visitDate !== undefined) input.visitDate = new Date(req.body.visitDate);
      if (req.body.startTime !== undefined) input.startTime = req.body.startTime;
      if (req.body.endTime !== undefined) input.endTime = req.body.endTime;
      if (req.body.status !== undefined) input.status = req.body.status;
      if (req.body.cancellationReason !== undefined) input.cancellationReason = req.body.cancellationReason;
      if (req.body.notes !== undefined) input.notes = req.body.notes;

      const visitRecord = await VisitRecordModel.update(parseInt(id), input);

      if (!visitRecord) {
        res.status(404).json({
          success: false,
          error: {
            code: 'VISIT_RECORD_NOT_FOUND',
            message: '指定された訪問記録が見つかりません'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: visitRecord
      });
    } catch (error) {
      console.error('訪問記録更新エラー:', error);
      
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
          code: 'VISIT_RECORD_UPDATE_ERROR',
          message: error instanceof Error ? error.message : '訪問記録の更新に失敗しました'
        }
      });
    }
  }

  /**
   * 訪問記録を削除
   */
  static async deleteVisitRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await VisitRecordModel.delete(parseInt(id));

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'VISIT_RECORD_NOT_FOUND',
            message: '指定された訪問記録が見つかりません'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '訪問記録を削除しました'
      });
    } catch (error) {
      console.error('訪問記録削除エラー:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VISIT_RECORD_DELETE_ERROR',
          message: error instanceof Error ? error.message : '訪問記録の削除に失敗しました'
        }
      });
    }
  }

  /**
   * 月間訪問統計を取得
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

      const visitRecords = await VisitRecordModel.findByMonth(
        parseInt(year as string),
        parseInt(month as string)
      );

      // 患者別統計
      const patientStats = visitRecords.reduce((acc, record) => {
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
      const hygienistStats = visitRecords.reduce((acc, record) => {
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
          totalVisits: visitRecords.filter(r => r.status === 'completed').length,
          patientStats: Object.values(patientStats),
          hygienistStats: Object.values(hygienistStats),
          visitRecords
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