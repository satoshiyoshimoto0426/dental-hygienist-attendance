import request from 'supertest';
import express from 'express';
import { patientReportsRouter } from '../patientReports';
import { PatientReport } from '../../models/PatientReport';

// モックの設定
jest.mock('../../models/PatientReport');
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 1, role: 'admin' };
    next();
  }
}));

const MockedPatientReport = PatientReport as jest.Mocked<typeof PatientReport>;

describe('Patient Reports Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/patient-reports', patientReportsRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/patient-reports/patient/:patientId/monthly', () => {
    it('患者の月間統計を取得できる', async () => {
      const mockReport = {
        patientId: 1,
        patientName: '山田太郎',
        year: 2024,
        month: 1,
        totalVisits: 4,
        totalHours: 4.0,
        visitDetails: [
          {
            date: '2024-01-15',
            hygienistName: '田中花子',
            startTime: '09:00',
            endTime: '10:00',
            duration: 1.0
          }
        ]
      };

      MockedPatientReport.getMonthlyReport = jest.fn().mockResolvedValue(mockReport);

      const response = await request(app)
        .get('/api/patient-reports/patient/1/monthly')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockReport);
      expect(MockedPatientReport.getMonthlyReport).toHaveBeenCalledWith(1, 2024, 1);
    });

    it('存在しない患者IDで404エラーが返される', async () => {
      MockedPatientReport.getMonthlyReport = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/patient-reports/patient/999/monthly')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PATIENT_NOT_FOUND');
    });

    it('無効な年月パラメータでバリデーションエラーが発生する', async () => {
      const response = await request(app)
        .get('/api/patient-reports/patient/1/monthly')
        .query({ year: 'invalid', month: 1 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/patient-reports/comparison', () => {
    it('患者の比較統計を取得できる', async () => {
      const mockComparison = [
        {
          patientId: 1,
          patientName: '山田太郎',
          totalVisits: 4,
          totalHours: 4.0
        },
        {
          patientId: 2,
          patientName: '田中花子',
          totalVisits: 3,
          totalHours: 3.5
        }
      ];

      MockedPatientReport.getComparisonReport = jest.fn().mockResolvedValue(mockComparison);

      const response = await request(app)
        .get('/api/patient-reports/comparison')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockComparison);
      expect(MockedPatientReport.getComparisonReport).toHaveBeenCalledWith(2024, 1);
    });

    it('データが存在しない場合に空配列が返される', async () => {
      MockedPatientReport.getComparisonReport = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get('/api/patient-reports/comparison')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/patient-reports/export/csv', () => {
    it('CSV形式で患者レポートをエクスポートできる', async () => {
      const mockCsvData = 'patientId,patientName,totalVisits,totalHours\n1,山田太郎,4,4.0\n2,田中花子,3,3.5';

      MockedPatientReport.exportToCsv = jest.fn().mockResolvedValue(mockCsvData);

      const response = await request(app)
        .get('/api/patient-reports/export/csv')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(response.headers['content-disposition']).toContain('attachment; filename=');
      expect(response.text).toBe(mockCsvData);
      expect(MockedPatientReport.exportToCsv).toHaveBeenCalledWith(2024, 1);
    });

    it('データが存在しない場合でも空のCSVが返される', async () => {
      const mockEmptyCsv = 'patientId,patientName,totalVisits,totalHours\n';

      MockedPatientReport.exportToCsv = jest.fn().mockResolvedValue(mockEmptyCsv);

      const response = await request(app)
        .get('/api/patient-reports/export/csv')
        .query({ year: 2024, month: 1 });

      expect(response.status).toBe(200);
      expect(response.text).toBe(mockEmptyCsv);
    });
  });
});