import request from 'supertest';
import app from '../../server';
import { PatientReportModel } from '../../models/PatientReport';
import jwt from 'jsonwebtoken';

// PatientReportModelのモック
jest.mock('../../models/PatientReport');
const mockedPatientReportModel = PatientReportModel as jest.Mocked<typeof PatientReportModel>;

// JWTトークンの生成
const generateToken = (userId: number = 1) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
};

describe('PatientReportController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/patient-reports/:patientId/monthly', () => {
    const mockStats = {
      patientId: 1,
      patientName: '田中太郎',
      year: 2024,
      month: 1,
      totalVisits: 5,
      completedVisits: 4,
      cancelledVisits: 1,
      scheduledVisits: 0,
      totalHours: 4.5,
      averageVisitDuration: 67.5,
      visitDetails: []
    };

    it('正常に患者別月間統計を取得できる', async () => {
      mockedPatientReportModel.getPatientMonthlyStats.mockResolvedValue(mockStats);

      const token = generateToken();
      const response = await request(app)
        .get('/api/patient-reports/1/monthly?year=2024&month=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
      expect(mockedPatientReportModel.getPatientMonthlyStats).toHaveBeenCalledWith({
        patientId: 1,
        year: 2024,
        month: 1
      });
    });

    it('認証トークンがない場合401エラーを返す', async () => {
      const response = await request(app)
        .get('/api/patient-reports/1/monthly?year=2024&month=1');

      expect(response.status).toBe(401);
    });

    it('無効なパラメータの場合400エラーを返す', async () => {
      const token = generateToken();
      const response = await request(app)
        .get('/api/patient-reports/invalid/monthly?year=2024&month=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PARAMETERS');
    });

    it('無効な月の場合400エラーを返す', async () => {
      const token = generateToken();
      const response = await request(app)
        .get('/api/patient-reports/1/monthly?year=2024&month=13')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_MONTH');
    });

    it('患者が見つからない場合404エラーを返す', async () => {
      mockedPatientReportModel.getPatientMonthlyStats.mockResolvedValue(null);

      const token = generateToken();
      const response = await request(app)
        .get('/api/patient-reports/999/monthly?year=2024&month=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PATIENT_NOT_FOUND');
    });

    it('サーバーエラーの場合500エラーを返す', async () => {
      mockedPatientReportModel.getPatientMonthlyStats.mockRejectedValue(
        new Error('Database error')
      );

      const token = generateToken();
      const response = await request(app)
        .get('/api/patient-reports/1/monthly?year=2024&month=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('GET /api/patient-reports/comparison', () => {
    const mockComparisonReport = {
      year: 2024,
      month: 1,
      patients: [
        {
          patientId: 1,
          patientName: '田中太郎',
          year: 2024,
          month: 1,
          totalVisits: 5,
          completedVisits: 4,
          cancelledVisits: 1,
          scheduledVisits: 0,
          totalHours: 4.5,
          averageVisitDuration: 67.5,
          visitDetails: []
        }
      ],
      totalPatients: 1,
      averageVisitsPerPatient: 5
    };

    it('正常に患者比較レポートを取得できる', async () => {
      mockedPatientReportModel.getPatientComparisonReport.mockResolvedValue(mockComparisonReport);

      const token = generateToken();
      const response = await request(app)
        .get('/api/patient-reports/comparison?year=2024&month=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockComparisonReport);
      expect(mockedPatientReportModel.getPatientComparisonReport).toHaveBeenCalledWith(2024, 1);
    });

    it('無効なパラメータの場合400エラーを返す', async () => {
      const token = generateToken();
      const response = await request(app)
        .get('/api/patient-reports/comparison?year=invalid&month=1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PARAMETERS');
    });
  });

  describe('GET /api/patient-reports/:patientId/yearly', () => {
    const mockYearlyStats = [
      {
        patientId: 1,
        patientName: '田中太郎',
        year: 2024,
        month: 1,
        totalVisits: 5,
        completedVisits: 4,
        cancelledVisits: 1,
        scheduledVisits: 0,
        totalHours: 4.5,
        averageVisitDuration: 67.5,
        visitDetails: []
      }
    ];

    it('正常に患者年間統計を取得できる', async () => {
      mockedPatientReportModel.getPatientYearlyStats.mockResolvedValue(mockYearlyStats);

      const token = generateToken();
      const response = await request(app)
        .get('/api/patient-reports/1/yearly?year=2024')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockYearlyStats);
      expect(mockedPatientReportModel.getPatientYearlyStats).toHaveBeenCalledWith(1, 2024);
    });

    it('無効なパラメータの場合400エラーを返す', async () => {
      const token = generateToken();
      const response = await request(app)
        .get('/api/patient-reports/invalid/yearly?year=2024')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PARAMETERS');
    });
  });
});