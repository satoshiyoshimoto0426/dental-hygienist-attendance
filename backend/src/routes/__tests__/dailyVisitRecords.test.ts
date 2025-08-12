import request from 'supertest';
import express from 'express';
import { dailyVisitRecordsRouter } from '../dailyVisitRecords';
import { DailyVisitRecord } from '../../models/DailyVisitRecord';

// モックの設定
jest.mock('../../models/DailyVisitRecord');
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 1, role: 'admin' };
    next();
  }
}));

const MockedDailyVisitRecord = DailyVisitRecord as jest.Mocked<typeof DailyVisitRecord>;

describe('Daily Visit Records Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/daily-visit-records', dailyVisitRecordsRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/daily-visit-records', () => {
    it('日次訪問記録一覧を取得できる', async () => {
      const mockRecords = [
        {
          id: 1,
          date: '2024-01-15',
          patientId: 1,
          hygienistId: 1,
          startTime: '09:00',
          endTime: '10:00',
          status: 'completed',
          notes: 'テストメモ',
          patient: { id: 1, name: '山田太郎' },
          hygienist: { id: 1, name: '田中花子' }
        }
      ];

      MockedDailyVisitRecord.findByMonth = jest.fn().mockResolvedValue(mockRecords);

      const response = await request(app)
        .get('/api/daily-visit-records')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockRecords);
      expect(MockedDailyVisitRecord.findByMonth).toHaveBeenCalledWith(2024, 1);
    });

    it('無効な年月パラメータでバリデーションエラーが発生する', async () => {
      const response = await request(app)
        .get('/api/daily-visit-records')
        .query({ year: 'invalid', month: 1 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/daily-visit-records', () => {
    it('新しい日次訪問記録を作成できる', async () => {
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

      MockedDailyVisitRecord.create = jest.fn().mockResolvedValue(createdRecord);

      const response = await request(app)
        .post('/api/daily-visit-records')
        .send(newRecord);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(createdRecord);
      expect(MockedDailyVisitRecord.create).toHaveBeenCalledWith(newRecord);
    });

    it('必須フィールドが不足している場合にバリデーションエラーが発生する', async () => {
      const invalidRecord = {
        date: '2024-01-15',
        patientId: 1
        // hygienistId が不足
      };

      const response = await request(app)
        .post('/api/daily-visit-records')
        .send(invalidRecord);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/daily-visit-records/:id', () => {
    it('既存の日次訪問記録を更新できる', async () => {
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

      MockedDailyVisitRecord.update = jest.fn().mockResolvedValue(updatedRecord);

      const response = await request(app)
        .put('/api/daily-visit-records/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedRecord);
      expect(MockedDailyVisitRecord.update).toHaveBeenCalledWith(1, updateData);
    });

    it('存在しない記録IDで404エラーが返される', async () => {
      MockedDailyVisitRecord.update = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put('/api/daily-visit-records/999')
        .send({ notes: '更新されたメモ' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RECORD_NOT_FOUND');
    });
  });

  describe('DELETE /api/daily-visit-records/:id', () => {
    it('日次訪問記録を削除できる', async () => {
      MockedDailyVisitRecord.delete = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/daily-visit-records/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('日次訪問記録を削除しました');
      expect(MockedDailyVisitRecord.delete).toHaveBeenCalledWith(1);
    });

    it('存在しない記録IDで404エラーが返される', async () => {
      MockedDailyVisitRecord.delete = jest.fn().mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/daily-visit-records/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RECORD_NOT_FOUND');
    });
  });
});