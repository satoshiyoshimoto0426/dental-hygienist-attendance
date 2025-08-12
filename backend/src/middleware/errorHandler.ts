import { Request, Response, NextFunction } from 'express';
import { AppError, ApiError, ERROR_CODES } from '../types/ApiResponse';

// エラーハンドリングミドルウェア
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ログ出力
  console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.path}:`, {
    error: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // AppErrorの場合
  if (err instanceof AppError) {
    const errorResponse: ApiError = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // バリデーションエラー（express-validator等）
  if (err.name === 'ValidationError') {
    const errorResponse: ApiError = {
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'バリデーションエラーが発生しました',
        details: err.message
      }
    };
    res.status(400).json(errorResponse);
    return;
  }

  // データベースエラー
  if (err.message.includes('duplicate key') || err.message.includes('UNIQUE constraint')) {
    const errorResponse: ApiError = {
      success: false,
      error: {
        code: ERROR_CODES.DUPLICATE_ENTRY,
        message: '重複するデータが存在します'
      }
    };
    res.status(409).json(errorResponse);
    return;
  }

  // JWTエラー
  if (err.name === 'JsonWebTokenError') {
    const errorResponse: ApiError = {
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: '無効なトークンです'
      }
    };
    res.status(401).json(errorResponse);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    const errorResponse: ApiError = {
      success: false,
      error: {
        code: ERROR_CODES.TOKEN_EXPIRED,
        message: 'トークンの有効期限が切れています'
      }
    };
    res.status(401).json(errorResponse);
    return;
  }

  // その他の予期しないエラー
  const errorResponse: ApiError = {
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'サーバー内部エラーが発生しました'
    }
  };
  res.status(500).json(errorResponse);
};

// 非同期エラーをキャッチするためのラッパー関数
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 成功レスポンスのヘルパー関数
export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

// エラーレスポンスのヘルパー関数
export const sendError = (res: Response, error: AppError) => {
  const errorResponse: ApiError = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    }
  };
  res.status(error.statusCode).json(errorResponse);
};