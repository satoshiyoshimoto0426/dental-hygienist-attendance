import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HygienistList from '../HygienistList';
import { HygienistService } from '../../../services/hygienistService';
import { Hygienist } from '../../../types/Hygienist';

// HygienistServiceをモック化
jest.mock('../../../services/hygienistService');
const mockedHygienistService = HygienistService as jest.Mocked<typeof HygienistService>;

describe('HygienistList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAdd = jest.fn();

  const mockHygienists: Hygienist[] = [
    {
      id: 1,
      staffId: 'H001',
      name: '佐藤花子',
      licenseNumber: 'DH123456',
      phone: '090-1234-5678',
      email: 'sato@example.com',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 2,
      staffId: 'H002',
      name: '田中美咲',
      licenseNumber: 'DH789012',
      phone: '090-9876-5432',
      email: 'tanaka@example.com',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('歯科衛生士一覧を正常に表示する', async () => {
    mockedHygienistService.getHygienists.mockResolvedValue(mockHygienists);

    render(
      <HygienistList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    // ローディング表示の確認
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // データが読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    });

    // 歯科衛生士データの表示確認
    expect(screen.getByText('H001')).toBeInTheDocument();
    expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    expect(screen.getByText('DH123456')).toBeInTheDocument();
    expect(screen.getByText('090-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('sato@example.com')).toBeInTheDocument();

    expect(screen.getByText('H002')).toBeInTheDocument();
    expect(screen.getByText('田中美咲')).toBeInTheDocument();
    expect(screen.getByText('DH789012')).toBeInTheDocument();
    expect(screen.getByText('090-9876-5432')).toBeInTheDocument();
    expect(screen.getByText('tanaka@example.com')).toBeInTheDocument();
  });

  it('歯科衛生士が存在しない場合は適切なメッセージを表示する', async () => {
    mockedHygienistService.getHygienists.mockResolvedValue([]);

    render(
      <HygienistList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('登録されている歯科衛生士がありません')).toBeInTheDocument();
    });
  });

  it('エラーが発生した場合はエラーメッセージを表示する', async () => {
    const errorMessage = 'データベースエラー';
    mockedHygienistService.getHygienists.mockRejectedValue(new Error(errorMessage));

    render(
      <HygienistList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('追加ボタンをクリックするとonAddが呼ばれる', async () => {
    mockedHygienistService.getHygienists.mockResolvedValue(mockHygienists);

    render(
      <HygienistList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    });

    const addButton = screen.getByLabelText('新しい歯科衛生士を追加');
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it('編集ボタンをクリックするとonEditが呼ばれる', async () => {
    mockedHygienistService.getHygienists.mockResolvedValue(mockHygienists);

    render(
      <HygienistList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText('編集');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockHygienists[0]);
  });

  it('削除ボタンをクリックするとonDeleteが呼ばれる', async () => {
    mockedHygienistService.getHygienists.mockResolvedValue(mockHygienists);

    render(
      <HygienistList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('削除');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockHygienists[0]);
  });

  it('refreshTriggerが変更されると再読み込みされる', async () => {
    mockedHygienistService.getHygienists.mockResolvedValue(mockHygienists);

    const { rerender } = render(
      <HygienistList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
        refreshTrigger={0}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    });

    expect(mockedHygienistService.getHygienists).toHaveBeenCalledTimes(1);

    // refreshTriggerを変更
    rerender(
      <HygienistList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
        refreshTrigger={1}
      />
    );

    await waitFor(() => {
      expect(mockedHygienistService.getHygienists).toHaveBeenCalledTimes(2);
    });
  });
});