import { vi } from 'vitest';
import { HygienistReportService } from '../hygienistReportService';

// fetchをモック
global.fetch = vi.fn();
const mockFetch = fetch as any;

// localStorageをモック
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('HygienistReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('mock-token');
  });

  describe('getHygienistMonthlyStats', () => {
    it('歯科衛生士別月間統計を正常に取得できる', async () => {
      const mockResponse = {
        success: true,
        data: {
          hygienistId: 1,
          hygienistName: '田中花子',
          staffId: 'H001',
          year: 2024,
          month: 1,
          totalVisits: 10,
          completedVisits: 8,
          cancelledVisits: 2,
          scheduledVisits: 0,
          totalHours: 12.5,
          averageVisitDuration: 75,
          visitDetails: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await HygienistReportService.getHygienistMonthlyStats({
        hygienistId: 1,
        year: 2024,
        month: 1
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hygienist-reports/hygienist/1/monthly?year=2024&month=1',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('認証トークンがない場合エラーを投げる', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(
        HygienistReportService.getHygienistMonthlyStats({
          hygienistId: 1,
          year: 2024,
          month: 1
        })
      ).rejects.toThrow('認証トークンが見つかりません');
    });

    it('APIエラーの場合エラーを投げる', async () => {
      const mockErrorResponse = {
        error: {
          message: '歯科衛生士が見つかりません'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockErrorResponse
      } as Response);

      await expect(
        HygienistReportService.getHygienistMonthlyStats({
          hygienistId: 999,
          year: 2024,
          month: 1
        })
      ).rejects.toThrow('歯科衛生士が見つかりません');
    });
  });

  describe('getHygienistYearlyStats', () => {
    it('歯科衛生士別年間統計を正常に取得できる', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            hygienistId: 1,
            hygienistName: '田中花子',
            staffId: 'H001',
            year: 2024,
            month: 1,
            totalVisits: 10,
            completedVisits: 8,
            cancelledVisits: 2,
            scheduledVisits: 0,
            totalHours: 12.5,
            averageVisitDuration: 75,
            visitDetails: []
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await HygienistReportService.getHygienistYearlyStats(1, 2024);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hygienist-reports/hygienist/1/yearly?year=2024',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getHygienistComparisonReport', () => {
    it('歯科衛生士比較レポートを正常に取得できる', async () => {
      const mockResponse = {
        success: true,
        data: {
          year: 2024,
          month: 1,
          hygienists: [],
          totalHygienists: 0,
          averageVisitsPerHygienist: 0
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await HygienistReportService.getHygienistComparisonReport(2024, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/hygienist-reports/hygienist-comparison?year=2024&month=1',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockResponse.data);
    });
  });
});