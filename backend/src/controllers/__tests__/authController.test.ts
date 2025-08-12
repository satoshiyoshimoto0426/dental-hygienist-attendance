import { Request, Response } from 'express';
import { login, logout, verifyToken } from '../authController';
import { UserModel } from '../../models/User';
import { comparePassword } from '../../utils/auth';

// モックの作成
jest.mock('../../models/User');
jest.mock('../../utils/auth');

const mockUser = UserModel as jest.Mocked<typeof UserModel>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;

const mockRequest = (body: any = {}, user?: any) => ({
  body,
  user
} as Request);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const validLoginData = {
      username: 'testuser',
      password: 'testpassword'
    };

    const mockUserData = {
      id: 1,
      username: 'testuser',
      passwordHash: 'hashed-password',
      role: 'user',
      hygienistId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('正しい認証情報でログインが成功すること', async () => {
      const req = mockRequest(validLoginData);
      const res = mockResponse();

      mockUser.findByUsername.mockResolvedValue(mockUserData);
      mockComparePassword.mockResolvedValue(true);

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          token: expect.any(String),
          user: {
            id: mockUserData.id,
            username: mockUserData.username,
            role: mockUserData.role,
            hygienistId: mockUserData.hygienistId
          }
        }
      });
    });

    it('存在しないユーザーの場合は401エラーを返すこと', async () => {
      const req = mockRequest(validLoginData);
      const res = mockResponse();

      mockUser.findByUsername.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'ユーザー名またはパスワードが正しくありません'
        }
      });
    });

    it('間違ったパスワードの場合は401エラーを返すこと', async () => {
      const req = mockRequest(validLoginData);
      const res = mockResponse();

      mockUser.findByUsername.mockResolvedValue(mockUserData);
      mockComparePassword.mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'ユーザー名またはパスワードが正しくありません'
        }
      });
    });

    it('バリデーションエラーの場合は400エラーを返すこと', async () => {
      const req = mockRequest({ username: '', password: '' });
      const res = mockResponse();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'バリデーションエラー',
          details: expect.any(Array)
        }
      });
    });

    it('サーバーエラーの場合は500エラーを返すこと', async () => {
      const req = mockRequest(validLoginData);
      const res = mockResponse();

      mockUser.findByUsername.mockRejectedValue(new Error('Database error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'サーバーエラーが発生しました'
        }
      });
    });
  });

  describe('logout', () => {
    it('ログアウトが成功すること', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'ログアウトしました'
      });
    });
  });

  describe('verifyToken', () => {
    const mockUserPayload = {
      userId: 1,
      username: 'testuser',
      role: 'user',
      hygienistId: null
    };

    const mockUserData = {
      id: 1,
      username: 'testuser',
      role: 'user',
      hygienistId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('有効なトークンでユーザー情報を返すこと', async () => {
      const req = mockRequest({}, mockUserPayload);
      const res = mockResponse();

      mockUser.findById.mockResolvedValue(mockUserData);

      await verifyToken(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: mockUserData.id,
            username: mockUserData.username,
            role: mockUserData.role,
            hygienistId: mockUserData.hygienistId
          }
        }
      });
    });

    it('認証されていない場合は401エラーを返すこと', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です'
        }
      });
    });

    it('ユーザーが存在しない場合は401エラーを返すこと', async () => {
      const req = mockRequest({}, mockUserPayload);
      const res = mockResponse();

      mockUser.findById.mockResolvedValue(null);

      await verifyToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ユーザーが見つかりません'
        }
      });
    });
  });
});