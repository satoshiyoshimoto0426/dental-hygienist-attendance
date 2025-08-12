import { Request, Response, NextFunction } from 'express';
import { errorHandler, asyncHandler, sendSuccess, sendError } from '../errorHandler';
import { AppError, ERROR_CODES } from '../../types/ApiResponse';

// モックの作成
const mockRequest = () => ({
  method: 'GET',
  path: '/test',
  body: {},
  params: {},
  query: {}
}) as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('errorHandler', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    jest.clearAllMocks();
    // console.errorをモック
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('AppErrorを適切に処理する', () => {
    const appError = new AppError(ERROR_CODES.VALIDATION_ERROR, 'バリデーションエラー', 400, { field: 'name' });
    
    errorHandler(appError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'バリデーションエラー',
        details: { field: 'name' }
      }
    });
  });

  it('ValidationErrorを適切に処理する', () => {
    const validationError = new Error('Required field missing');
    validationError.name = 'ValidationError';
    
    errorHandler(validationError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'バリデーションエラーが発生しました',
        details: 'Required field missing'
      }
    });
  });

  it('重複キーエラーを適切に処理する', () => {
    const duplicateError = new Error('duplicate key value violates unique constraint');
    
    errorHandler(duplicateError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: ERROR_CODES.DUPLICATE_ENTRY,
        message: '重複するデータが存在します'
      }
    });
  });

  it('JWTエラーを適切に処理する', () => {
    const jwtError = new Error('invalid token');
    jwtError.name = 'JsonWebTokenError';
    
    errorHandler(jwtError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: '無効なトークンです'
      }
    });
  });

  it('トークン期限切れエラーを適切に処理する', () => {
    const expiredError = new Error('jwt expired');
    expiredError.name = 'TokenExpiredError';
    
    errorHandler(expiredError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: ERROR_CODES.TOKEN_EXPIRED,
        message: 'トークンの有効期限が切れています'
      }
    });
  });

  it('予期しないエラーを適切に処理する', () => {
    const unknownError = new Error('Something went wrong');
    
    errorHandler(unknownError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'サーバー内部エラーが発生しました'
      }
    });
  });
});

describe('asyncHandler', () => {
  it('非同期関数の成功を適切に処理する', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;

    const asyncFunction = jest.fn().mockResolvedValue('success');
    const wrappedFunction = asyncHandler(asyncFunction);

    await wrappedFunction(req, res, next);

    expect(asyncFunction).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('非同期関数のエラーをnextに渡す', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;

    const error = new Error('Async error');
    const asyncFunction = jest.fn().mockRejectedValue(error);
    const wrappedFunction = asyncHandler(asyncFunction);

    await wrappedFunction(req, res, next);

    expect(asyncFunction).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('sendSuccess', () => {
  it('成功レスポンスを適切に送信する', () => {
    const res = mockResponse();
    const data = { id: 1, name: 'Test' };

    sendSuccess(res, data, 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data
    });
  });

  it('デフォルトステータスコード200で成功レスポンスを送信する', () => {
    const res = mockResponse();
    const data = { message: 'Success' };

    sendSuccess(res, data);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data
    });
  });
});

describe('sendError', () => {
  it('エラーレスポンスを適切に送信する', () => {
    const res = mockResponse();
    const error = new AppError(ERROR_CODES.NOT_FOUND, 'リソースが見つかりません', 404);

    sendError(res, error);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: 'リソースが見つかりません',
        details: undefined
      }
    });
  });
});