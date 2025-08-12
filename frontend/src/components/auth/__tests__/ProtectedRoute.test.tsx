import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { User } from '../../../types/Auth';

// AuthContextのモック
vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as any;

// React Routerのモック
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, state }: { to: string; state?: any }) => (
      <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)}>
        Navigate to {to}
      </div>
    ),
  };
});

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

describe('ProtectedRoute', () => {
  it('未認証の場合はログインページにリダイレクトすること', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/login');
    expect(navigate).toHaveAttribute('data-state', JSON.stringify({ from: { pathname: '/dashboard' } }));
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('認証済みの場合は子コンポーネントを表示すること', () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      role: 'user',
    };

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('管理者権限が必要なページで一般ユーザーの場合はダッシュボードにリダイレクトすること', () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      role: 'user',
    };

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="admin">
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/dashboard');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('管理者権限が必要なページで管理者の場合は子コンポーネントを表示すること', () => {
    const mockUser: User = {
      id: 1,
      username: 'admin',
      role: 'admin',
    };

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="admin">
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('一般ユーザー権限が必要なページで管理者の場合も子コンポーネントを表示すること', () => {
    const mockUser: User = {
      id: 1,
      username: 'admin',
      role: 'admin',
    };

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="user">
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});