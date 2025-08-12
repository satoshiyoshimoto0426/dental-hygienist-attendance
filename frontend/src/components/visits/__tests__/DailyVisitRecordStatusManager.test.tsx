import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DailyVisitRecordStatusManager } from '../DailyVisitRecordStatusManager';
import { DailyVisitRecord } from '../../../types/DailyVisitRecord';

// モックの設定
const mockOnStatusChange = jest.fn();

const mockRecord: DailyVisitRecord = {
  id: 1,
  date: '2024-01-15',
  patientId: 1,
  hygienistId: 1,
  startTime: '09:00',
  endTime: '10:00',
  status: 'scheduled',
  notes: 'テスト記録',
  createdAt: new Date(),
  updatedAt: new Date(),
  patient: { id: 1, name: '山田太郎' },
  hygienist: { id: 1, name: '田中花子' }
};

describe('DailyVisitRecordStatusManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ステータス管理コンポーネントが正常に表示される', () => {
    render(
      <DailyVisitRecordStatusManager
        record={mockRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('ステータス管理')).toBeInTheDocument();
    expect(screen.getByText('予定')).toBeInTheDocument();
  });

  it('完了ボタンをクリックするとステータスが変更される', async () => {
    render(
      <DailyVisitRecordStatusManager
        record={mockRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    // 完了ボタンをクリック
    const completeButton = screen.getByText('完了にする');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(mockRecord.id, 'completed');
    });
  });

  it('キャンセルボタンをクリックするとキャンセル理由入力ダイアログが表示される', async () => {
    render(
      <DailyVisitRecordStatusManager
        record={mockRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセルする');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('キャンセル理由を入力してください')).toBeInTheDocument();
    });
  });

  it('キャンセル理由を入力してOKをクリックするとステータスが変更される', async () => {
    render(
      <DailyVisitRecordStatusManager
        record={mockRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセルする');
    fireEvent.click(cancelButton);

    // キャンセル理由を入力
    await waitFor(() => {
      const reasonInput = screen.getByPlaceholderText('キャンセル理由を入力');
      fireEvent.change(reasonInput, { target: { value: '患者都合' } });
    });

    // OKボタンをクリック
    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(
        mockRecord.id,
        'cancelled',
        '患者都合'
      );
    });
  });

  it('完了済みの記録では適切なボタンが表示される', () => {
    const completedRecord = { ...mockRecord, status: 'completed' as const };
    
    render(
      <DailyVisitRecordStatusManager
        record={completedRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('完了')).toBeInTheDocument();
    expect(screen.getByText('予定に戻す')).toBeInTheDocument();
    expect(screen.queryByText('完了にする')).not.toBeInTheDocument();
  });

  it('キャンセル済みの記録では適切なボタンが表示される', () => {
    const cancelledRecord = { 
      ...mockRecord, 
      status: 'cancelled' as const,
      cancellationReason: '患者都合'
    };
    
    render(
      <DailyVisitRecordStatusManager
        record={cancelledRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('キャンセル理由: 患者都合')).toBeInTheDocument();
    expect(screen.getByText('予定に戻す')).toBeInTheDocument();
  });

  it('予定に戻すボタンをクリックするとステータスが変更される', async () => {
    const completedRecord = { ...mockRecord, status: 'completed' as const };
    
    render(
      <DailyVisitRecordStatusManager
        record={completedRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    // 予定に戻すボタンをクリック
    const rescheduleButton = screen.getByText('予定に戻す');
    fireEvent.click(rescheduleButton);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith(mockRecord.id, 'scheduled');
    });
  });

  it('ステータス変更時にローディング状態が表示される', async () => {
    render(
      <DailyVisitRecordStatusManager
        record={mockRecord}
        onStatusChange={mockOnStatusChange}
        loading={true}
      />
    );

    // ローディング中はボタンが無効化される
    const completeButton = screen.getByText('完了にする');
    expect(completeButton).toBeDisabled();
  });

  it('エラー状態が表示される', () => {
    render(
      <DailyVisitRecordStatusManager
        record={mockRecord}
        onStatusChange={mockOnStatusChange}
        error="ステータス変更に失敗しました"
      />
    );

    expect(screen.getByText('ステータス変更に失敗しました')).toBeInTheDocument();
  });

  it('キャンセル理由入力でキャンセルボタンをクリックするとダイアログが閉じる', async () => {
    render(
      <DailyVisitRecordStatusManager
        record={mockRecord}
        onStatusChange={mockOnStatusChange}
      />
    );

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセルする');
    fireEvent.click(cancelButton);

    // ダイアログのキャンセルボタンをクリック
    await waitFor(() => {
      const dialogCancelButton = screen.getByText('キャンセル');
      fireEvent.click(dialogCancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('キャンセル理由を入力してください')).not.toBeInTheDocument();
    });

    // onStatusChangeが呼ばれないことを確認
    expect(mockOnStatusChange).not.toHaveBeenCalled();
  });
});