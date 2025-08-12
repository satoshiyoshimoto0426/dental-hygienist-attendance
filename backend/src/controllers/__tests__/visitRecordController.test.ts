import request from 'supertest';
import app from '../../server';
import { pool } from '../../database/connection';
import jwt from 'jsonwebtoken';

// テスト用のJWTトークンを生成
const generateTestToken = () => {
  return jwt.sign(
    { userId: 1, username: 'testuser', role: 'admin' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

describe('VisitRecord Controller', () => {
  let authToken: string;
  let testPatientId: number;
  let testHygienistId: number;
  let testVisitRecordId: number;

  beforeAll(async () => {
    authToken = generateTestToken();

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

  describe('POST /api/visit-records', () => {
    it('有効なデータで訪問記録を作成できる', async () => {
      const visitRecordData = {
        patientId: testPatientId,
        hygienistId: testHygienistId,
        visitDate: '2024-01-15',
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed',
        notes: 'テスト訪問記録'
      };

      const response = await request(app)
        .post('/api/visit-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(visitRecordData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.patientId).toBe(testPatientId);
      expect(response.body.data.hygienistId).toBe(testHygienistId);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.notes).toBe('テスト訪問記録');

      testVisitRecordId = response.body.data.id;
    });

    it('必須フィールドが不足している場合はエラーを返す', async () => {
      const invalidData = {
        patientId: testPatientId,
        // hygienistId が不足
        visitDate: '2024-01-15'
      };

      const response = await request(app)
        .post('/api/visit-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('存在しない患者IDの場合はエラーを返す', async () => {
      const invalidData = {
        patientId: 99999,
        hygienistId: testHygienistId,
        visitDate: '2024-01-15'
      };

      const response = await request(app)
        .post('/api/visit-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_INPUT');
      expect(response.body.error.message).toContain('患者が存在しません');
    });

    it('終了時間が開始時間より前の場合はエラーを返す', async () => {
      const invalidData = {
        patientId: testPatientId,
        hygienistId: testHygienistId,
        visitDate: '2024-01-15',
        startTime: '10:00',
        endTime: '09:00'
      };

      const response = await request(app)
        .post('/api/visit-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_INPUT');
      expect(response.body.error.message).toContain('時間');
    });

    it('認証なしではアクセスできない', async () => {
      const visitRecordData = {
        patientId: testPatientId,
        hygienistId: testHygienistId,
        visitDate: '2024-01-15'
      };

      await request(app)
        .post('/api/visit-records')
        .send(visitRecordData)
        .expect(401);
    });
  });

  describe('GET /api/visit-records', () => {
    beforeEach(async () => {
      // テスト用訪問記録を作成
      const result = await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [testPatientId, testHygienistId, '2024-01-15', '09:00', '10:00', 'completed', 'テスト記録']
      );
      testVisitRecordId = result.rows[0].id;
    });

    it('訪問記録一覧を取得できる', async () => {
      const response = await request(app)
        .get('/api/visit-records')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('月間訪問記録を取得できる', async () => {
      const response = await request(app)
        .get('/api/visit-records?year=2024&month=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('患者別訪問記録を取得できる', async () => {
      const response = await request(app)
        .get(`/api/visit-records?patientId=${testPatientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].patientId).toBe(testPatientId);
    });

    it('歯科衛生士別訪問記録を取得できる', async () => {
      const response = await request(app)
        .get(`/api/visit-records?hygienistId=${testHygienistId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0].hygienistId).toBe(testHygienistId);
    });
  });

  describe('GET /api/visit-records/:id', () => {
    beforeEach(async () => {
      const result = await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [testPatientId, testHygienistId, '2024-01-15', '09:00', '10:00', 'completed', 'テスト記録']
      );
      testVisitRecordId = result.rows[0].id;
    });

    it('指定されたIDの訪問記録を取得できる', async () => {
      const response = await request(app)
        .get(`/api/visit-records/${testVisitRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testVisitRecordId);
      expect(response.body.data.patientId).toBe(testPatientId);
      expect(response.body.data.hygienistId).toBe(testHygienistId);
    });

    it('存在しないIDの場合は404を返す', async () => {
      const response = await request(app)
        .get('/api/visit-records/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VISIT_RECORD_NOT_FOUND');
    });
  });

  describe('PUT /api/visit-records/:id', () => {
    beforeEach(async () => {
      const result = await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [testPatientId, testHygienistId, '2024-01-15', '09:00', '10:00', 'completed', 'テスト記録']
      );
      testVisitRecordId = result.rows[0].id;
    });

    it('訪問記録を更新できる', async () => {
      const updateData = {
        startTime: '10:00',
        endTime: '11:00',
        status: 'cancelled',
        cancellationReason: 'テストキャンセル',
        notes: '更新されたテスト記録'
      };

      const response = await request(app)
        .put(`/api/visit-records/${testVisitRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startTime).toBe('10:00:00');
      expect(response.body.data.endTime).toBe('11:00:00');
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.cancellationReason).toBe('テストキャンセル');
      expect(response.body.data.notes).toBe('更新されたテスト記録');
    });

    it('存在しないIDの場合は404を返す', async () => {
      const updateData = { notes: '更新テスト' };

      const response = await request(app)
        .put('/api/visit-records/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VISIT_RECORD_NOT_FOUND');
    });
  });

  describe('DELETE /api/visit-records/:id', () => {
    beforeEach(async () => {
      const result = await pool.query(
        `INSERT INTO visit_records (patient_id, hygienist_id, visit_date, start_time, end_time, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [testPatientId, testHygienistId, '2024-01-15', '09:00', '10:00', 'completed', 'テスト記録']
      );
      testVisitRecordId = result.rows[0].id;
    });

    it('訪問記録を削除できる', async () => {
      const response = await request(app)
        .delete(`/api/visit-records/${testVisitRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('訪問記録を削除しました');

      // 削除されたことを確認
      const checkResponse = await request(app)
        .get(`/api/visit-records/${testVisitRecordId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('存在しないIDの場合は404を返す', async () => {
      const response = await request(app)
        .delete('/api/visit-records/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VISIT_RECORD_NOT_FOUND');
    });
  });

  describe('GET /api/visit-records/stats/monthly', () => {
    beforeEach(async () => {
      // 複数のテスト用訪問記録を作成
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

    it('月間統計を取得できる', async () => {
      const response = await request(app)
        .get('/api/visit-records/stats/monthly?year=2024&month=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalVisits');
      expect(response.body.data).toHaveProperty('patientStats');
      expect(response.body.data).toHaveProperty('hygienistStats');
      expect(response.body.data).toHaveProperty('visitRecords');
      expect(response.body.data.totalVisits).toBeGreaterThan(0);
    });

    it('年と月のパラメータが不足している場合はエラーを返す', async () => {
      const response = await request(app)
        .get('/api/visit-records/stats/monthly')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_PARAMETERS');
    });
  });
});