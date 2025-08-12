import request from 'supertest';
import app from '../server';
import { config } from '../config/environment';

describe('統合テスト - API連携の最終確認', () => {
  describe('環境設定の確認', () => {
    it('環境変数が正しく読み込まれている', () => {
      // 必須の環境変数が設定されていることを確認
      expect(config.server.port).toBeDefined();
      expect(config.jwt.secret).toBeDefined();
      expect(config.database.host).toBeDefined();
      expect(config.database.name).toBeDefined();
      expect(config.cors.origin).toBeDefined();
      
      // 本番環境設定の確認
      if (config.server.nodeEnv === 'production') {
        expect(config.jwt.secret).not.toBe('your-secret-key');
        expect(config.database.password).not.toBe('password');
        expect(config.security.rateLimitMaxRequests).toBeGreaterThan(0);
      }
    });

    it('ヘルスチェックエンドポイントが正常に動作する', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        environment: config.server.nodeEnv
      });
    });
  });

  describe('API エンドポイントの存在確認', () => {
    it('認証エンドポイントが存在する', async () => {
      // ログインエンドポイント
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({});
      
      // 400 (バリデーションエラー) または 500 (サーバーエラー) が返されることを確認
      // 404 でなければエンドポイントは存在する
      expect(loginResponse.status).not.toBe(404);
    });

    it('患者マスタエンドポイントが存在する', async () => {
      const response = await request(app)
        .get('/api/patients');
      
      // 401 (認証エラー) が返されることを確認 (エンドポイントは存在する)
      expect(response.status).toBe(401);
    });

    it('歯科衛生士マスタエンドポイントが存在する', async () => {
      const response = await request(app)
        .get('/api/hygienists');
      
      // 401 (認証エラー) が返されることを確認 (エンドポイントは存在する)
      expect(response.status).toBe(401);
    });

    it('訪問記録エンドポイントが存在する', async () => {
      const response = await request(app)
        .get('/api/daily-visit-records');
      
      // 401 (認証エラー) が返されることを確認 (エンドポイントは存在する)
      expect(response.status).toBe(401);
    });

    it('レポートエンドポイントが存在する', async () => {
      const patientReportResponse = await request(app)
        .get('/api/patient-reports/1/monthly?year=2024&month=1');
      
      const hygienistReportResponse = await request(app)
        .get('/api/hygienist-reports/1/monthly?year=2024&month=1');
      
      // 401 (認証エラー) が返されることを確認 (エンドポイントは存在する)
      expect(patientReportResponse.status).toBe(401);
      expect(hygienistReportResponse.status).toBe(401);
    });
  });

  describe('CORS設定の確認', () => {
    it('CORS ヘッダーが正しく設定されている', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', config.cors.origin)
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-origin']).toBe(config.cors.origin);
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('セキュリティ設定の確認', () => {
    it('認証が必要なエンドポイントで適切に認証チェックが行われる', async () => {
      const endpoints = [
        '/api/patients',
        '/api/hygienists',
        '/api/daily-visit-records',
        '/api/patient-reports/1/monthly?year=2024&month=1'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('不正なJWTトークンで認証エラーが返される', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('エラーハンドリングの確認', () => {
    it('存在しないエンドポイントで404エラーが返される', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
    });

    it('不正なHTTPメソッドで405エラーまたは404エラーが返される', async () => {
      const response = await request(app)
        .patch('/api/auth/login');

      // 405 (Method Not Allowed) または 404 (Not Found) が返される
      expect([404, 405]).toContain(response.status);
    });
  });

  describe('レスポンス形式の確認', () => {
    it('エラーレスポンスが統一された形式で返される', async () => {
      const response = await request(app)
        .get('/api/patients');

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    it('Content-Type ヘッダーが正しく設定されている', async () => {
      const response = await request(app)
        .get('/api/patients');

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('本番環境設定の確認', () => {
    it('本番環境で適切なセキュリティ設定が有効になっている', () => {
      if (config.server.nodeEnv === 'production') {
        // 本番環境でのセキュリティ設定確認
        expect(config.jwt.secret).not.toBe('your-secret-key');
        expect(config.jwt.secret.length).toBeGreaterThan(32);
        expect(config.security.rateLimitMaxRequests).toBeGreaterThan(0);
        expect(config.security.rateLimitWindowMs).toBeGreaterThan(0);
        expect(config.logging.level).toBe('warn');
      }
    });

    it('開発環境で適切な設定が有効になっている', () => {
      if (config.server.nodeEnv === 'development') {
        // 開発環境での設定確認
        expect(config.logging.level).toBe('debug');
        expect(config.cors.origin).toContain('localhost');
      }
    });
  });
});