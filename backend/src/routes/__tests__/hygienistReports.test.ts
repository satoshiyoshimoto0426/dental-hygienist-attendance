import request from 'supertest';
import express from 'express';
import { hygienistReportsRouter } from '../hygienistReports';
import { HygienistReport } from '../../models/HygienistReport';

// モックの設定
jest.mock('../../models/HygienistReport');
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 1, role: 'admin' };
    next();
  }
}));

const MockedHygienistReport = HygienistReport as jest.Mocked<typeof HygienistReport>;

describe('Hygienist Reports Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/hygienist-reports', hygienistReportsRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/hygienist-reports/hygienist/:hygienistId/monthly', () => {
    it('歯科衛生士の月間統計を取得できる', async () => {
      const mockReport = {
        hygienistId: 1,
        hygienistName: '田中花子',
        year: 2024,
        month: 1,
        totalVisits: 25,
        totalHours: 50.5,
        visitDetails: [
          {
            date: '2024-01-15',
            patientName: '山田太郎',
            startTime: '09:00',
            endTime: '10:00',
            duration: 1.0
          }
        ]
      };

      MockedHygienistReport.getMonthlyReport = jest.fn().mockResolvedValue(mockReport);

      const response = await request(app)
        .get('/api/hygienist-reports/hygienist/1/monthly')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReport);
      expect(MockedHygienistReport.getMonthlyReport).toHaveBeenCalledWith(1, 2024, 1);
    });

    it('存在しない歯科衛生士IDで404エラーが返される', async () => {
      MockedHygienistReport.getMonthlyReport = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/hygienist-reports/hygienist/999/monthly')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('HYGIENIST_NOT_FOUND');
    });

    it('無効な年月パラメータでバリデーションエラーが発生する', async () => {
      const response = await request(app)
        .get('/api/hygienist-reports/hygienist/1/monthly')
        .query({ year: 'invalid', month: 1 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/hygienist-reports/comparison', () => {
    it('歯科衛生士の比較統計を取得できる', async () => {
      const mockComparison = [
        {
          hygienistId: 1,
          hygienistName: '田中花子',
          totalVisits: 25,
          totalHours: 50.5
        },
        {
          hygienistId: 2,
          hygienistName: '佐藤次郎',
          totalVisits: 30,
          totalHours: 60.0
        }
      ];

      MockedHygienistReport.getComparisonReport = jest.fn().mockResolvedValue(mockComparison);

      const response = await request(app)
        .get('/api/hygienist-reports/comparison')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockComparison);
      expect(MockedHygienistReport.getComparisonReport).toHaveBeenCalledWith(2024, 1);
    });

    it('データが存在しない場合に空配列が返される', async () => {
      MockedHygienistReport.getComparisonReport = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get('/api/hygienist-reports/comparison')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/hygienist-reports/export/csv', () => {
    it('CSV形式で歯科衛生士レポートをエクスポートできる', async () => {
      const mockCsvData = 'hygienistId,hygienistName,totalVisits,totalHours\n1,田中花子,25,50.5\n2,佐藤次郎,30,60.0';

      MockedHygienistReport.exportToCsv = jest.fn().mockResolvedValue(mockCsvData);

      const response = await request(app)
        .get('/api/hygienist-reports/export/csv')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(response.headers['content-disposition']).toContain('attachment; filename=');
      expect(response.text).toBe(mockCsvData);
      expect(MockedHygienistReport.exportToCsv).toHaveBeenCalledWith(2024, 1);
    });

    it('データが存在しない場合でも空のCSVが返される', async () => {
      const mockEmptyCsv = 'hygienistId,hygienistName,totalVisits,totalHours\n';

      MockedHygienistReport.exportToCsv = jest.fn().mockResolvedValue(mockEmptyCsv);

      const response = await request(app)
        .get('/api/hygienist-reports/export/csv')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.text).toBe(mockEmptyCsv);
    });
  });
});