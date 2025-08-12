import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError, ERROR_CODES } from '../types/ApiResponse';

/**
 * バリデーションミドルウェアのファクトリー関数
 */
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { 
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      const appError = new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'バリデーションエラーが発生しました',
        400,
        validationErrors
      );

      return next(appError);
    }

    // バリデーション済みのデータで置き換え
    req[source] = value;
    next();
  };
};

/**
 * カスタムバリデーション関数
 */
export const customValidations = {
  /**
   * 時間範囲のバリデーション
   */
  validateTimeRange: (startTime?: string, endTime?: string): string | null => {
    if (!startTime || !endTime) return null;
    
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    if (end <= start) {
      return '終了時間は開始時間より後に設定してください';
    }
    
    return null;
  },

  /**
   * 日付範囲のバリデーション
   */
  validateDateRange: (startDate?: string, endDate?: string): string | null => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '有効な日付を入力してください';
    }
    
    if (end < start) {
      return '終了日は開始日以降に設定してください';
    }
    
    return null;
  },

  /**
   * キャンセル理由の必須チェック
   */
  validateCancellationReason: (status?: string, cancellationReason?: string): string | null => {
    if (status === 'cancelled' && (!cancellationReason || cancellationReason.trim() === '')) {
      return 'キャンセル理由を入力してください';
    }
    return null;
  }
};

/**
 * 日次訪問記録の追加バリデーション
 */
export const validateDailyVisitRecord = (req: Request, res: Response, next: NextFunction) => {
  const { startTime, endTime, status, cancellationReason } = req.body;

  const errors: string[] = [];

  // 時間範囲のバリデーション
  const timeRangeError = customValidations.validateTimeRange(startTime, endTime);
  if (timeRangeError) {
    errors.push(timeRangeError);
  }

  // キャンセル理由のバリデーション
  const cancellationError = customValidations.validateCancellationReason(status, cancellationReason);
  if (cancellationError) {
    errors.push(cancellationError);
  }

  if (errors.length > 0) {
    const appError = new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'バリデーションエラーが発生しました',
      400,
      errors
    );
    return next(appError);
  }

  next();
};

/**
 * 月次レポートの日付範囲バリデーション
 */
export const validateReportDateRange = (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    const dateRangeError = customValidations.validateDateRange(
      startDate as string, 
      endDate as string
    );
    
    if (dateRangeError) {
      const appError = new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        dateRangeError,
        400
      );
      return next(appError);
    }
  }

  next();
};

/**
 * IDパラメータのバリデーション
 */
export const validateIdParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const numericId = parseInt(id, 10);

    if (isNaN(numericId) || numericId <= 0) {
      const appError = new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `無効な${paramName}です`,
        400
      );
      return next(appError);
    }

    // 数値に変換してparamsに設定
    req.params[paramName] = numericId.toString();
    next();
  };
};

/**
 * ページネーションパラメータのバリデーション
 */
export const validatePaginationParams = (req: Request, res: Response, next: NextFunction) => {
  const { page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    const appError = new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      'ページ番号は1以上の数値である必要があります',
      400
    );
    return next(appError);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    const appError = new AppError(
      ERROR_CODES.VALIDATION_ERROR,
      '取得件数は1から100の間の数値である必要があります',
      400
    );
    return next(appError);
  }

  req.query.page = pageNum.toString();
  req.query.limit = limitNum.toString();
  next();
};