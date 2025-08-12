import { MonthlyReport } from '../MonthlyReport';
import { pool } from '../../database/connection';

// モックの設定
jest.mock('../../database/connection');

const mockPool = pool as jest.Mocked<typeof pool>;

describe('MonthlyReport Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePatientReport', () => {
    it('患者の月間レポートを生成できる', async () => {
      const mockRows = [
        {
          patient_id: 1,
          patient_name: '山田太郎',
          visit_date: '2024-01-15',
          hygienist_name: '田中花子',
          start_time: '09:00',
          end_time: '10:00',
          duration: 1.0
        },
        {
          patient_id: 1,
          patient_name: '山田太郎',
          visit_date: '2024-01-20',
          hygienist_name: '佐藤次郎',
          start_time: '14:00',
          end_time: '15:30',
          duration: 1.5
        }
      ];

      mockPool.query = jest.fn().mockResolvedValue({ rows: mockRows });

      const result = await MonthlyReport.generatePatientReport(1, 2024, 1);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1, 2024, 1]
      );
      expect(result).toEqual({
        patientId: 1,
        patientName: '山田太郎',
        year: 2024,
        month: 1,
        totalVisits: 2,
        totalHours: 2.5,
        visitDetails: [
          {
            date: '2024-01-15',
            hygienistName: '田中花子',
            startTime: '09:00',
            endTime: '10:00',
            duration: 1.0
          },
          {
            date: '2024-01-20',
            hygienistName: '佐藤次郎',
            startTime: '14:00',
            endTime: '15:30',
            duration: 1.5
          }
        ]
      });
    });

    it('データが存在しない患者の場合にnullを返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await MonthlyReport.generatePatientReport(999, 2024, 1);

      expect(result).toBeNull();
    });
  });

  describe('generateHygienistReport', () => {
    it('歯科衛生士の月間レポートを生成できる', async () => {
      const mockRows = [
        {
          hygienist_id: 1,
          hygienist_name: '田中花子',
          visit_date: '2024-01-15',
          patient_name: '山田太郎',
          start_time: '09:00',
          end_time: '10:00',
          duration: 1.0
        },
        {
          hygienist_id: 1,
          hygienist_name: '田中花子',
          visit_date: '2024-01-20',
          patient_name: '佐藤花子',
          start_time: '14:00',
          end_time: '16:00',
          duration: 2.0
        }
      ];

      mockPool.query = jest.fn().mockResolvedValue({ rows: mockRows });

      const result = await MonthlyReport.generateHygienistReport(1, 2024, 1);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1, 2024, 1]
      );
      expect(result).toEqual({
        hygienistId: 1,
        hygienistName: '田中花子',
        year: 2024,
        month: 1,
        totalVisits: 2,
        totalHours: 3.0,
        visitDetails: [
          {
            date: '2024-01-15',
            patientName: '山田太郎',
            startTime: '09:00',
            endTime: '10:00',
            duration: 1.0
          },
          {
            date: '2024-01-20',
            patientName: '佐藤花子',
            startTime: '14:00',
            endTime: '16:00',
            duration: 2.0
          }
        ]
      });
    });

    it('データが存在しない歯科衛生士の場合にnullを返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await MonthlyReport.generateHygienistReport(999, 2024, 1);

      expect(result).toBeNull();
    });
  });

  describe('generatePatientComparison', () => {
    it('患者の比較レポートを生成できる', async () => {
      const mockRows = [
        {
          patient_id: 1,
          patient_name: '山田太郎',
          total_visits: 4,
          total_hours: 4.5
        },
        {
          patient_id: 2,
          patient_name: '佐藤花子',
          total_visits: 3,
          total_hours: 3.0
        }
      ];

      mockPool.query = jest.fn().mockResolvedValue({ rows: mockRows });

      const result = await MonthlyReport.generatePatientComparison(2024, 1);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [2024, 1]
      );
      expect(result).toEqual([
        {
          patientId: 1,
          patientName: '山田太郎',
          totalVisits: 4,
          totalHours: 4.5
        },
        {
          patientId: 2,
          patientName: '佐藤花子',
          totalVisits: 3,
          totalHours: 3.0
        }
      ]);
    });

    it('データが存在しない場合に空配列を返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await MonthlyReport.generatePatientComparison(2024, 1);

      expect(result).toEqual([]);
    });
  });

  describe('generateHygienistComparison', () => {
    it('歯科衛生士の比較レポートを生成できる', async () => {
      const mockRows = [
        {
          hygienist_id: 1,
          hygienist_name: '田中花子',
          total_visits: 25,
          total_hours: 50.5
        },
        {
          hygienist_id: 2,
          hygienist_name: '佐藤次郎',
          total_visits: 30,
          total_hours: 60.0
        }
      ];

      mockPool.query = jest.fn().mockResolvedValue({ rows: mockRows });

      const result = await MonthlyReport.generateHygienistComparison(2024, 1);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [2024, 1]
      );
      expect(result).toEqual([
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
      ]);
    });

    it('データが存在しない場合に空配列を返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await MonthlyReport.generateHygienistComparison(2024, 1);

      expect(result).toEqual([]);
    });
  });

  describe('exportPatientReportToCsv', () => {
    it('患者レポートをCSV形式でエクスポートできる', async () => {
      const mockRows = [
        {
          patient_id: 1,
          patient_name: '山田太郎',
          total_visits: 4,
          total_hours: 4.5
        },
        {
          patient_id: 2,
          patient_name: '佐藤花子',
          total_visits: 3,
          total_hours: 3.0
        }
      ];

      mockPool.query = jest.fn().mockResolvedValue({ rows: mockRows });

      const result = await MonthlyReport.exportPatientReportToCsv(2024, 1);

      expect(result).toContain('患者ID,患者名,訪問回数,総時間');
      expect(result).toContain('1,山田太郎,4,4.5');
      expect(result).toContain('2,佐藤花子,3,3.0');
    });

    it('データが存在しない場合にヘッダーのみのCSVを返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await MonthlyReport.exportPatientReportToCsv(2024, 1);

      expect(result).toBe('患者ID,患者名,訪問回数,総時間\n');
    });
  });

  describe('exportHygienistReportToCsv', () => {
    it('歯科衛生士レポートをCSV形式でエクスポートできる', async () => {
      const mockRows = [
        {
          hygienist_id: 1,
          hygienist_name: '田中花子',
          total_visits: 25,
          total_hours: 50.5
        },
        {
          hygienist_id: 2,
          hygienist_name: '佐藤次郎',
          total_visits: 30,
          total_hours: 60.0
        }
      ];

      mockPool.query = jest.fn().mockResolvedValue({ rows: mockRows });

      const result = await MonthlyReport.exportHygienistReportToCsv(2024, 1);

      expect(result).toContain('歯科衛生士ID,歯科衛生士名,訪問回数,総時間');
      expect(result).toContain('1,田中花子,25,50.5');
      expect(result).toContain('2,佐藤次郎,30,60.0');
    });

    it('データが存在しない場合にヘッダーのみのCSVを返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await MonthlyReport.exportHygienistReportToCsv(2024, 1);

      expect(result).toBe('歯科衛生士ID,歯科衛生士名,訪問回数,総時間\n');
    });
  });
});