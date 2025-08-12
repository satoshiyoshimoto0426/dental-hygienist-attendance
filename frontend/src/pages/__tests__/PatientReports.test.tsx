import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PatientReports } from '../PatientReports';
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

const mockPatients = [
  {
    id: 1,
    patientId: 'P001',
    name: '山田太郎',
    phone: '090-1234-5678',
    email: 'yamada@example.com'
  },
  {
    id: 2,
    patientId: 'P002',
    name: '佐藤花子',
    phone: '090-8765-4321',
    email: 'sato@example.com'
  }
];

const mockPatientReport = {
  patientId: 1,
  patientName: '山田太郎',
  year: 2024,
  month: 1,
  totalVisits: 4,
  totalHours: 4.0,
  visitDetails: [
    {
      date: '2024-01-15',
      hygienistName: '田中花子',
      startTime: '09:00',
      endTime: '10:00',
      duration: 1.0
    }
  ]
};

const mockComparisonReport = [
  {
    patientId: 1,
    patientName: '山田太郎',
    totalVisits: 4,
    totalHours: 4.0
  },
  {
    patientId: 2,
    patientName: '佐藤花子',
    totalVisits: 3,
    totalHours: 3.5
  }
];

// API呼び出しのモック
jest.mock('../../services/patientService', () => ({
  getPatients: jest.fn().mockResolvedValue(mockPatients)
}));

jest.mock('../../services/patientReportService', () => ({
  getPatientMonthlyReport: jest.fn().mockResolvedValue(mockPatientReport),
  getPatientComparisonReport: jest.fn().mockResolvedValue(mockComparisonReport),
  exportPatientReportToCsv: jest.fn().mockResolvedValue('CSV data')
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

describe('PatientReports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('患者レポートページが正常に表示される', async () => {
    renderWithProviders(<PatientReports />);

    expect(screen.getByText('患者レポート')).toBeInTheDocument();
    expect(screen.getByText('患者別月間レポート')).toBeInTheDocument();
    expect(screen.getByText('患者比較レポート')).toBeInTheDocument();
  });

  it('患者選択ドロップダウンが表示される', async () => {
    renderWithProviders(<PatientReports />);

    await waitFor(() => {
      expect(screen.getByText('患者を選択')).toBeInTheDocument();
    });
  });

  it('年月選択フィールドが表示される', () => {
    renderWithProviders(<PatientReports />);

    expect(screen.getByLabelText('年')).toBeInTheDocument();
    expect(screen.getByLabelText('月')).toBeInTheDocument();
  });

  it('患者を選択して月間レポートを表示できる', async () => {
    renderWithProviders(<PatientReports />);

    // 患者を選択
    await waitFor(() => {
      const patientSelect = screen.getByText('患者を選択');
      fireEvent.click(patientSelect);
    });

    await waitFor(() => {
      const patientOption = screen.getByText('山田太郎');
      fireEvent.click(patientOption);
    });

    // 年月を設定
    const yearInput = screen.getByLabelText('年');
    const monthInput = screen.getByLabelText('月');
    fireEvent.change(yearInput, { target: { value: '2024' } });
    fireEvent.change(monthInput, { target: { value: '1' } });

    // レポート表示ボタンをクリック
    const showReportButton = screen.getByText('レポート表示');
    fireEvent.click(showReportButton);

    await waitFor(() => {
      expect(screen.getByText('山田太郎の2024年1月レポート')).toBeInTheDocument();
      expect(screen.getByText('総訪問回数: 4回')).toBeInTheDocument();
      expect(screen.getByText('総時間: 4.0時間')).toBeInTheDocument();
    });
  });

  it('訪問詳細が表示される', async () => {
    renderWithProviders(<PatientReports />);

    // 患者を選択してレポートを表示
    await waitFor(() => {
      const patientSelect = screen.getByText('患者を選択');
      fireEvent.click(patientSelect);
    });

    await waitFor(() => {
      const patientOption = screen.getByText('山田太郎');
      fireEvent.click(patientOption);
    });

    const showReportButton = screen.getByText('レポート表示');
    fireEvent.click(showReportButton);

    await waitFor(() => {
      expect(screen.getByText('訪問詳細')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
      expect(screen.getByText('田中花子')).toBeInTheDocument();
      expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument();
      expect(screen.getByText('1.0時間')).toBeInTheDocument();
    });
  });

  it('患者比較レポートを表示できる', async () => {
    renderWithProviders(<PatientReports />);

    // 比較レポートタブをクリック
    const comparisonTab = screen.getByText('患者比較レポート');
    fireEvent.click(comparisonTab);

    // 年月を設定
    const yearInput = screen.getByLabelText('年');
    const monthInput = screen.getByLabelText('月');
    fireEvent.change(yearInput, { target: { value: '2024' } });
    fireEvent.change(monthInput, { target: { value: '1' } });

    // 比較レポート表示ボタンをクリック
    const showComparisonButton = screen.getByText('比較レポート表示');
    fireEvent.click(showComparisonButton);

    await waitFor(() => {
      expect(screen.getByText('2024年1月 患者比較レポート')).toBeInTheDocument();
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.getByText('4回')).toBeInTheDocument();
      expect(screen.getByText('3回')).toBeInTheDocument();
    });
  });

  it('CSVエクスポート機能が動作する', async () => {
    // CSVダウンロードのモック
    const mockCreateObjectURL = jest.fn();
    const mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // リンククリックのモック
    const mockClick = jest.fn();
    const mockLink = {
      href: '',
      download: '',
      click: mockClick
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    renderWithProviders(<PatientReports />);

    // 患者を選択してレポートを表示
    await waitFor(() => {
      const patientSelect = screen.getByText('患者を選択');
      fireEvent.click(patientSelect);
    });

    await waitFor(() => {
      const patientOption = screen.getByText('山田太郎');
      fireEvent.click(patientOption);
    });

    const showReportButton = screen.getByText('レポート表示');
    fireEvent.click(showReportButton);

    // CSVエクスポートボタンをクリック
    await waitFor(() => {
      const exportButton = screen.getByText('CSVエクスポート');
      fireEvent.click(exportButton);
    });

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it('データが存在しない場合のメッセージが表示される', async () => {
    const patientReportService = require('../../services/patientReportService');
    patientReportService.getPatientMonthlyReport.mockResolvedValueOnce(null);

    renderWithProviders(<PatientReports />);

    // 患者を選択してレポートを表示
    await waitFor(() => {
      const patientSelect = screen.getByText('患者を選択');
      fireEvent.click(patientSelect);
    });

    await waitFor(() => {
      const patientOption = screen.getByText('山田太郎');
      fireEvent.click(patientOption);
    });

    const showReportButton = screen.getByText('レポート表示');
    fireEvent.click(showReportButton);

    await waitFor(() => {
      expect(screen.getByText('指定された期間のデータが見つかりません')).toBeInTheDocument();
    });
  });

  it('ローディング状態が表示される', async () => {
    const patientReportService = require('../../services/patientReportService');
    patientReportService.getPatientMonthlyReport.mockReturnValueOnce(new Promise(() => {}));

    renderWithProviders(<PatientReports />);

    // 患者を選択してレポートを表示
    await waitFor(() => {
      const patientSelect = screen.getByText('患者を選択');
      fireEvent.click(patientSelect);
    });

    await waitFor(() => {
      const patientOption = screen.getByText('山田太郎');
      fireEvent.click(patientOption);
    });

    const showReportButton = screen.getByText('レポート表示');
    fireEvent.click(showReportButton);

    expect(screen.getByText('レポートを読み込み中...')).toBeInTheDocument();
  });

  it('エラー状態が表示される', async () => {
    const patientReportService = require('../../services/patientReportService');
    patientReportService.getPatientMonthlyReport.mockRejectedValueOnce(new Error('API Error'));

    renderWithProviders(<PatientReports />);

    // 患者を選択してレポートを表示
    await waitFor(() => {
      const patientSelect = screen.getByText('患者を選択');
      fireEvent.click(patientSelect);
    });

    await waitFor(() => {
      const patientOption = screen.getByText('山田太郎');
      fireEvent.click(patientOption);
    });

    const showReportButton = screen.getByText('レポート表示');
    fireEvent.click(showReportButton);

    await waitFor(() => {
      expect(mockErrorContextValue.showError).toHaveBeenCalledWith(
        'レポートの取得に失敗しました'
      );
    });
  });

  it('フィルター機能が動作する', async () => {
    renderWithProviders(<PatientReports />);

    // 比較レポートタブをクリック
    const comparisonTab = screen.getByText('患者比較レポート');
    fireEvent.click(comparisonTab);

    // 比較レポートを表示
    const showComparisonButton = screen.getByText('比較レポート表示');
    fireEvent.click(showComparisonButton);

    await waitFor(() => {
      // フィルター入力
      const filterInput = screen.getByPlaceholderText('患者名で絞り込み');
      fireEvent.change(filterInput, { target: { value: '山田' } });
    });

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
    });
  });
});