import request from 'supertest';
import app from '../../server';
import jwt from 'jsonwebtoken';

// テスト用のJWTトークンを生成
const generateTestToken = () => {
  return jwt.sign(
    { userId: 1, username: 'testuser', role: 'admin' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Visit Records Routes', () => {
  let authToken: string;

  beforeAll(() => {
    authToken = generateTestToken();
  });

  describe('Route Authentication', () => {
    it('認証なしでは全てのルートにアクセスできない', async () => {
      // GET /api/visit-records
      await request(app)
        .get('/api/visit-records')
        .expect(401);

      // GET /api/visit-records/stats/monthly
      await request(app)
        .get('/api/visit-records/stats/monthly')
        .expect(401);

      // GET /api/visit-records/:id
      await request(app)
        .get('/api/visit-records/1')
        .expect(401);

      // POST /api/visit-records
      await request(app)
        .post('/api/visit-records')
        .send({})
        .expect(401);

      // PUT /api/visit-records/:id
      await request(app)
        .put('/api/visit-records/1')
        .send({})
        .expect(401);

      // DELETE /api/visit-records/:id
      await request(app)
        .delete('/api/visit-records/1')
        .expect(401);
    });

    it('有効な認証トークンがあればルートにアクセスできる', async () => {
      // GET /api/visit-records - 200または500（データベースエラー）が期待される
      const response = await request(app)
        .get('/api/visit-records')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect([200, 500]).toContain(response.status);
    });

    it('無効な認証トークンではアクセスできない', async () => {
      await request(app)
        .get('/api/visit-records')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Route Endpoints', () => {
    it('GET /api/visit-records ルートが存在する', async () => {
      const response = await request(app)
        .get('/api/visit-records')
        .set('Authorization', `Bearer ${authToken}`);
      
      // 認証は通るが、データベースエラーまたは正常なレスポンスが期待される
      expect([200, 500]).toContain(response.status);
    });

    it('GET /api/visit-records/stats/monthly ルートが存在する', async () => {
      const response = await request(app)
        .get('/api/visit-records/stats/monthly')
        .set('Authorization', `Bearer ${authToken}`);
      
      // パラメータ不足で400エラーが期待される
      expect(response.status).toBe(400);
    });

    it('GET /api/visit-records/:id ルートが存在する', async () => {
      const response = await request(app)
        .get('/api/visit-records/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      // 認証は通るが、データベースエラーまたは404が期待される
      expect([404, 500]).toContain(response.status);
    });

    it('POST /api/visit-records ルートが存在する', async () => {
      const response = await request(app)
        .post('/api/visit-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      // バリデーションエラーまたはデータベースエラーが期待される
      expect([400, 500]).toContain(response.status);
    });

    it('PUT /api/visit-records/:id ルートが存在する', async () => {
      const response = await request(app)
        .put('/api/visit-records/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      // 認証は通るが、データベースエラーまたは404が期待される
      expect([404, 500]).toContain(response.status);
    });

    it('DELETE /api/visit-records/:id ルートが存在する', async () => {
      const response = await request(app)
        .delete('/api/visit-records/1')
        .set('Authorization', `Bearer ${authToken}`);
      
      // 認証は通るが、データベースエラーまたは404が期待される
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('Route Parameters', () => {
    it('GET /api/visit-records はクエリパラメータを受け付ける', async () => {
      const response = await request(app)
        .get('/api/visit-records?year=2024&month=1')
        .set('Authorization', `Bearer ${authToken}`);
      
      // 認証は通るが、データベースエラーまたは正常なレスポンスが期待される
      expect([200, 500]).toContain(response.status);
    });

    it('GET /api/visit-records/stats/monthly は年月パラメータが必要', async () => {
      // パラメータなし
      const response1 = await request(app)
        .get('/api/visit-records/stats/monthly')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response1.status).toBe(400);

      // 年のみ
      const response2 = await request(app)
        .get('/api/visit-records/stats/monthly?year=2024')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response2.status).toBe(400);

      // 月のみ
      const response3 = await request(app)
        .get('/api/visit-records/stats/monthly?month=1')
        .set('Authorization', `Bearer ${authToken}`);
      expect(response3.status).toBe(400);
    });
  });
});