import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../Login';
import { AuthContext } from '../../contexts/AuthContext';
import { ErrorContext } from '../../contexts/ErrorContext';

// モックの設定
const mockLogin = jest.fn();
const mockShowError = jest.fn();
const mockClearError = jest.fn();

const mockAuthContextValue = {
  user: null,
  token: null,
  login: mockLogin,
  logout: jest.fn(),
  loading: false
};

const mockErrorContextValue = {
  error: null,
  showError: mockShowError,
  clearError: mockClearError
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContextValue}>
        <ErrorContext.Provider value={mockErrorContextValue}>
          {component}
        </ErrorContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ログインページが正常に表示される', () => {
    renderWithProviders(<Login />);

    expect(screen.getByText('ログイン')).toBeInTheDocument();
    expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('フォームに入力できる', () => {
    renderWithProviders(<Login />);

    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('正しい認証情報でログインできる', async () => {
    mockLogin.mockResolvedValueOnce(true);

    renderWithProviders(<Login />);

    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('ログインに失敗した場合にエラーが表示される', async () => {
    mockLogin.mockRejectedValueOnce(new Error('認証に失敗しました'));

    renderWithProviders(<Login />);

    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('認証に失敗しました');
    });
  });

  it('必須フィールドが空の場合にバリデーションエラーが表示される', async () => {
    renderWithProviders(<Login />);

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('ユーザー名は必須です')).toBeInTheDocument();
      expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
    });

    // ログイン関数が呼ばれないことを確認
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('ローディング中はボタンが無効化される', () => {
    const loadingAuthContext = {
      ...mockAuthContextValue,
      loading: true
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={loadingAuthContext}>
          <ErrorContext.Provider value={mockErrorContextValue}>
            <Login />
          </ErrorContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: 'ログイン中...' });
    expect(loginButton).toBeDisabled();
  });

  it('既にログイン済みの場合はダッシュボードにリダイレクトされる', () => {
    const loggedInAuthContext = {
      ...mockAuthContextValue,
      user: {
        id: 1,
        username: 'testuser',
        role: 'admin' as const,
        hygienistId: null
      },
      token: 'mock-token'
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={loggedInAuthContext}>
          <ErrorContext.Provider value={mockErrorContextValue}>
            <Login />
          </ErrorContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // ログインページではなくダッシュボードが表示されることを確認
    expect(screen.queryByText('ログイン')).not.toBeInTheDocument();
  });

  it('パスワードの表示/非表示を切り替えできる', () => {
    renderWithProviders(<Login />);

    const passwordInput = screen.getByLabelText('パスワード');
    const toggleButton = screen.getByLabelText('パスワードを表示');

    // 初期状態ではパスワードが隠されている
    expect(passwordInput).toHaveAttribute('type', 'password');

    // 表示ボタンをクリック
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // 再度クリックして非表示にする
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('Enterキーでログインできる', async () => {
    mockLogin.mockResolvedValueOnce(true);

    renderWithProviders(<Login />);

    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.keyPress(passwordInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('エラーメッセージが表示される', () => {
    const errorContextValue = {
      ...mockErrorContextValue,
      error: 'ネットワークエラーが発生しました'
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <ErrorContext.Provider value={errorContextValue}>
            <Login />
          </ErrorContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('ネットワークエラーが発生しました')).toBeInTheDocument();
  });
});