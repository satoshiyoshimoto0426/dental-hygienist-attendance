import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginRequest, User } from '../../types/Auth';

// LocalStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// APIモックの設定
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('../api', () => ({
  api: {
    post: mockPost,
    get: mockGet,
  },
}));

// authServiceを動的にインポート
let authService: any;

describe('AuthService', () => {
  beforeEach(async () => {
    // モックをクリア
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // authServiceを再インポート
    const module = await import('../authService');
    authService = module.authService;
  });

  describe('token and user management', () => {
    it('トークンの設定と取得ができること', () => {
      const token = 'test-token';
      authService.setToken(token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('ユーザー情報の設定と取得ができること', () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        role: 'admin',
      };
      authService.setUser(user);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(user));
    });

    it('認証データのクリアができること', () => {
      authService.clearAuthData();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('認証状態の確認ができること', () => {
      // トークンがない場合
      localStorageMock.getItem.mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);

      // トークンがある場合
      localStorageMock.getItem.mockReturnValue('test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('ユーザー情報の取得ができること', () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        role: 'user',
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(user));
      const result = authService.getUser();
      expect(result).toEqual(user);
    });

    it('無効なユーザー情報の場合はnullを返すこと', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const result = authService.getUser();
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('正常なログインができること', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123',
      };

      const mockUser: User = {
        id: 1,
        username: 'testuser',
        role: 'user',
      };

      const mockResponse = {
        data: {
          success: true,
          token: 'mock-token',
          user: mockUser,
        },
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(mockPost).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'mock-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_user', JSON.stringify(mockUser));
    });

    it('ログインエラーが適切に処理されること', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockPost.mockRejectedValue(new Error('Network error'));

      await expect(authService.login(credentials)).rejects.toThrow('ログインに失敗しました');
    });
  });

  describe('logout', () => {
    it('正常なログアウトができること', async () => {
      mockPost.mockResolvedValue({});

      await authService.logout();

      expect(mockPost).toHaveBeenCalledWith('/auth/logout');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });

    it('ログアウトAPIが失敗してもローカルデータがクリアされること', async () => {
      mockPost.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });

  describe('verifyToken', () => {
    it('有効なトークンの検証ができること', async () => {
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        role: 'user',
      };

      localStorageMock.getItem.mockReturnValue('valid-token');
      mockGet.mockResolvedValue({ data: { user: mockUser } });

      const result = await authService.verifyToken();

      expect(mockGet).toHaveBeenCalledWith('/auth/verify');
      expect(result).toEqual(mockUser);
    });

    it('トークンがない場合はnullを返すこと', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = await authService.verifyToken();

      expect(result).toBeNull();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('無効なトークンの場合は認証データをクリアすること', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      mockGet.mockRejectedValue(new Error('Unauthorized'));

      const result = await authService.verifyToken();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
    });
  });
});