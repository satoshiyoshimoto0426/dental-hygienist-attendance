import { DailyVisitRecord } from '../DailyVisitRecord';
import { pool } from '../../database/connection';

// モックの設定
jest.mock('../../database/connection');

const mockPool = pool as jest.Mocked<typeof pool>;

describe('DailyVisitRecord Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByMonth', () => {
    it('指定された月の日次訪問記録を取得できる', async () => {
      const mockRows = [
        {
          id: 1,
          date: '2024-01-15',
          patient_id: 1,
          hygienist_id: 1,
          start_time: '09:00',
          end_time: '10:00',
          status: 'completed',
          notes: 'テストメモ',
          created_at: new Date(),
          updated_at: new Date(),
          patient_name: '山田太郎',
          hygienist_name: '田中花子'
        }
      ];

      mockPool.query = jest.fn().mockResolvedValue({ rows: mockRows });

      const result = await DailyVisitRecord.findByMonth(2024, 1);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [2024, 1]
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        date: '2024-01-15',
        patientId: 1,
        hygienistId: 1,
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed',
        notes: 'テストメモ',
        createdAt: mockRows[0].created_at,
        updatedAt: mockRows[0].updated_at,
        patient: { id: 1, name: '山田太郎' },
        hygienist: { id: 1, name: '田中花子' }
      });
    });

    it('データが存在しない場合に空配列を返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await DailyVisitRecord.findByMonth(2024, 1);

      expect(result).toEqual([]);
    });

    it('データベースエラーが発生した場合にエラーを投げる', async () => {
      const dbError = new Error('Database connection failed');
      mockPool.query = jest.fn().mockRejectedValue(dbError);

      await expect(DailyVisitRecord.findByMonth(2024, 1)).rejects.toThrow(dbError);
    });
  });

  describe('create', () => {
    it('新しい日次訪問記録を作成できる', async () => {
      const newRecord = {
        date: '2024-01-15',
        patientId: 1,
        hygienistId: 1,
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed' as const,
        notes: 'テストメモ'
      };

      const mockCreatedRecord = {
        id: 1,
        date: '2024-01-15',
        patient_id: 1,
        hygienist_id: 1,
        start_time: '09:00',
        end_time: '10:00',
        status: 'completed',
        notes: 'テストメモ',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query = jest.fn().mockResolvedValue({ rows: [mockCreatedRecord] });

      const result = await DailyVisitRecord.create(newRecord);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO daily_visit_records'),
        [
          newRecord.date,
          newRecord.patientId,
          newRecord.hygienistId,
          newRecord.startTime,
          newRecord.endTime,
          newRecord.status,
          newRecord.notes
        ]
      );
      expect(result).toEqual({
        id: 1,
        date: '2024-01-15',
        patientId: 1,
        hygienistId: 1,
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed',
        notes: 'テストメモ',
        createdAt: mockCreatedRecord.created_at,
        updatedAt: mockCreatedRecord.updated_at
      });
    });

    it('必須フィールドが不足している場合にエラーを投げる', async () => {
      const invalidRecord = {
        date: '2024-01-15',
        patientId: 1
        // hygienistId が不足
      } as any;

      await expect(DailyVisitRecord.create(invalidRecord)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('既存の日次訪問記録を更新できる', async () => {
      const updateData = {
        startTime: '10:00',
        endTime: '11:00',
        notes: '更新されたメモ'
      };

      const mockUpdatedRecord = {
        id: 1,
        date: '2024-01-15',
        patient_id: 1,
        hygienist_id: 1,
        start_time: '10:00',
        end_time: '11:00',
        status: 'completed',
        notes: '更新されたメモ',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query = jest.fn().mockResolvedValue({ rows: [mockUpdatedRecord] });

      const result = await DailyVisitRecord.update(1, updateData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE daily_visit_records'),
        expect.arrayContaining([1])
      );
      expect(result).toEqual({
        id: 1,
        date: '2024-01-15',
        patientId: 1,
        hygienistId: 1,
        startTime: '10:00',
        endTime: '11:00',
        status: 'completed',
        notes: '更新されたメモ',
        createdAt: mockUpdatedRecord.created_at,
        updatedAt: mockUpdatedRecord.updated_at
      });
    });

    it('存在しない記録IDで更新した場合にnullを返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await DailyVisitRecord.update(999, { notes: '更新されたメモ' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('日次訪問記録を削除できる', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rowCount: 1 });

      const result = await DailyVisitRecord.delete(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM daily_visit_records WHERE id = $1',
        [1]
      );
      expect(result).toBe(true);
    });

    it('存在しない記録IDで削除した場合にfalseを返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rowCount: 0 });

      const result = await DailyVisitRecord.delete(999);

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('IDで日次訪問記録を取得できる', async () => {
      const mockRecord = {
        id: 1,
        date: '2024-01-15',
        patient_id: 1,
        hygienist_id: 1,
        start_time: '09:00',
        end_time: '10:00',
        status: 'completed',
        notes: 'テストメモ',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query = jest.fn().mockResolvedValue({ rows: [mockRecord] });

      const result = await DailyVisitRecord.findById(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM daily_visit_records WHERE id = $1',
        [1]
      );
      expect(result).toEqual({
        id: 1,
        date: '2024-01-15',
        patientId: 1,
        hygienistId: 1,
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed',
        notes: 'テストメモ',
        createdAt: mockRecord.created_at,
        updatedAt: mockRecord.updated_at
      });
    });

    it('存在しないIDで検索した場合にnullを返す', async () => {
      mockPool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await DailyVisitRecord.findById(999);

      expect(result).toBeNull();
    });
  });
});