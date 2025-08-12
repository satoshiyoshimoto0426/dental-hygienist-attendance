import { HygienistReportModel } from '../HygienistReport';
import { pool } from '../../database/connection';

// データベース接続をモック
jest.mock('../../database/connection', () => ({
  pool: {
    query: jest.fn()
  }
}));
const mockPool = pool as jest.Mocked<typeof pool>;

describe('HygienistReportModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHygienistMonthlyStats', () => {
    it('歯科衛生士別月間統計を正常に取得できる', async () => {
      // モックデータの設定
      const mockHygienist = {
        id: 1,
        name: '田中花子',
        staff_id: 'H001'
      };

      const mockVisits = [
        {
          id: 1,
          visit_date: '2024-01-15',
          start_time: '09:00',
          end_time: '10:00',
          status: 'completed',
          cancellation_reason: null,
          notes: '定期検診',
          patient_name: '山田太郎',
          patient_id: 'P001'
        },
        {
          id: 2,
          visit_date: '2024-01-16',
          start_time: '14:00',
          end_time: '15:30',
          status: 'completed',
          cancellation_reason: null,
          notes: null,
          patient_name: '佐藤花子',
          patient_id: 'P002'
        }
      ];

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockHygienist] })
        .mockResolvedValueOnce({ rows: mockVisits });

      const result = await HygienistReportModel.getHygienistMonthlyStats({
        hygienistId: 1,
        year: 2024,
        month: 1
      });

      expect(result).toEqual({
        hygienistId: 1,
        hygienistName: '田中花子',
        staffId: 'H001',
        year: 2024,
        month: 1,
        totalVisits: 2,
        completedVisits: 2,
        cancelledVisits: 0,
        scheduledVisits: 0,
        totalHours: 2.5,
        averageVisitDuration: 75,
        visitDetails: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            visitDate: '2024-01-15',
            patientName: '山田太郎',
            duration: 60
          }),
          expect.objectContaining({
            id: 2,
            visitDate: '2024-01-16',
            patientName: '佐藤花子',
            duration: 90
          })
        ])
      });
    });

    it('存在しない歯科衛生士IDの場合nullを返す', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await HygienistReportModel.getHygienistMonthlyStats({
        hygienistId: 999,
        year: 2024,
        month: 1
      });

      expect(result).toBeNull();
    });

    it('データベースエラーの場合エラーを投げる', async () => {
      (mockPool.query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      await expect(
        HygienistReportModel.getHygienistMonthlyStats({
          hygienistId: 1,
          year: 2024,
          month: 1
        })
      ).rejects.toThrow('歯科衛生士別月間統計の取得に失敗しました');
    });
  });

  describe('getHygienistComparisonReport', () => {
    it('複数歯科衛生士の比較レポートを正常に取得できる', async () => {
      const mockHygienists = [
        { id: 1, name: '田中花子', staff_id: 'H001' },
        { id: 2, name: '佐藤太郎', staff_id: 'H002' }
      ];

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: mockHygienists });

      // 各歯科衛生士の統計取得をモック
      jest.spyOn(HygienistReportModel, 'getHygienistMonthlyStats')
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
          hygienistId: 2,
          hygienistName: '佐藤太郎',
          staffId: 'H002',
          year: 2024,
          month: 1,
          totalVisits: 8,
          completedVisits: 7,
          cancelledVisits: 1,
          scheduledVisits: 0,
          totalHours: 10.0,
          averageVisitDuration: 80,
          visitDetails: []
        });

      const result = await HygienistReportModel.getHygienistComparisonReport(2024, 1);

      expect(result).toEqual({
        year: 2024,
        month: 1,
        hygienists: expect.arrayContaining([
          expect.objectContaining({
            hygienistName: '田中花子',
            totalVisits: 10
          }),
          expect.objectContaining({
            hygienistName: '佐藤太郎',
            totalVisits: 8
          })
        ]),
        totalHygienists: 2,
        averageVisitsPerHygienist: 9
      });
    });
  });

  describe('getHygienistYearlyStats', () => {
    it('歯科衛生士の年間統計を正常に取得できる', async () => {
      const mockMonthlyStats = {
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
      };

      jest.spyOn(HygienistReportModel, 'getHygienistMonthlyStats')
        .mockImplementation(async (params) => {
          if (params.month === 1) {
            return mockMonthlyStats;
          }
          return { ...mockMonthlyStats, month: params.month, totalVisits: 0 };
        });

      const result = await HygienistReportModel.getHygienistYearlyStats(1, 2024);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockMonthlyStats);
    });
  });
});