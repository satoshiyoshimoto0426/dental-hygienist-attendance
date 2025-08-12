import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DailyVisitRecordService } from '../dailyVisitRecordService';
import { CreateDailyVisitRecordInput, UpdateDailyVisitRecordInput } from '../../types/DailyVisitRecord';

// fetchのモック
global.fetch = vi.fn();

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

describe('DailyVisitRecordService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('test-token');
  });

  describe('getDailyVisitRecords', () => {
    it('日次訪問記録一覧を取得できる', async () => {
      const mockRecords = [
        {
          id: 1,
          patientId: 1,
          hygienistId: 1,
          visitDate: '2024-01-15',
          startTime: '09:00',
          endTime: '10:00',
          status: 'completed',
          notes: 'テスト記録',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockRecords
        })
      });

      const result = await DailyVisitRecordService.getDailyVisitRecords();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/daily-visit-records',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockRecords);
    });

    it('クエリパラメータ付きで日次訪問記録を取得できる', async () => {
      const mockRecords = [];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockRecords
        })
      });

      await DailyVisitRecordService.getDailyVisitRecords({
        year: 2024,
        month: 1,
        patientId: 1
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/daily-visit-records?year=2024&month=1&patientId=1',
        expect.any(Object)
      );
    });

    it('認証トークンがない場合はエラーを投げる', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(DailyVisitRecordService.getDailyVisitRecords()).rejects.toThrow(
        '認証トークンが見つかりません'
      );
    });

    it('APIエラーの場合はエラーを投げる', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(DailyVisitRecordService.getDailyVisitRecords()).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });

    it('レスポンスのsuccessがfalseの場合はエラーを投げる', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          error: { message: 'テストエラー' }
        })
      });

      await expect(DailyVisitRecordService.getDailyVisitRecords()).rejects.toThrow(
        'テストエラー'
      );
    });
  });

  describe('getDailyVisitRecord', () => {
    it('指定されたIDの日次訪問記録を取得できる', async () => {
      const mockRecord = {
        id: 1,
        patientId: 1,
        hygienistId: 1,
        visitDate: '2024-01-15',
        status: 'completed',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockRecord
        })
      });

      const result = await DailyVisitRecordService.getDailyVisitRecord(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/daily-visit-records/1',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockRecord);
    });
  });

  describe('createDailyVisitRecord', () => {
    it('日次訪問記録を作成できる', async () => {
      const input: CreateDailyVisitRecordInput = {
        patientId: 1,
        hygienistId: 1,
        visitDate: '2024-01-15',
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed',
        notes: 'テスト記録'
      };

      const mockRecord = {
        id: 1,
        ...input,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockRecord
        })
      });

      const result = await DailyVisitRecordService.createDailyVisitRecord(input);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/daily-visit-records',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input)
        }
      );
      expect(result).toEqual(mockRecord);
    });
  });

  describe('updateDailyVisitRecord', () => {
    it('日次訪問記録を更新できる', async () => {
      const input: UpdateDailyVisitRecordInput = {
        notes: '更新されたテスト記録'
      };

      const mockRecord = {
        id: 1,
        patientId: 1,
        hygienistId: 1,
        visitDate: '2024-01-15',
        status: 'completed',
        notes: '更新されたテスト記録',
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T01:00:00Z'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockRecord
        })
      });

      const result = await DailyVisitRecordService.updateDailyVisitRecord(1, input);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/daily-visit-records/1',
        {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input)
        }
      );
      expect(result).toEqual(mockRecord);
    });
  });

  describe('deleteDailyVisitRecord', () => {
    it('日次訪問記録を削除できる', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true
        })
      });

      await DailyVisitRecordService.deleteDailyVisitRecord(1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/daily-visit-records/1',
        {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('getMonthlyStats', () => {
    it('月間統計を取得できる', async () => {
      const mockStats = {
        totalVisits: 10,
        patientStats: [],
        hygienistStats: [],
        dailyVisitRecords: []
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockStats
        })
      });

      const result = await DailyVisitRecordService.getMonthlyStats(2024, 1);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/daily-visit-records/stats/monthly?year=2024&month=1',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockStats);
    });
  });
});