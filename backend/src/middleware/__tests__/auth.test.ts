import { Request, Response, NextFunction } from 'express';
import { authenticateToken, requireAdmin, optionalAuth } from '../auth';
import { generateToken, JWTPayload } from '../../utils/auth';

// モックの作成
const mockRequest = (authHeader?: string) => ({
  headers: {
    authorization: authHeader
  }
} as Request);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('Auth Middleware', () => {
  const mockPayload: JWTPayload = {
    userId: 1,
    username: 'testuser',
    role: 'user',
    hygienistId: 1
  };

  const mockAdminPayload: JWTPayload = {
    userId: 2,
    username: 'admin',
    role: 'admin'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('有効なトークンで認証が成功すること', () => {
      const token = generateToken(mockPayload);
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(req.user).toEqual(expect.objectContaining({
        userId: mockPayload.userId,
        username: mockPayload.username,
        role: mockPayload.role
      }));
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('トークンがない場合は401エラーを返すこと', () => {
      const req = mockRequest();
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'アクセストークンが必要です'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('無効なトークンの場合は401エラーを返すこと', () => {
      const req = mockRequest('Bearer invalid-token');
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'トークンが無効です'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('管理者ユーザーの場合は処理を続行すること', () => {
      const req = mockRequest();
      req.user = mockAdminPayload;
      const res = mockResponse();

      requireAdmin(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('認証されていない場合は401エラーを返すこと', () => {
      const req = mockRequest();
      const res = mockResponse();

      requireAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('管理者でない場合は403エラーを返すこと', () => {
      const req = mockRequest();
      req.user = mockPayload; // 一般ユーザー
      const res = mockResponse();

      requireAdmin(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '管理者権限が必要です'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('有効なトークンがある場合はユーザー情報を設定すること', () => {
      const token = generateToken(mockPayload);
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();

      optionalAuth(req, res, mockNext);

      expect(req.user).toEqual(expect.objectContaining({
        userId: mockPayload.userId,
        username: mockPayload.username,
        role: mockPayload.role
      }));
      expect(mockNext).toHaveBeenCalled();
    });

    it('トークンがない場合でも処理を続行すること', () => {
      const req = mockRequest();
      const res = mockResponse();

      optionalAuth(req, res, mockNext);

      expect(req.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('無効なトークンでも処理を続行すること', () => {
      const req = mockRequest('Bearer invalid-token');
      const res = mockResponse();

      optionalAuth(req, res, mockNext);

      expect(req.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});