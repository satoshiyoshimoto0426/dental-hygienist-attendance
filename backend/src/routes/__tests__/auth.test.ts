import request from 'supertest';
import express from 'express';
import { authRouter } from '../auth';
import { UserModel } from '../../models/User';
import { generateToken } from '../../utils/auth';

// モックの設定
jest.mock('../../models/User');
jest.mock('../../utils/auth');

const MockedUser = UserModel as jest.Mocked<typeof UserModel>;
const mockedGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('正しい認証情報でログインできる', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'admin',
        hygienistId: null
      };

      MockedUser.findByUsername = jest.fn().mockResolvedValue(mockUser);
      MockedUser.validatePassword = jest.fn().mockResolvedValue(true);
      mockedGenerateToken.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('mock-jwt-token');
      expect(response.body.data.user).toEqual({
        id: 1,
        username: 'testuser',
        role: 'admin',
        hygienistId: null
      });
    });

    it('存在しないユーザーでログインに失敗する', async () => {
      MockedUser.findByUsername = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('間違ったパスワードでログインに失敗する', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'admin',
        hygienistId: null
      };

      MockedUser.findByUsername = jest.fn().mockResolvedValue(mockUser);
      MockedUser.validatePassword = jest.fn().mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('必須フィールドが不足している場合にバリデーションエラーが発生する', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
          // password が不足
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('ログアウトが成功する', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('ログアウトしました');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('有効なトークンで認証確認が成功する', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'admin',
        hygienistId: null
      };

      MockedUser.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(mockUser);
    });

    it('無効なトークンで認証確認が失敗する', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('トークンが提供されない場合に認証確認が失敗する', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});