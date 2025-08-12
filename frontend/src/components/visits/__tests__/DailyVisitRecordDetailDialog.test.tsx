import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DailyVisitRecordDetailDialog } from '../DailyVisitRecordDetailDialog';
import { DailyVisitRecord } from '../../../types/DailyVisitRecord';

// モックの設定
const mockOnClose = jest.fn();
const mockOnSave = jest.fn();
const mockOnDelete = jest.fn();

const mockRecord: DailyVisitRecord = {
  id: 1,
  date: '2024-01-15',
  patientId: 1,
  hygienistId: 1,
  startTime: '09:00',
  endTime: '10:00',
  status: 'completed',
  notes: 'テスト記録',
  createdAt: new Date(),
  updatedAt: new Date(),
  patient: { id: 1, name: '山田太郎' },
  hygienist: { id: 1, name: '田中花子' }
};

describe('DailyVisitRecordDetailDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ダイアログが正常に表示される', () => {
    render(
      <DailyVisitRecordDetailDialog
        open={true}
        record={mockRecord}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('訪問記録詳細')).toBeInTheDocument();
    expect(screen.getByDisplayValue('山田太郎')).toBeInTheDocument();
    expect(screen.getByDisplayValue('田中花子')).toBeInTheDocument();
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テスト記録')).toBeInTheDocument();
  });

  it('ダイアログが閉じている場合は表示されない', () => {
    render(
      <DailyVisitRecordDetailDialog
        open={false}
        record={mockRecord}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('訪問記録詳細')).not.toBeInTheDocument();
  });

  it('フィールドを編集できる', async () => {
    render(
      <DailyVisitRecordDetailDialog
        open={true}
        record={mockRecord}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    // 開始時間を変更
    const startTimeInput = screen.getByDisplayValue('09:00');
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });

    expect(startTimeInput).toHaveValue('10:00');

    // メモを変更
    const notesInput = screen.getByDisplayValue('テスト記録');
    fireEvent.change(notesInput, { target: { value: '更新されたメモ' } });

    expect(notesInput).toHaveValue('更新されたメモ');
  });

  it('保存ボタンをクリックするとonSaveが呼ばれる', async () => {
    render(
      <DailyVisitRecordDetailDialog
        open={true}
        record={mockRecord}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    // メモを変更
    const notesInput = screen.getByDisplayValue('テスト記録');
    fireEvent.change(notesInput, { target: { value: '更新されたメモ' } });

    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockRecord,
        notes: '更新されたメモ'
      });
    });
  });

  it('削除ボタンをクリックすると確認ダイアログが表示される', async () => {
    render(
      <DailyVisitRecordDetailDialog
        open={true}
        record={mockRecord}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    // 削除ボタンをクリック
    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('この訪問記録を削除しますか？')).toBeInTheDocument();
    });
  });

  it('削除確認でOKをクリックするとonDeleteが呼ばれる', async () => {
    render(
      <DailyVisitRecordDetailDialog
        open={true}
        record={mockRecord}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    // 削除ボタンをクリック
    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    // 確認ダイアログでOKをクリック
    await waitFor(() => {
      const confirmButton = screen.getByText('削除する');
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockRecord.id);
    });
  });

  it('キャンセルボタンをクリックするとonCloseが呼ばれる', async () => {
    render(
      <DailyVisitRecordDetailDialog
        open={true}
        record={mockRecord}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('ステータスを変更できる', async () => {
    render(
      <DailyVisitRecordDetailDialog
        open={true}
        record={mockRecord}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    // ステータスを変更
    const statusSelect = screen.getByDisplayValue('完了');
    fireEvent.change(statusSelect, { target: { value: 'cancelled' } });

    expect(statusSelect).toHaveValue('cancelled');
  });

  it('バリデーションエラーが表示される', async () => {
    render(
      <DailyVisitRecordDetailDialog
        open={true}
        record={mockRecord}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    // 開始時間を空にする
    const startTimeInput = screen.getByDisplayValue('09:00');
    fireEvent.change(startTimeInput, { target: { value: '' } });

    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('開始時間は必須です')).toBeInTheDocument();
    });

    // onSaveが呼ばれないことを確認
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('新規作成モードで表示される', () => {
    render(
      <DailyVisitRecordDetailDialog
        open={true}
        record={null}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('新規訪問記録')).toBeInTheDocument();
    expect(screen.queryByText('削除')).not.toBeInTheDocument();
  });
});