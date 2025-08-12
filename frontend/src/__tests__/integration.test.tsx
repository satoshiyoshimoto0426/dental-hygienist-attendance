import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { AuthContext } from '../contexts/AuthContext';
import { ErrorContext } from '../contexts/ErrorContext';

// モックの設定
const mockAuthContextValue = {
  user: null,
  token: null,
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
jest.mock('../services/authService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  verifyToken: jest.fn()
}));

jest.mock('../services/patientService', () => ({
  getPatients: jest.fn().mockResolvedValue([
    { id: 1, name: '山田太郎', patientId: 'P001' },
    { id: 2, name: '佐藤花子', patientId: 'P002' }
  ]),
  createPatient: jest.fn(),
  updatePatient: jest.fn(),
  deletePatient: jest.fn()
}));

jest.mock('../services/hygienistService', () => ({
  getHygienists: jest.fn().mockResolvedValue([
    { id: 1, name: '田中花子', staffId: 'H001' },
    { id: 2, name: '佐藤次郎', staffId: 'H002' }
  ]),
  createHygienist: jest.fn(),
  updateHygienist: jest.fn(),
  deleteHygienist: jest.fn()
}));

jest.mock('../services/dailyVisitRecordService', () => ({
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
  ]),
  createDailyVisitRecord: jest.fn(),
  updateDailyVisitRecord: jest.fn(),
  deleteDailyVisitRecord: jest.fn()
}));

const renderWithProviders = (authValue = mockAuthContextValue) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <ErrorContext.Provider value={mockErrorContextValue}>
          <App />
        </ErrorContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Application Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証フロー', () => {
    it('未認証ユーザーはログインページにリダイレクトされる', () => {
      renderWithProviders();

      expect(screen.getByText('ログイン')).toBeInTheDocument();
      expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    });

    it('認証済みユーザーはダッシュボードが表示される', async () => {
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

      renderWithProviders(loggedInAuthContext);

      await waitFor(() => {
        expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
      });
    });

    it('ログインからダッシュボードまでの一連の流れが動作する', async () => {
      const mockLogin = jest.fn().mockResolvedValue({
        user: {
          id: 1,
          username: 'testuser',
          role: 'admin',
          hygienistId: null
        },
        token: 'mock-token'
      });

      const authService = require('../services/authService');
      authService.login = mockLogin;

      renderWithProviders();

      // ログインフォームに入力
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
  });

  describe('ナビゲーション', () => {
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

    it('ナビゲーションメニューが表示される', async () => {
      renderWithProviders(loggedInAuthContext);

      await waitFor(() => {
        expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
        expect(screen.getByText('患者管理')).toBeInTheDocument();
        expect(screen.getByText('歯科衛生士管理')).toBeInTheDocument();
        expect(screen.getByText('訪問記録')).toBeInTheDocument();
        expect(screen.getByText('レポート')).toBeInTheDocument();
      });
    });

    it('患者管理ページに遷移できる', async () => {
      renderWithProviders(loggedInAuthContext);

      await waitFor(() => {
        const patientManagementLink = screen.getByText('患者管理');
        fireEvent.click(patientManagementLink);
      });

      await waitFor(() => {
        expect(screen.getByText('患者管理')).toBeInTheDocument();
        expect(screen.getByText('新規患者登録')).toBeInTheDocument();
      });
    });

    it('レポートページに遷移できる', async () => {
      renderWithProviders(loggedInAuthContext);

      await waitFor(() => {
        const reportsLink = screen.getByText('レポート');
        fireEvent.click(reportsLink);
      });

      await waitFor(() => {
        expect(screen.getByText('患者レポート')).toBeInTheDocument();
      });
    });
  });

  describe('患者管理フロー', () => {
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

    it('患者の作成から削除までの一連の流れが動作する', async () => {
      const patientService = require('../services/patientService');
      const newPatient = {
        id: 3,
        patientId: 'P003',
        name: '田中次郎',
        phone: '090-1111-2222',
        email: 'tanaka@example.com',
        address: '東京都品川区',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      patientService.createPatient.mockResolvedValueOnce(newPatient);
      patientService.deletePatient.mockResolvedValueOnce(true);

      renderWithProviders(loggedInAuthContext);

      // 患者管理ページに移動
      await waitFor(() => {
        const patientManagementLink = screen.getByText('患者管理');
        fireEvent.click(patientManagementLink);
      });

      // 新規患者登録
      await waitFor(() => {
        const addButton = screen.getByText('新規患者登録');
        fireEvent.click(addButton);
      });

      // フォームに入力
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('患者ID'), { target: { value: 'P003' } });
        fireEvent.change(screen.getByLabelText('患者名'), { target: { value: '田中次郎' } });
        fireEvent.change(screen.getByLabelText('電話番号'), { target: { value: '090-1111-2222' } });
      });

      // 保存
      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(patientService.createPatient).toHaveBeenCalled();
      });

      // 削除
      await waitFor(() => {
        const deleteButtons = screen.getAllByText('削除');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        const confirmButton = screen.getByText('削除する');
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(patientService.deletePatient).toHaveBeenCalled();
      });
    });
  });

  describe('訪問記録管理フロー', () => {
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

    it('訪問記録の作成から更新までの一連の流れが動作する', async () => {
      const dailyVisitRecordService = require('../services/dailyVisitRecordService');
      const newRecord = {
        id: 2,
        date: '2024-01-20',
        patientId: 1,
        hygienistId: 1,
        startTime: '14:00',
        endTime: '15:00',
        status: 'scheduled',
        notes: '新規記録',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      dailyVisitRecordService.createDailyVisitRecord.mockResolvedValueOnce(newRecord);
      dailyVisitRecordService.updateDailyVisitRecord.mockResolvedValueOnce({
        ...newRecord,
        status: 'completed'
      });

      renderWithProviders(loggedInAuthContext);

      // 訪問記録ページに移動
      await waitFor(() => {
        const visitRecordsLink = screen.getByText('訪問記録');
        fireEvent.click(visitRecordsLink);
      });

      // 新規記録作成（カレンダーの日付をクリック）
      await waitFor(() => {
        const dateCell = screen.getByText('20');
        fireEvent.click(dateCell);
      });

      // 記録フォームに入力
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('開始時間'), { target: { value: '14:00' } });
        fireEvent.change(screen.getByLabelText('終了時間'), { target: { value: '15:00' } });
        fireEvent.change(screen.getByLabelText('メモ'), { target: { value: '新規記録' } });
      });

      // 保存
      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(dailyVisitRecordService.createDailyVisitRecord).toHaveBeenCalled();
      });
    });
  });

  describe('レポート機能フロー', () => {
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

    it('患者レポートの表示からCSVエクスポートまでの一連の流れが動作する', async () => {
      const patientReportService = require('../services/patientReportService');
      const mockReport = {
        patientId: 1,
        patientName: '山田太郎',
        year: 2024,
        month: 1,
        totalVisits: 4,
        totalHours: 4.0,
        visitDetails: []
      };
      patientReportService.getPatientMonthlyReport = jest.fn().mockResolvedValue(mockReport);
      patientReportService.exportPatientReportToCsv = jest.fn().mockResolvedValue('CSV data');

      renderWithProviders(loggedInAuthContext);

      // レポートページに移動
      await waitFor(() => {
        const reportsLink = screen.getByText('レポート');
        fireEvent.click(reportsLink);
      });

      // 患者を選択
      await waitFor(() => {
        const patientSelect = screen.getByText('患者を選択');
        fireEvent.click(patientSelect);
      });

      await waitFor(() => {
        const patientOption = screen.getByText('山田太郎');
        fireEvent.click(patientOption);
      });

      // レポート表示
      const showReportButton = screen.getByText('レポート表示');
      fireEvent.click(showReportButton);

      await waitFor(() => {
        expect(patientReportService.getPatientMonthlyReport).toHaveBeenCalled();
        expect(screen.getByText('山田太郎の2024年1月レポート')).toBeInTheDocument();
      });

      // CSVエクスポート
      await waitFor(() => {
        const exportButton = screen.getByText('CSVエクスポート');
        fireEvent.click(exportButton);
      });

      await waitFor(() => {
        expect(patientReportService.exportPatientReportToCsv).toHaveBeenCalled();
      });
    });
  });

  describe('エラーハンドリング', () => {
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

    it('API エラーが適切に処理される', async () => {
      const patientService = require('../services/patientService');
      patientService.getPatients.mockRejectedValueOnce(new Error('Network Error'));

      renderWithProviders(loggedInAuthContext);

      // 患者管理ページに移動
      await waitFor(() => {
        const patientManagementLink = screen.getByText('患者管理');
        fireEvent.click(patientManagementLink);
      });

      await waitFor(() => {
        expect(mockErrorContextValue.showError).toHaveBeenCalledWith(
          '患者データの取得に失敗しました'
        );
      });
    });

    it('ネットワークエラー時に適切なメッセージが表示される', async () => {
      const authService = require('../services/authService');
      authService.login.mockRejectedValueOnce(new Error('Network Error'));

      renderWithProviders();

      // ログイン試行
      const usernameInput = screen.getByLabelText('ユーザー名');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockErrorContextValue.showError).toHaveBeenCalledWith(
          'ネットワークエラーが発生しました'
        );
      });
    });
  });

  describe('レスポンシブデザイン', () => {
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

    it('モバイル表示でハンバーガーメニューが表示される', async () => {
      // モバイルサイズに変更
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      renderWithProviders(loggedInAuthContext);

      await waitFor(() => {
        expect(screen.getByLabelText('メニューを開く')).toBeInTheDocument();
      });
    });
  });
});