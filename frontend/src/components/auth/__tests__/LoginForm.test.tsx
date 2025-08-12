import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { useAuth } from '../../../contexts/AuthContext';

// AuthContextのモック
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as any;

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
    });
  });

  it('ログインフォームが正しく表示されること', () => {
    render(<LoginForm />);

    expect(screen.getByText('歯科衛生士勤怠システム')).toBeInTheDocument();
    expect(screen.getByText('ログインしてください')).toBeInTheDocument();
    expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('入力フィールドが正しく動作すること', () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText('ユーザー名') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('パスワード') as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('空の入力でログインボタンが無効になること', () => {
    render(<LoginForm />);

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    expect(loginButton).toBeDisabled();
  });

  it('入力があるとログインボタンが有効になること', () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(loginButton).not.toBeDisabled();
  });

  it('フォーム送信時にlogin関数が呼ばれること', async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('ログインエラー時にエラーメッセージが表示されること', async () => {
    const errorMessage = 'ログインに失敗しました';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('ログイン中はボタンが無効になり、ローディング表示されること', async () => {
    // ログインを遅延させる
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LoginForm />);

    const usernameInput = screen.getByLabelText('ユーザー名');
    const passwordInput = screen.getByLabelText('パスワード');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // ローディング状態を確認
    expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeDisabled();

    // ログイン完了を待つ
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ログイン' })).not.toBeDisabled();
    });
  });
});