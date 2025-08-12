import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authService } from '../../services/authService';
import { User, LoginRequest } from '../../types/Auth';

// authServiceのモック
vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    verifyToken: vi.fn(),
    getToken: vi.fn(),
    getUser: vi.fn(),
    clearAuthData: vi.fn(),
  },
}));

const mockAuthService = authService as any;

// テスト用コンポーネント
const TestComponent = () => {
  const { user, token, login, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.username : 'No user'}</div>
      <div data-testid="token">{token || 'No token'}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <button onClick={() => login({ username: 'test', password: 'test' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初期状態では未認証であること', async () => {
    mockAuthService.getToken.mockReturnValue(null);
    mockAuthService.getUser.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('保存されたトークンがある場合は自動的に認証状態を復元すること', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      role: 'user',
    };

    mockAuthService.getToken.mockReturnValue('stored-token');
    mockAuthService.getUser.mockReturnValue(mockUser);
    mockAuthService.verifyToken.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  it('無効なトークンの場合は認証データをクリアすること', async () => {
    mockAuthService.getToken.mockReturnValue('invalid-token');
    mockAuthService.getUser.mockReturnValue({ id: 1, username: 'testuser', role: 'user' });
    mockAuthService.verifyToken.mockResolvedValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockAuthService.clearAuthData).toHaveBeenCalled();
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('ログインが正常に動作すること', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      role: 'user',
    };

    const mockResponse = {
      success: true,
      token: 'new-token',
      user: mockUser,
    };

    mockAuthService.getToken.mockReturnValue(null);
    mockAuthService.getUser.mockReturnValue(null);
    mockAuthService.login.mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 初期状態を確認
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    // ログインボタンをクリック
    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        username: 'test',
        password: 'test',
      });
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('token')).toHaveTextContent('new-token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  it('ログアウトが正常に動作すること', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      role: 'user',
    };

    // 初期状態で認証済みに設定
    mockAuthService.getToken.mockReturnValue('test-token');
    mockAuthService.getUser.mockReturnValue(mockUser);
    mockAuthService.verifyToken.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // 認証済み状態を確認
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // ログアウトボタンをクリック
    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('自動ログアウト機能が動作すること', async () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      role: 'user',
    };

    const mockResponse = {
      success: true,
      token: 'test-token',
      user: mockUser,
    };

    mockAuthService.getToken.mockReturnValue(null);
    mockAuthService.getUser.mockReturnValue(null);
    mockAuthService.login.mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // ログイン
    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // 30分経過をシミュレート
    await act(async () => {
      vi.advanceTimersByTime(30 * 60 * 1000);
    });

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });
});