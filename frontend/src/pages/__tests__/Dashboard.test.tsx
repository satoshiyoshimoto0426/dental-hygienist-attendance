import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { AuthContext } from '../../contexts/AuthContext';
import { ErrorContext } from '../../contexts/ErrorContext';

// モックの設定
const mockAuthContextValue = {
  user: {
    id: 1,
    username: 'testuser',
    role: 'admin' as const,
    hygienistId: null
  },
  token: 'mock-token',
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

const mockErrorContextValue = {
  error: null,
  showError: jest.fn(),
  clearError: jest.fn()
};

// API呼び出しのモック
jest.mock('../../services/patientService', () => ({
  getPatients: jest.fn().mockResolvedValue([
    { id: 1, name: '山田太郎', patientId: 'P001' },
    { id: 2, name: '佐藤花子', patientId: 'P002' }
  ])
}));

jest.mock('../../services/hygienistService', () => ({
  getHygienists: jest.fn().mockResolvedValue([
    { id: 1, name: '田中花子', staffId: 'H001' },
    { id: 2, name: '佐藤次郎', staffId: 'H002' }
  ])
}));

jest.mock('../../services/dailyVisitRecordService', () => ({
  getDailyVisitRecords: jest.fn().mockResolvedValue([
    {
      id: 1,
      date: '2024-01-15',
      patientId: 1,
      hygienistId: 1,
      status: 'completed',
      patient: { name: '山田太郎' },
      hygienist: { name: '田中花子' }
    }
  ])
}));

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

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ダッシュボードが正常に表示される', async () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('患者数')).toBeInTheDocument();
      expect(screen.getByText('歯科衛生士数')).toBeInTheDocument();
      expect(screen.getByText('今月の訪問数')).toBeInTheDocument();
    });
  });

  it('統計情報が正しく表示される', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // 患者数
      expect(screen.getByText('2')).toBeInTheDocument(); // 歯科衛生士数
      expect(screen.getByText('1')).toBeInTheDocument(); // 訪問数
    });
  });

  it('最近の訪問記録が表示される', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('最近の訪問記録')).toBeInTheDocument();
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('田中花子')).toBeInTheDocument();
    });
  });

  it('クイックアクションボタンが表示される', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('新規訪問記録')).toBeInTheDocument();
      expect(screen.getByText('患者管理')).toBeInTheDocument();
      expect(screen.getByText('歯科衛生士管理')).toBeInTheDocument();
      expect(screen.getByText('レポート')).toBeInTheDocument();
    });
  });

  it('ローディング状態が表示される', () => {
    const loadingAuthContext = {
      ...mockAuthContextValue,
      loading: true
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={loadingAuthContext}>
          <ErrorContext.Provider value={mockErrorContextValue}>
            <Dashboard />
          </ErrorContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('エラー状態が表示される', async () => {
    // API呼び出しでエラーが発生する場合のモック
    const patientService = require('../../services/patientService');
    patientService.getPatients.mockRejectedValueOnce(new Error('API Error'));

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(mockErrorContextValue.showError).toHaveBeenCalledWith(
        'データの取得に失敗しました'
      );
    });
  });

  it('歯科衛生士ユーザーの場合は適切な情報が表示される', async () => {
    const hygienistAuthContext = {
      ...mockAuthContextValue,
      user: {
        ...mockAuthContextValue.user,
        role: 'user' as const,
        hygienistId: 1
      }
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={hygienistAuthContext}>
          <ErrorContext.Provider value={mockErrorContextValue}>
            <Dashboard />
          </ErrorContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('あなたの今月の訪問数')).toBeInTheDocument();
    });
  });

  it('今日の予定が表示される', async () => {
    const today = new Date().toISOString().split('T')[0];
    const dailyVisitRecordService = require('../../services/dailyVisitRecordService');
    dailyVisitRecordService.getDailyVisitRecords.mockResolvedValueOnce([
      {
        id: 1,
        date: today,
        patientId: 1,
        hygienistId: 1,
        status: 'scheduled',
        startTime: '09:00',
        patient: { name: '山田太郎' },
        hygienist: { name: '田中花子' }
      }
    ]);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('今日の予定')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 山田太郎')).toBeInTheDocument();
    });
  });

  it('月間統計グラフが表示される', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('月間訪問統計')).toBeInTheDocument();
    });
  });

  it('アラートとお知らせが表示される', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('お知らせ')).toBeInTheDocument();
    });
  });
});