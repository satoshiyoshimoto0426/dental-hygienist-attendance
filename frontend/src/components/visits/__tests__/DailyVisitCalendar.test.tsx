import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DailyVisitCalendar } from '../DailyVisitCalendar';
import { DailyVisitRecord } from '../../../types/DailyVisitRecord';

// モックの設定
const mockOnDateSelect = jest.fn();
const mockOnRecordSelect = jest.fn();

const mockRecords: DailyVisitRecord[] = [
  {
    id: 1,
    date: '2024-01-15',
    patientId: 1,
    hygienistId: 1,
    startTime: '09:00',
    endTime: '10:00',
    status: 'completed',
    notes: 'テスト記録1',
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: { id: 1, name: '山田太郎' },
    hygienist: { id: 1, name: '田中花子' }
  },
  {
    id: 2,
    date: '2024-01-20',
    patientId: 2,
    hygienistId: 1,
    startTime: '14:00',
    endTime: '15:00',
    status: 'scheduled',
    notes: 'テスト記録2',
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: { id: 2, name: '佐藤花子' },
    hygienist: { id: 1, name: '田中花子' }
  }
];

describe('DailyVisitCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('カレンダーが正常に表示される', () => {
    render(
      <DailyVisitCalendar
        records={mockRecords}
        currentDate={new Date('2024-01-15')}
        onDateSelect={mockOnDateSelect}
        onRecordSelect={mockOnRecordSelect}
      />
    );

    expect(screen.getByText('2024年1月')).toBeInTheDocument();
  });

  it('訪問記録がカレンダーに表示される', () => {
    render(
      <DailyVisitCalendar
        records={mockRecords}
        currentDate={new Date('2024-01-15')}
        onDateSelect={mockOnDateSelect}
        onRecordSelect={mockOnRecordSelect}
      />
    );

    // 訪問記録が表示されることを確認
    expect(screen.getByText('山田太郎')).toBeInTheDocument();
    expect(screen.getByText('佐藤花子')).toBeInTheDocument();
  });

  it('日付をクリックするとonDateSelectが呼ばれる', async () => {
    render(
      <DailyVisitCalendar
        records={mockRecords}
        currentDate={new Date('2024-01-15')}
        onDateSelect={mockOnDateSelect}
        onRecordSelect={mockOnRecordSelect}
      />
    );

    // 空の日付をクリック
    const emptyDate = screen.getByText('10');
    fireEvent.click(emptyDate);

    await waitFor(() => {
      expect(mockOnDateSelect).toHaveBeenCalledWith(new Date('2024-01-10'));
    });
  });

  it('訪問記録をクリックするとonRecordSelectが呼ばれる', async () => {
    render(
      <DailyVisitCalendar
        records={mockRecords}
        currentDate={new Date('2024-01-15')}
        onDateSelect={mockOnDateSelect}
        onRecordSelect={mockOnRecordSelect}
      />
    );

    // 訪問記録をクリック
    const recordElement = screen.getByText('山田太郎');
    fireEvent.click(recordElement);

    await waitFor(() => {
      expect(mockOnRecordSelect).toHaveBeenCalledWith(mockRecords[0]);
    });
  });

  it('月を変更できる', async () => {
    render(
      <DailyVisitCalendar
        records={mockRecords}
        currentDate={new Date('2024-01-15')}
        onDateSelect={mockOnDateSelect}
        onRecordSelect={mockOnRecordSelect}
      />
    );

    // 次の月ボタンをクリック
    const nextButton = screen.getByLabelText('次の月');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('2024年2月')).toBeInTheDocument();
    });
  });

  it('ステータスに応じて異なるスタイルが適用される', () => {
    render(
      <DailyVisitCalendar
        records={mockRecords}
        currentDate={new Date('2024-01-15')}
        onDateSelect={mockOnDateSelect}
        onRecordSelect={mockOnRecordSelect}
      />
    );

    // 完了済みの記録
    const completedRecord = screen.getByText('山田太郎').closest('.visit-record');
    expect(completedRecord).toHaveClass('status-completed');

    // 予定の記録
    const scheduledRecord = screen.getByText('佐藤花子').closest('.visit-record');
    expect(scheduledRecord).toHaveClass('status-scheduled');
  });

  it('記録がない場合でも正常に表示される', () => {
    render(
      <DailyVisitCalendar
        records={[]}
        currentDate={new Date('2024-01-15')}
        onDateSelect={mockOnDateSelect}
        onRecordSelect={mockOnRecordSelect}
      />
    );

    expect(screen.getByText('2024年1月')).toBeInTheDocument();
  });

  it('今日の日付がハイライトされる', () => {
    const today = new Date();
    render(
      <DailyVisitCalendar
        records={mockRecords}
        currentDate={today}
        onDateSelect={mockOnDateSelect}
        onRecordSelect={mockOnRecordSelect}
      />
    );

    const todayElement = screen.getByText(today.getDate().toString()).closest('.calendar-day');
    expect(todayElement).toHaveClass('today');
  });
});