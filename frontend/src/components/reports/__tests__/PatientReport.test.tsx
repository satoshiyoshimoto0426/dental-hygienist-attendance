import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatientReport } from '../PatientReport';
import { PatientService } from '../../../services/patientService';
import { PatientReportService } from '../../../services/patientReportService';

// サービスのモック
jest.mock('../../../services/patientService');
jest.mock('../../../services/patientReportService');

const mockedPatientService = PatientService as jest.Mocked<typeof PatientService>;
const mockedPatientReportService = PatientReportService as jest.Mocked<typeof PatientReportService>;

// Date Pickerのモック
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, onChange, value }: any) => (
    <input
      data-testid="date-picker"
      placeholder={label}
      onChange={(e) => onChange && onChange(new Date(e.target.value))}
      value={value ? value.toISOString().split('T')[0] : ''}
    />
  ),
}));

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('PatientReport', () => {
  const mockPatients = [
    {
      id: 1,
      patientId: 'P001',
      name: '田中太郎',
      phone: '090-1234-5678',
      email: 'tanaka@example.com',
      address: '東京都渋谷区',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      patientId: 'P002',
      name: '山田花子',
      phone: '090-8765-4321',
      email: 'yamada@example.com',
      address: '東京都新宿区',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockReportData = {
    patientId: 1,
    patientName: '田中太郎',
    year: 2024,
    month: 1,
    totalVisits: 5,
    completedVisits: 4,
    cancelledVisits: 1,
    scheduledVisits: 0,
    totalHours: 4.5,
    averageVisitDuration: 67.5,
    visitDetails: [
      {
        id: 1,
        visitDate: '2024-01-15',
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed' as const,
        hygienistName: '佐藤花子',
        hygienistStaffId: 'H001',
        duration: 60
      },
      {
        id: 2,
        visitDate: '2024-01-20',
        startTime: '14:00',
        endTime: '15:30',
        status: 'completed' as const,
        hygienistName: '佐藤花子',
        hygienistStaffId: 'H001',
        duration: 90
      },
      {
        id: 3,
        visitDate: '2024-01-25',
        startTime: undefined,
        endTime: undefined,
        status: 'cancelled' as const,
        hygienistName: '佐藤花子',
        hygienistStaffId: 'H001',
        cancellationReason: '体調不良'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedPatientService.getAllPatients.mockResolvedValue(mockPatients);
  });

  it('コンポーネントが正常にレンダリングされる', async () => {
    render(<PatientReport />);

    expect(screen.getByText('患者別統計レポート')).toBeInTheDocument();
    expect(screen.getByLabelText('患者')).toBeInTheDocument();
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
    expect(screen.getByText('レポート生成')).toBeInTheDocument();

    // 患者一覧が読み込まれるまで待機
    await waitFor(() => {
      expect(mockedPatientService.getAllPatients).toHaveBeenCalled();
    });
  });

  it('患者を選択してレポートを生成できる', async () => {
    mockedPatientReportService.getPatientMonthlyStats.mockResolvedValue(mockReportData);

    render(<PatientReport />);

    // 患者一覧が読み込まれるまで待機
    await waitFor(() => {
      expect(mockedPatientService.getAllPatients).toHaveBeenCalled();
    });

    // 患者を選択
    const patientSelect = screen.getByLabelText('患者');
    fireEvent.mouseDown(patientSelect);
    const patientOption = screen.getByText('田中太郎 (P001)');
    fireEvent.click(patientOption);

    // レポート生成ボタンをクリック
    const generateButton = screen.getByText('レポート生成');
    fireEvent.click(generateButton);

    // レポートが生成されるまで待機
    await waitFor(() => {
      expect(mockedPatientReportService.getPatientMonthlyStats).toHaveBeenCalledWith({
        patientId: 1,
        year: expect.any(Number),
        month: expect.any(Number)
      });
    });

    // レポート結果が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('田中太郎さんの統計')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // 総訪問回数
      expect(screen.getByText('4')).toBeInTheDocument(); // 完了回数
      expect(screen.getByText('訪問詳細')).toBeInTheDocument();
    });
  });

  it('患者が選択されていない場合エラーメッセージを表示する', async () => {
    render(<PatientReport />);

    // 患者一覧が読み込まれるまで待機
    await waitFor(() => {
      expect(mockedPatientService.getAllPatients).toHaveBeenCalled();
    });

    // 患者を選択せずにレポート生成ボタンをクリック
    const generateButton = screen.getByText('レポート生成');
    fireEvent.click(generateButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('患者を選択してください')).toBeInTheDocument();
    });
  });

  it('APIエラーの場合エラーメッセージを表示する', async () => {
    mockedPatientReportService.getPatientMonthlyStats.mockRejectedValue(
      new Error('レポートの取得に失敗しました')
    );

    render(<PatientReport />);

    // 患者一覧が読み込まれるまで待機
    await waitFor(() => {
      expect(mockedPatientService.getAllPatients).toHaveBeenCalled();
    });

    // 患者を選択
    const patientSelect = screen.getByLabelText('患者');
    fireEvent.mouseDown(patientSelect);
    const patientOption = screen.getByText('田中太郎 (P001)');
    fireEvent.click(patientOption);

    // レポート生成ボタンをクリック
    const generateButton = screen.getByText('レポート生成');
    fireEvent.click(generateButton);

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('レポートの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('訪問詳細テーブルが正しく表示される', async () => {
    mockedPatientReportService.getPatientMonthlyStats.mockResolvedValue(mockReportData);

    render(<PatientReport />);

    // 患者一覧が読み込まれるまで待機
    await waitFor(() => {
      expect(mockedPatientService.getAllPatients).toHaveBeenCalled();
    });

    // 患者を選択してレポートを生成
    const patientSelect = screen.getByLabelText('患者');
    fireEvent.mouseDown(patientSelect);
    const patientOption = screen.getByText('田中太郎 (P001)');
    fireEvent.click(patientOption);

    const generateButton = screen.getByText('レポート生成');
    fireEvent.click(generateButton);

    // 訪問詳細テーブルが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('訪問詳細')).toBeInTheDocument();
      expect(screen.getByText('09:00')).toBeInTheDocument();
      expect(screen.getByText('10:00')).toBeInTheDocument();
      expect(screen.getByText('完了')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.getByText('キャンセル理由: 体調不良')).toBeInTheDocument();
    });
  });
});