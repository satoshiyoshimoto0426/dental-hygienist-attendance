import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { HygienistReport } from '../HygienistReport';
import { HygienistReportService } from '../../../services/hygienistReportService';
import { HygienistService } from '../../../services/hygienistService';

// サービスをモック
vi.mock('../../../services/hygienistReportService');
vi.mock('../../../services/hygienistService');

const mockHygienistReportService = HygienistReportService as any;
const mockHygienistService = HygienistService as any;

describe('HygienistReport', () => {
  const mockHygienists = [
    {
      id: 1,
      name: '田中花子',
      staffId: 'H001',
      licenseNumber: 'L001',
      phone: '090-1234-5678',
      email: 'tanaka@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: '佐藤太郎',
      staffId: 'H002',
      licenseNumber: 'L002',
      phone: '090-2345-6789',
      email: 'sato@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockReportData = {
    hygienistId: 1,
    hygienistName: '田中花子',
    staffId: 'H001',
    year: 2024,
    month: 1,
    totalVisits: 10,
    completedVisits: 8,
    cancelledVisits: 2,
    scheduledVisits: 0,
    totalHours: 12.5,
    averageVisitDuration: 75,
    visitDetails: [
      {
        id: 1,
        visitDate: '2024-01-15',
        startTime: '09:00',
        endTime: '10:00',
        status: 'completed' as const,
        patientName: '山田太郎',
        patientId: 'P001',
        duration: 60
      },
      {
        id: 2,
        visitDate: '2024-01-16',
        startTime: '14:00',
        endTime: '15:30',
        status: 'cancelled' as const,
        patientName: '佐藤花子',
        patientId: 'P002',
        cancellationReason: '体調不良'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockHygienistService.getHygienists = vi.fn().mockResolvedValue(mockHygienists);
  });

  it('コンポーネントが正常にレンダリングされる', async () => {
    render(<HygienistReport />);

    expect(screen.getByText('歯科衛生士別レポート')).toBeInTheDocument();
    expect(screen.getByText('検索')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockHygienistService.getHygienists).toHaveBeenCalled();
    });
  });

  it('歯科衛生士一覧が正常に表示される', async () => {
    render(<HygienistReport />);

    await waitFor(() => {
      expect(screen.getByText('田中花子 (H001)')).toBeInTheDocument();
    });
  });

  it('検索ボタンクリックでレポートが取得される', async () => {
    mockHygienistReportService.getHygienistMonthlyStats = vi.fn().mockResolvedValue(mockReportData);

    render(<HygienistReport />);

    await waitFor(() => {
      expect(screen.getByText('田中花子 (H001)')).toBeInTheDocument();
    });

    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockHygienistReportService.getHygienistMonthlyStats).toHaveBeenCalledWith({
        hygienistId: 1,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      });
    });
  });

  it('レポートデータが正常に表示される', async () => {
    mockHygienistReportService.getHygienistMonthlyStats = vi.fn().mockResolvedValue(mockReportData);

    render(<HygienistReport />);

    await waitFor(() => {
      expect(screen.getByText('田中花子 (H001)')).toBeInTheDocument();
    });

    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('田中花子さんの2024年1月統計')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // 総訪問数
      expect(screen.getByText('8')).toBeInTheDocument(); // 完了訪問数
      expect(screen.getByText('12.5')).toBeInTheDocument(); // 総勤務時間
    });
  });

  it('訪問詳細が正常に表示される', async () => {
    mockHygienistReportService.getHygienistMonthlyStats = vi.fn().mockResolvedValue(mockReportData);

    render(<HygienistReport />);

    await waitFor(() => {
      expect(screen.getByText('田中花子 (H001)')).toBeInTheDocument();
    });

    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.getByText('完了')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
      expect(screen.getByText('キャンセル理由: 体調不良')).toBeInTheDocument();
    });
  });

  it('エラーが発生した場合エラーメッセージが表示される', async () => {
    mockHygienistReportService.getHygienistMonthlyStats = vi.fn().mockRejectedValue(
      new Error('レポートの取得に失敗しました')
    );

    render(<HygienistReport />);

    await waitFor(() => {
      expect(screen.getByText('田中花子 (H001)')).toBeInTheDocument();
    });

    const searchButton = screen.getByText('検索');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('レポートの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('歯科衛生士一覧の取得に失敗した場合エラーメッセージが表示される', async () => {
    mockHygienistService.getHygienists = vi.fn().mockRejectedValue(
      new Error('歯科衛生士一覧の取得に失敗しました')
    );

    render(<HygienistReport />);

    await waitFor(() => {
      expect(screen.getByText('歯科衛生士一覧の取得に失敗しました')).toBeInTheDocument();
    });
  });
});