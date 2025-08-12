import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PatientReportService } from '../patientReportService';

// fetchのモック
global.fetch = vi.fn();
const mockedFetch = fetch as any;

// localStorageのモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('PatientReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('getPatientMonthlyStats', () => {
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
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockStats
        }),
      } as Response);

      const result = await PatientReportService.getPatientMonthlyStats({
        patientId: 1,
        year: 2024,
        month: 1
      });

      expect(result).toEqual(mockStats);
      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/patient-reports/1/monthly?year=2024&month=1',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }
        }
      );
    });

    it('APIエラーの場合エラーを投げる', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: {
            message: 'Patient not found'
          }
        }),
      } as Response);

      await expect(
        PatientReportService.getPatientMonthlyStats({
          patientId: 999,
          year: 2024,
          month: 1
        })
      ).rejects.toThrow('Patient not found');
    });

    it('ネットワークエラーの場合エラーを投げる', async () => {
      mockedFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        PatientReportService.getPatientMonthlyStats({
          patientId: 1,
          year: 2024,
          month: 1
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('getPatientYearlyStats', () => {
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

    it('正常に患者別年間統計を取得できる', async () => {
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockYearlyStats
        }),
      } as Response);

      const result = await PatientReportService.getPatientYearlyStats(1, 2024);

      expect(result).toEqual(mockYearlyStats);
      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/patient-reports/1/yearly?year=2024',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }
        }
      );
    });
  });

  describe('getPatientComparisonReport', () => {
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
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockComparisonReport
        }),
      } as Response);

      const result = await PatientReportService.getPatientComparisonReport(2024, 1);

      expect(result).toEqual(mockComparisonReport);
      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/patient-reports/comparison?year=2024&month=1',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }
        }
      );
    });
  });
});