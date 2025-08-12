import { PatientReportModel } from '../PatientReport';
import { pool } from '../../database/connection';

// モックデータ
const mockPatient = {
  id: 1,
  name: '田中太郎',
  patient_id: 'P001'
};

// const mockHygienist = {
//   id: 1,
//   name: '佐藤花子',
//   staff_id: 'H001'
// };

const mockVisitRecords = [
  {
    id: 1,
    visit_date: new Date('2024-01-15'),
    start_time: '09:00',
    end_time: '10:00',
    status: 'completed',
    cancellation_reason: null,
    notes: '定期検診',
    hygienist_name: '佐藤花子',
    hygienist_staff_id: 'H001'
  },
  {
    id: 2,
    visit_date: new Date('2024-01-20'),
    start_time: '14:00',
    end_time: '15:30',
    status: 'completed',
    cancellation_reason: null,
    notes: 'クリーニング',
    hygienist_name: '佐藤花子',
    hygienist_staff_id: 'H001'
  },
  {
    id: 3,
    visit_date: new Date('2024-01-25'),
    start_time: null,
    end_time: null,
    status: 'cancelled',
    cancellation_reason: '体調不良',
    notes: null,
    hygienist_name: '佐藤花子',
    hygienist_staff_id: 'H001'
  }
];

// pool.queryのモック
jest.mock('../../database/connection', () => ({
  pool: {
    query: jest.fn()
  }
}));

const mockedPool = pool as any;

describe('PatientReportModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPatientMonthlyStats', () => {
    it('患者別月間統計を正しく取得できる', async () => {
      // 患者情報のモック
      mockedPool.query
        .mockResolvedValueOnce({
          rows: [mockPatient],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        // 訪問記録のモック
        .mockResolvedValueOnce({
          rows: mockVisitRecords,
          rowCount: 3,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await PatientReportModel.getPatientMonthlyStats({
        patientId: 1,
        year: 2024,
        month: 1
      });

      expect(result).not.toBeNull();
      expect(result!.patientId).toBe(1);
      expect(result!.patientName).toBe('田中太郎');
      expect(result!.year).toBe(2024);
      expect(result!.month).toBe(1);
      expect(result!.totalVisits).toBe(3);
      expect(result!.completedVisits).toBe(2);
      expect(result!.cancelledVisits).toBe(1);
      expect(result!.scheduledVisits).toBe(0);
      expect(result!.totalHours).toBe(2.5); // 1時間 + 1.5時間
      expect(result!.averageVisitDuration).toBe(75); // (60 + 90) / 2
      expect(result!.visitDetails).toHaveLength(3);
    });

    it('存在しない患者の場合nullを返す', async () => {
      mockedPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await PatientReportModel.getPatientMonthlyStats({
        patientId: 999,
        year: 2024,
        month: 1
      });

      expect(result).toBeNull();
    });

    it('データベースエラーの場合エラーを投げる', async () => {
      mockedPool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        PatientReportModel.getPatientMonthlyStats({
          patientId: 1,
          year: 2024,
          month: 1
        })
      ).rejects.toThrow('患者別月間統計の取得に失敗しました');
    });
  });

  describe('getPatientComparisonReport', () => {
    it('患者比較レポートを正しく取得できる', async () => {
      const mockPatients = [
        { id: 1, name: '田中太郎', patient_id: 'P001' },
        { id: 2, name: '山田花子', patient_id: 'P002' }
      ];

      // 患者一覧のモック
      mockedPool.query
        .mockResolvedValueOnce({
          rows: mockPatients,
          rowCount: 2,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        // 各患者の統計取得のモック（患者1）
        .mockResolvedValueOnce({
          rows: [mockPatients[0]],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: mockVisitRecords.slice(0, 2), // 完了した訪問のみ
          rowCount: 2,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        // 各患者の統計取得のモック（患者2）
        .mockResolvedValueOnce({
          rows: [mockPatients[1]],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: [mockVisitRecords[0]], // 1つの完了した訪問
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await PatientReportModel.getPatientComparisonReport(2024, 1);

      expect(result.year).toBe(2024);
      expect(result.month).toBe(1);
      expect(result.totalPatients).toBe(2);
      expect(result.patients).toHaveLength(2);
      expect(result.averageVisitsPerPatient).toBeGreaterThan(0);
    });

    it('該当月に訪問記録がない場合空の配列を返す', async () => {
      mockedPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await PatientReportModel.getPatientComparisonReport(2024, 12);

      expect(result.year).toBe(2024);
      expect(result.month).toBe(12);
      expect(result.totalPatients).toBe(0);
      expect(result.patients).toHaveLength(0);
      expect(result.averageVisitsPerPatient).toBe(0);
    });
  });

  describe('getPatientYearlyStats', () => {
    it('患者の年間統計を正しく取得できる', async () => {
      // 各月の統計取得のモック（簡略化のため1月のみ）
      mockedPool.query
        .mockResolvedValue({
          rows: [mockPatient],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValue({
          rows: mockVisitRecords,
          rowCount: 3,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await PatientReportModel.getPatientYearlyStats(1, 2024);

      expect(Array.isArray(result)).toBe(true);
      // 実際のテストでは各月のデータが含まれることを確認
    });
  });
});