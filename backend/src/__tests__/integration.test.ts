import request from 'supertest';
import { app } from '../server';
import { pool } from '../database/connection';

// テスト用のデータベース設定
beforeAll(async () => {
  // テスト用データベースのセットアップ
  await pool.query('BEGIN');
});

afterAll(async () => {
  // テスト用データベースのクリーンアップ
  await pool.query('ROLLBACK');
  await pool.end();
});

describe('API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // テスト用ユーザーでログインしてトークンを取得
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword'
      });

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.data.token;
    }
  });

  describe('認証フロー', () => {
    it('ログイン → 認証確認 → ログアウトの一連の流れが正常に動作する', async () => {
      // ログイン
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpassword'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();

      const token = loginResponse.body.data.token;

      // 認証確認
      const verifyResponse = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);

      // ログアウト
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
    });
  });

  describe('患者マスタ管理フロー', () => {
    it('患者の作成 → 取得 → 更新 → 削除の一連の流れが正常に動作する', async () => {
      const newPatient = {
        patientId: 'TEST001',
        name: 'テスト患者',
        phone: '090-1234-5678',
        email: 'test@example.com',
        address: 'テスト住所'
      };

      // 患者作成
      const createResponse = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPatient);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      const createdPatient = createResponse.body.data;

      // 患者一覧取得
      const listResponse = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data).toContainEqual(
        expect.objectContaining({ id: createdPatient.id })
      );

      // 患者更新
      const updateData = { name: '更新されたテスト患者' };
      const updateResponse = await request(app)
        .put(`/api/patients/${createdPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe(updateData.name);

      // 患者削除
      const deleteResponse = await request(app)
        .delete(`/api/patients/${createdPatient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('歯科衛生士マスタ管理フロー', () => {
    it('歯科衛生士の作成 → 取得 → 更新 → 削除の一連の流れが正常に動作する', async () => {
      const newHygienist = {
        staffId: 'H001',
        name: 'テスト歯科衛生士',
        licenseNumber: 'L123456',
        phone: '090-1234-5678',
        email: 'hygienist@example.com'
      };

      // 歯科衛生士作成
      const createResponse = await request(app)
        .post('/api/hygienists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newHygienist);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      const createdHygienist = createResponse.body.data;

      // 歯科衛生士一覧取得
      const listResponse = await request(app)
        .get('/api/hygienists')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data).toContainEqual(
        expect.objectContaining({ id: createdHygienist.id })
      );

      // 歯科衛生士更新
      const updateData = { name: '更新されたテスト歯科衛生士' };
      const updateResponse = await request(app)
        .put(`/api/hygienists/${createdHygienist.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.name).toBe(updateData.name);

      // 歯科衛生士削除
      const deleteResponse = await request(app)
        .delete(`/api/hygienists/${createdHygienist.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('訪問記録管理フロー', () => {
    let testPatientId: number;
    let testHygienistId: number;

    beforeAll(async () => {
      // テスト用患者と歯科衛生士を作成
      const patientResponse = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          patientId: 'VISIT_TEST001',
          name: '訪問テスト患者'
        });
      testPatientId = patientResponse.body.data.id;

      const hygienistResponse = await request(app)
        .post('/api/hygienists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          staffId: 'VISIT_H001',
          name: '訪問テスト歯科衛生士'
        });
      testHygienistId = hygienistResponse.body.data.id;
    });

    it('訪問記録の作成 → 取得 → 更新 → 削除の一連の流れが正常に動作する', async () => {
      const newVisitRecord = {
        date: '2024-01-15',
        patientId: testPatientId,
        hygienistId: testHygienistId,
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed',
        notes: 'テスト訪問記録'
      };

      // 訪問記録作成
      const createResponse = await request(app)
        .post('/api/daily-visit-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newVisitRecord);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.success).toBe(true);
      const createdRecord = createResponse.body.data;

      // 訪問記録一覧取得
      const listResponse = await request(app)
        .get('/api/daily-visit-records')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 });

      expect(listResponse.status).toBe(200);
      expect(listResponse.body.success).toBe(true);
      expect(listResponse.body.data).toContainEqual(
        expect.objectContaining({ id: createdRecord.id })
      );

      // 訪問記録更新
      const updateData = { notes: '更新されたテスト訪問記録' };
      const updateResponse = await request(app)
        .put(`/api/daily-visit-records/${createdRecord.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.notes).toBe(updateData.notes);

      // 訪問記録削除
      const deleteResponse = await request(app)
        .delete(`/api/daily-visit-records/${createdRecord.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });

  describe('レポート機能フロー', () => {
    it('患者レポートの取得とCSVエクスポートが正常に動作する', async () => {
      // 患者別月間レポート取得
      const patientReportResponse = await request(app)
        .get('/api/patient-reports/patient/1/monthly')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 });

      expect(patientReportResponse.status).toBeOneOf([200, 404]); // データがない場合は404

      // 患者比較レポート取得
      const comparisonResponse = await request(app)
        .get('/api/patient-reports/comparison')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 });

      expect(comparisonResponse.status).toBe(200);
      expect(comparisonResponse.body.success).toBe(true);

      // CSV エクスポート
      const csvResponse = await request(app)
        .get('/api/patient-reports/export/csv')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 });

      expect(csvResponse.status).toBe(200);
      expect(csvResponse.headers['content-type']).toBe('text/csv; charset=utf-8');
    });

    it('歯科衛生士レポートの取得とCSVエクスポートが正常に動作する', async () => {
      // 歯科衛生士別月間レポート取得
      const hygienistReportResponse = await request(app)
        .get('/api/hygienist-reports/hygienist/1/monthly')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 });

      expect(hygienistReportResponse.status).toBeOneOf([200, 404]); // データがない場合は404

      // 歯科衛生士比較レポート取得
      const comparisonResponse = await request(app)
        .get('/api/hygienist-reports/comparison')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 });

      expect(comparisonResponse.status).toBe(200);
      expect(comparisonResponse.body.success).toBe(true);

      // CSV エクスポート
      const csvResponse = await request(app)
        .get('/api/hygienist-reports/export/csv')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ year: 2024, month: 1 });

      expect(csvResponse.status).toBe(200);
      expect(csvResponse.headers['content-type']).toBe('text/csv; charset=utf-8');
    });
  });

  describe('エラーハンドリング', () => {
    it('認証なしでAPIにアクセスした場合に401エラーが返される', async () => {
      const response = await request(app)
        .get('/api/patients');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('存在しないエンドポイントにアクセスした場合に404エラーが返される', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('無効なデータでAPIにアクセスした場合にバリデーションエラーが返される', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // name が不足
          patientId: 'INVALID001'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});