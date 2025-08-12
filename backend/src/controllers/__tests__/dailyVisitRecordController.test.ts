import { Request, Response } from 'express';
import {
  getDailyVisitRecords,
  createDailyVisitRecord,
  updateDailyVisitRecord,
  deleteDailyVisitRecord
} from '../dailyVisitRecordController';
import { DailyVisitRecord } from '../../models/DailyVisitRecord';

// モックの設定
jest.mock('../../models/DailyVisitRecord');

const MockedDailyVisitRecord = DailyVisitRecord as jest.Mocked<typeof DailyVisitRecord>;

describe('DailyVisitRecordController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getDailyVisitRecords', () => {
    it('月間の日次訪問記録を正常に取得できる', async () => {
      const mockRecords = [
        {
          id: 1,
          date: '2024-01-15',
          patientId: 1,
          hygienistId: 1,
          startTime: '09:00',
          endTime: '10:00',
          status: 'completed',
          notes: 'テストメモ'
        }
      ];

      mockRequest.query = { year: '2024', month: '1' };
      MockedDailyVisitRecord.findByMonth = jest.fn().mockResolvedValue(mockRecords);

      await getDailyVisitRecords(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedDailyVisitRecord.findByMonth).toHaveBeenCalledWith(2024, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecords
      });
    });

    it('無効なクエリパラメータでエラーが発生する', async () => {
      mockRequest.query = { year: 'invalid', month: '1' };

      await getDailyVisitRecords(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        code: 'VALIDATION_ERROR'
      }));
    });

    it('データベースエラーが発生した場合にエラーハンドリングされる', async () => {
      mockRequest.query = { year: '2024', month: '1' };
      const dbError = new Error('Database connection failed');
      MockedDailyVisitRecord.findByMonth = jest.fn().mockRejectedValue(dbError);

      await getDailyVisitRecords(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('createDailyVisitRecord', () => {
    it('新しい日次訪問記録を正常に作成できる', async () => {
      const newRecord = {
        date: '2024-01-15',
        patientId: 1,
        hygienistId: 1,
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed',
        notes: 'テストメモ'
      };

      const createdRecord = {
        id: 1,
        ...newRecord,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.body = newRecord;
      MockedDailyVisitRecord.create = jest.fn().mockResolvedValue(createdRecord);

      await createDailyVisitRecord(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedDailyVisitRecord.create).toHaveBeenCalledWith(newRecord);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: createdRecord
      });
    });

    it('バリデーションエラーが発生した場合にエラーハンドリングされる', async () => {
      const invalidRecord = {
        date: '2024-01-15',
        patientId: 1
        // hygienistId が不足
      };

      mockRequest.body = invalidRecord;

      await createDailyVisitRecord(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        code: 'VALIDATION_ERROR'
      }));
    });
  });

  describe('updateDailyVisitRecord', () => {
    it('既存の日次訪問記録を正常に更新できる', async () => {
      const updateData = {
        startTime: '10:00',
        endTime: '11:00',
        notes: '更新されたメモ'
      };

      const updatedRecord = {
        id: 1,
        date: '2024-01-15',
        patientId: 1,
        hygienistId: 1,
        ...updateData,
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      MockedDailyVisitRecord.update = jest.fn().mockResolvedValue(updatedRecord);

      await updateDailyVisitRecord(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedDailyVisitRecord.update).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedRecord
      });
    });

    it('存在しない記録IDで404エラーが発生する', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { notes: '更新されたメモ' };
      MockedDailyVisitRecord.update = jest.fn().mockResolvedValue(null);

      await updateDailyVisitRecord(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        code: 'RECORD_NOT_FOUND'
      }));
    });

    it('無効なIDパラメータでバリデーションエラーが発生する', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { notes: '更新されたメモ' };

      await updateDailyVisitRecord(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        code: 'VALIDATION_ERROR'
      }));
    });
  });

  describe('deleteDailyVisitRecord', () => {
    it('日次訪問記録を正常に削除できる', async () => {
      mockRequest.params = { id: '1' };
      MockedDailyVisitRecord.delete = jest.fn().mockResolvedValue(true);

      await deleteDailyVisitRecord(mockRequest as Request, mockResponse as Response, mockNext);

      expect(MockedDailyVisitRecord.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '日次訪問記録を削除しました'
      });
    });

    it('存在しない記録IDで404エラーが発生する', async () => {
      mockRequest.params = { id: '999' };
      MockedDailyVisitRecord.delete = jest.fn().mockResolvedValue(false);

      await deleteDailyVisitRecord(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
        code: 'RECORD_NOT_FOUND'
      }));
    });

    it('無効なIDパラメータでバリデーションエラーが発生する', async () => {
      mockRequest.params = { id: 'invalid' };

      await deleteDailyVisitRecord(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 400,
        code: 'VALIDATION_ERROR'
      }));
    });
  });
});