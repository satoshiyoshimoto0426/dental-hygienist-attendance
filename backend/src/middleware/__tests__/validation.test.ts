import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { 
  validate, 
  customValidations, 
  validateDailyVisitRecord,
  validateReportDateRange,
  validateIdParam,
  validatePaginationParams
} from '../validation';
import { AppError, ERROR_CODES } from '../../types/ApiResponse';

// モックの作成
const mockRequest = (data: any = {}, source: 'body' | 'params' | 'query' = 'body') => {
  const req = {
    body: {},
    params: {},
    query: {}
  } as Request;
  req[source] = data;
  return req;
};

const mockResponse = () => ({} as Response);
const mockNext = jest.fn() as NextFunction;

describe('validate middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testSchema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': '名前は必須です',
      'any.required': '名前は必須です'
    }),
    age: Joi.number().integer().min(0).messages({
      'number.base': '年齢は数値である必要があります',
      'number.integer': '年齢は整数である必要があります',
      'number.min': '年齢は0以上である必要があります'
    })
  });

  it('有効なデータでバリデーションが成功する', () => {
    const req = mockRequest({ name: 'テスト太郎', age: 25 });
    const res = mockResponse();
    const middleware = validate(testSchema);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'テスト太郎', age: 25 });
  });

  it('無効なデータでバリデーションエラーが発生する', () => {
    const req = mockRequest({ name: '', age: -1 });
    const res = mockResponse();
    const middleware = validate(testSchema);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = mockNext.mock.calls[0][0] as AppError;
    expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(error.message).toBe('バリデーションエラーが発生しました');
    expect(error.details).toHaveLength(2);
  });

  it('paramsのバリデーションが正しく動作する', () => {
    const req = mockRequest({ id: '123' }, 'params');
    const res = mockResponse();
    const middleware = validate(Joi.object({ id: Joi.string().required() }), 'params');

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.params.id).toBe('123');
  });

  it('queryのバリデーションが正しく動作する', () => {
    const req = mockRequest({ page: '1' }, 'query');
    const res = mockResponse();
    const middleware = validate(Joi.object({ page: Joi.string().required() }), 'query');

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.query.page).toBe('1');
  });

  it('不明なフィールドが除去される', () => {
    const req = mockRequest({ name: 'テスト太郎', age: 25, unknown: 'value' });
    const res = mockResponse();
    const middleware = validate(testSchema);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'テスト太郎', age: 25 });
    expect(req.body.unknown).toBeUndefined();
  });
});

describe('customValidations', () => {
  describe('validateTimeRange', () => {
    it('有効な時間範囲でnullを返す', () => {
      expect(customValidations.validateTimeRange('09:00', '10:00')).toBeNull();
      expect(customValidations.validateTimeRange('09:00', '09:01')).toBeNull();
    });

    it('無効な時間範囲でエラーメッセージを返す', () => {
      expect(customValidations.validateTimeRange('10:00', '09:00')).toBe('終了時間は開始時間より後に設定してください');
      expect(customValidations.validateTimeRange('09:00', '09:00')).toBe('終了時間は開始時間より後に設定してください');
    });

    it('時間が未設定の場合nullを返す', () => {
      expect(customValidations.validateTimeRange(undefined, '10:00')).toBeNull();
      expect(customValidations.validateTimeRange('09:00', undefined)).toBeNull();
    });
  });

  describe('validateDateRange', () => {
    it('有効な日付範囲でnullを返す', () => {
      expect(customValidations.validateDateRange('2024-01-01', '2024-01-31')).toBeNull();
      expect(customValidations.validateDateRange('2024-01-01', '2024-01-01')).toBeNull();
    });

    it('無効な日付範囲でエラーメッセージを返す', () => {
      expect(customValidations.validateDateRange('2024-01-31', '2024-01-01')).toBe('終了日は開始日以降に設定してください');
    });

    it('無効な日付形式でエラーメッセージを返す', () => {
      expect(customValidations.validateDateRange('invalid', '2024-01-01')).toBe('有効な日付を入力してください');
      expect(customValidations.validateDateRange('2024-01-01', 'invalid')).toBe('有効な日付を入力してください');
    });

    it('日付が未設定の場合nullを返す', () => {
      expect(customValidations.validateDateRange(undefined, '2024-01-01')).toBeNull();
      expect(customValidations.validateDateRange('2024-01-01', undefined)).toBeNull();
    });
  });

  describe('validateCancellationReason', () => {
    it('キャンセル時に理由が必要', () => {
      expect(customValidations.validateCancellationReason('cancelled', '')).toBe('キャンセル理由を入力してください');
      expect(customValidations.validateCancellationReason('cancelled', '   ')).toBe('キャンセル理由を入力してください');
      expect(customValidations.validateCancellationReason('cancelled', undefined)).toBe('キャンセル理由を入力してください');
    });

    it('キャンセル時に理由があればnullを返す', () => {
      expect(customValidations.validateCancellationReason('cancelled', '体調不良')).toBeNull();
    });

    it('キャンセル以外のステータスではnullを返す', () => {
      expect(customValidations.validateCancellationReason('completed', '')).toBeNull();
      expect(customValidations.validateCancellationReason('scheduled', '')).toBeNull();
    });
  });
});

describe('validateDailyVisitRecord', () => {
  it('有効なデータで次のミドルウェアに進む', () => {
    const req = mockRequest({
      startTime: '09:00',
      endTime: '10:00',
      status: 'completed',
      cancellationReason: ''
    });
    const res = mockResponse();

    validateDailyVisitRecord(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('無効な時間範囲でエラーが発生する', () => {
    const req = mockRequest({
      startTime: '10:00',
      endTime: '09:00',
      status: 'completed'
    });
    const res = mockResponse();

    validateDailyVisitRecord(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = mockNext.mock.calls[0][0] as AppError;
    expect(error.details).toContain('終了時間は開始時間より後に設定してください');
  });

  it('キャンセル時に理由がないとエラーが発生する', () => {
    const req = mockRequest({
      startTime: '09:00',
      endTime: '10:00',
      status: 'cancelled',
      cancellationReason: ''
    });
    const res = mockResponse();

    validateDailyVisitRecord(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = mockNext.mock.calls[0][0] as AppError;
    expect(error.details).toContain('キャンセル理由を入力してください');
  });
});

describe('validateReportDateRange', () => {
  it('有効な日付範囲で次のミドルウェアに進む', () => {
    const req = mockRequest({}, 'query');
    req.query = { startDate: '2024-01-01', endDate: '2024-01-31' };
    const res = mockResponse();

    validateReportDateRange(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('無効な日付範囲でエラーが発生する', () => {
    const req = mockRequest({}, 'query');
    req.query = { startDate: '2024-01-31', endDate: '2024-01-01' };
    const res = mockResponse();

    validateReportDateRange(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('日付が未設定の場合は次のミドルウェアに進む', () => {
    const req = mockRequest({}, 'query');
    req.query = {};
    const res = mockResponse();

    validateReportDateRange(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });
});

describe('validateIdParam', () => {
  it('有効なIDで次のミドルウェアに進む', () => {
    const req = mockRequest({}, 'params');
    req.params = { id: '123' };
    const res = mockResponse();
    const middleware = validateIdParam();

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.params.id).toBe('123');
  });

  it('無効なIDでエラーが発生する', () => {
    const req = mockRequest({}, 'params');
    req.params = { id: 'invalid' };
    const res = mockResponse();
    const middleware = validateIdParam();

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('負の数でエラーが発生する', () => {
    const req = mockRequest({}, 'params');
    req.params = { id: '-1' };
    const res = mockResponse();
    const middleware = validateIdParam();

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('カスタムパラメータ名で動作する', () => {
    const req = mockRequest({}, 'params');
    req.params = { patientId: '123' };
    const res = mockResponse();
    const middleware = validateIdParam('patientId');

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.params.patientId).toBe('123');
  });
});

describe('validatePaginationParams', () => {
  it('有効なページネーションパラメータで次のミドルウェアに進む', () => {
    const req = mockRequest({}, 'query');
    req.query = { page: '2', limit: '20' };
    const res = mockResponse();

    validatePaginationParams(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.query.page).toBe('2');
    expect(req.query.limit).toBe('20');
  });

  it('デフォルト値が設定される', () => {
    const req = mockRequest({}, 'query');
    req.query = {};
    const res = mockResponse();

    validatePaginationParams(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(req.query.page).toBe('1');
    expect(req.query.limit).toBe('10');
  });

  it('無効なページ番号でエラーが発生する', () => {
    const req = mockRequest({}, 'query');
    req.query = { page: '0', limit: '10' };
    const res = mockResponse();

    validatePaginationParams(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('無効な取得件数でエラーが発生する', () => {
    const req = mockRequest({}, 'query');
    req.query = { page: '1', limit: '101' };
    const res = mockResponse();

    validatePaginationParams(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
  });
});