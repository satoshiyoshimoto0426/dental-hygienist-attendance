import { VisitRecordModel } from '../VisitRecord';
import { pool } from '../../database/connection';
import { CreateVisitRecordInput, UpdateVisitRecordInput } from '../../types/VisitRecord';

describe('VisitRecord Model', () => {
  let testPatientId: number;
  let testHygienistId: number;
  let testVisitRecordId: number;

  beforeAll(async () => {
    // テスト用患者を作成
    const patientResult = await pool.query(
      'INSERT INTO patients (patient_id, name) VALUES ($1, $2) RETURNING id',
      ['TEST001', 'テスト患者']
    );
    testPatientId = patientResult.rows[0].id;

    // テスト用歯科衛生士を作成
    const hygienistResult = await pool.query(
      'INSERT INTO hygienists (staff_id, name) VALUES ($1, $2) RETURNING id',
      ['STAFF001', 'テスト歯科衛生士']
    );
    testHygienistId = hygienistResult.rows[0].id;
  });

  afterAll(async () => {
    // テストデータをクリーンアップ
    await pool.query('DELETE FROM visit_records WHERE patient_id = $1 OR hygienist_id = $2', [testPatientId, testHygienistId]);
    await pool.query('DELETE FROM patients WHERE id = $1', [testPatientId]);
    await pool.query('DELETE FROM hygienists WHERE id = $1', [testHygienistId]);
  });

  afterEach(async () => {
    // 各テスト後に訪問記録をクリーンアップ
    await pool.query('DELETE FROM visit_records WHERE patient_id = $1 OR hygienist_id = $2', [testPatientId, testHygienistId]);
  });

  describe('create', () => {
    it('有効なデータで訪問記録を作成できる', async () => {
      const input: CreateVisitRecordInput = {
        patientId: testPatientId,
        hygienistId: testHygienistId,
        visitDate: new Date('2024-01-15'),
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed',
        notes: 'テスト訪問記録'
      };

      const result = await VisitRecordModel.create(input);

      expect(result).toHaveProperty('id');
      expect(result.patientId).toBe(testPatientId);
      expect(result.hygienistId).toBe(testHygienistId);
      expect(result.visitDate).toEqual(new Date('2024-01-15'));
      expect(result.startTime).toBe('09:00:00');
      expect(result.endTime).toBe('10:00:00');
      expect(result.status).toBe('completed');
      expect(result.notes).toBe('テスト訪問記録');

      testVisitRecordId = result.id;
    });

    it('最小限のデータで訪問記録を作成できる', async () => {
      const input: CreateVisitRecordInput = {
        patientId: testPatientId,
        hygienistId: testHygienistId,
        visitDate: new Date('2024-01-15')
      };

      const result = await VisitRecordModel.create(input);

      expect(result).toHaveProperty('id');
      expect(result.patientId).toBe(testPatientId);
      expect(result.hygienistId).toBe(testHygienistId);
      expect(result.status).toBe('completed'); // デフォルト値
    });

    it('存在しない患者IDの場合はエラーを投げる', async () => {
      const input: CreateVisitRecordInput = {
        patientId: 99999,
        hygienistId: testHygienistId,
        visitDate: new Date('2024-01-15')
      };

      await expect(VisitRecordModel.create(input)).rejects.toThrow('指定された患者が存在しません');
    });

    it('存在しない歯科衛生士IDの場合はエラーを投げる', async () => {
      const input: CreateVisitRecordInput = {
        patientId: testPatientId,
        hygienistId: 99999,
        visitDate: new Date('2024-01-15')
      };

      await expect(VisitRecordModel.create(input)).rejects.toThrow('指定された歯科衛生士が存在しません');
    });

    it('終了時間が開始時間より前の場合はエラーを投げる', async () => {
      const input: CreateVisitRecordInput = {
        patientId: testPatientId,
        hygienistId: testHygienistId,
        visitDate: new Date('2024-01-15'),
        startTime: '10:00',
        endTime: '09:00'
      };

      await expect(VisitRecordModel.create(input)).rejects.toThrow('終了時間は開始時間より後である必要があります');
    });

    it('無効なデータの場合はバリデーションエラーを投げる', async () => {
      const input = {
        patientId: 'invalid', // 数値でない
        hygienistId: testHygienistId,
        visitDate: new Date('2024-01-15')
      } as any;

      await expect(VisitRecordModel.create(input)).rejects.toThrow('バリデーションエラー');
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // テスト用データを作成
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [testPatientId, testHygienistId, '2024-01-15', '09:00', '10:00', 'completed', 'テスト記録1']
      );
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [testPatientId, testHygienistId, '2024-01-16', '10:00', '11:00', 'scheduled', 'テスト記録2']
      );
    });

    it('全ての訪問記録を取得できる', async () => {
      const results = await VisitRecordModel.findAll();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(2);
      
      // 関連データが含まれていることを確認
      const testRecord = results.find(r => r.patientId === testPatientId);
      expect(testRecord).toBeDefined();
      expect(testRecord?.patient).toBeDefined();
      expect(testRecord?.hygienist).toBeDefined();
    });
  });

  describe('findById', () => {
    beforeEach(async () => {
      const result = await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [testPatientId, testHygienistId, '2024-01-15', '09:00', '10:00', 'completed', 'テスト記録']
      );
      testVisitRecordId = result.rows[0].id;
    });

    it('指定されたIDの訪問記録を取得できる', async () => {
      const result = await VisitRecordModel.findById(testVisitRecordId);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(testVisitRecordId);
      expect(result!.patientId).toBe(testPatientId);
      expect(result!.hygienistId).toBe(testHygienistId);
      expect(result!.patient).toBeDefined();
      expect(result!.hygienist).toBeDefined();
    });

    it('存在しないIDの場合はnullを返す', async () => {
      const result = await VisitRecordModel.findById(99999);
      expect(result).toBeNull();
    });
  });

  describe('findByMonth', () => {
    beforeEach(async () => {
      // 2024年1月のデータ
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-15', 'completed')`,
        [testPatientId, testHygienistId]
      );
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-20', 'completed')`,
        [testPatientId, testHygienistId]
      );
      // 2024年2月のデータ
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-02-10', 'completed')`,
        [testPatientId, testHygienistId]
      );
    });

    it('指定された月の訪問記録を取得できる', async () => {
      const results = await VisitRecordModel.findByMonth(2024, 1);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      
      results.forEach(record => {
        const visitDate = new Date(record.visitDate);
        expect(visitDate.getFullYear()).toBe(2024);
        expect(visitDate.getMonth() + 1).toBe(1); // getMonth()は0ベース
      });
    });

    it('該当する記録がない月の場合は空配列を返す', async () => {
      const results = await VisitRecordModel.findByMonth(2024, 12);
      expect(results).toEqual([]);
    });
  });

  describe('findByPatientId', () => {
    beforeEach(async () => {
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-15', 'completed')`,
        [testPatientId, testHygienistId]
      );
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-20', 'completed')`,
        [testPatientId, testHygienistId]
      );
    });

    it('指定された患者の訪問記録を取得できる', async () => {
      const results = await VisitRecordModel.findByPatientId(testPatientId);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      
      results.forEach(record => {
        expect(record.patientId).toBe(testPatientId);
      });
    });

    it('年月を指定して患者の訪問記録を取得できる', async () => {
      const results = await VisitRecordModel.findByPatientId(testPatientId, 2024, 1);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
    });
  });

  describe('findByHygienistId', () => {
    beforeEach(async () => {
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-15', 'completed')`,
        [testPatientId, testHygienistId]
      );
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-20', 'completed')`,
        [testPatientId, testHygienistId]
      );
    });

    it('指定された歯科衛生士の訪問記録を取得できる', async () => {
      const results = await VisitRecordModel.findByHygienistId(testHygienistId);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      
      results.forEach(record => {
        expect(record.hygienistId).toBe(testHygienistId);
      });
    });

    it('年月を指定して歯科衛生士の訪問記録を取得できる', async () => {
      const results = await VisitRecordModel.findByHygienistId(testHygienistId, 2024, 1);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      const result = await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [testPatientId, testHygienistId, '2024-01-15', '09:00', '10:00', 'completed', 'テスト記録']
      );
      testVisitRecordId = result.rows[0].id;
    });

    it('訪問記録を更新できる', async () => {
      const input: UpdateVisitRecordInput = {
        startTime: '10:00',
        endTime: '11:00',
        status: 'cancelled',
        cancellationReason: 'テストキャンセル',
        notes: '更新されたテスト記録'
      };

      const result = await VisitRecordModel.update(testVisitRecordId, input);

      expect(result).not.toBeNull();
      expect(result!.startTime).toBe('10:00:00');
      expect(result!.endTime).toBe('11:00:00');
      expect(result!.status).toBe('cancelled');
      expect(result!.cancellationReason).toBe('テストキャンセル');
      expect(result!.notes).toBe('更新されたテスト記録');
    });

    it('存在しないIDの場合はnullを返す', async () => {
      const input: UpdateVisitRecordInput = { notes: '更新テスト' };
      const result = await VisitRecordModel.update(99999, input);
      expect(result).toBeNull();
    });

    it('更新するフィールドがない場合は既存データを返す', async () => {
      const input: UpdateVisitRecordInput = {};
      const result = await VisitRecordModel.update(testVisitRecordId, input);
      
      expect(result).not.toBeNull();
      expect(result!.id).toBe(testVisitRecordId);
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      const result = await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [testPatientId, testHygienistId, '2024-01-15', '09:00', '10:00', 'completed', 'テスト記録']
      );
      testVisitRecordId = result.rows[0].id;
    });

    it('訪問記録を削除できる', async () => {
      const result = await VisitRecordModel.delete(testVisitRecordId);
      expect(result).toBe(true);

      // 削除されたことを確認
      const deletedRecord = await VisitRecordModel.findById(testVisitRecordId);
      expect(deletedRecord).toBeNull();
    });

    it('存在しないIDの場合はfalseを返す', async () => {
      const result = await VisitRecordModel.delete(99999);
      expect(result).toBe(false);
    });
  });

  describe('getPatientMonthlyVisitCount', () => {
    beforeEach(async () => {
      // 2024年1月の完了した訪問記録
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-15', 'completed')`,
        [testPatientId, testHygienistId]
      );
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-20', 'completed')`,
        [testPatientId, testHygienistId]
      );
      // キャンセルされた記録（カウントされない）
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-25', 'cancelled')`,
        [testPatientId, testHygienistId]
      );
    });

    it('患者の月間訪問回数を取得できる', async () => {
      const count = await VisitRecordModel.getPatientMonthlyVisitCount(testPatientId, 2024, 1);
      expect(count).toBe(2); // completedのみカウント
    });

    it('該当する記録がない場合は0を返す', async () => {
      const count = await VisitRecordModel.getPatientMonthlyVisitCount(testPatientId, 2024, 12);
      expect(count).toBe(0);
    });
  });

  describe('getHygienistMonthlyVisitCount', () => {
    beforeEach(async () => {
      // 2024年1月の完了した訪問記録
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-15', 'completed')`,
        [testPatientId, testHygienistId]
      );
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-20', 'completed')`,
        [testPatientId, testHygienistId]
      );
      // キャンセルされた記録（カウントされない）
      await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, status) 
         VALUES ($1, $2, '2024-01-25', 'cancelled')`,
        [testPatientId, testHygienistId]
      );
    });

    it('歯科衛生士の月間訪問回数を取得できる', async () => {
      const count = await VisitRecordModel.getHygienistMonthlyVisitCount(testHygienistId, 2024, 1);
      expect(count).toBe(2); // completedのみカウント
    });

    it('該当する記録がない場合は0を返す', async () => {
      const count = await VisitRecordModel.getHygienistMonthlyVisitCount(testHygienistId, 2024, 12);
      expect(count).toBe(0);
    });
  });
});