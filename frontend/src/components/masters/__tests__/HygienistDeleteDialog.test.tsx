import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HygienistDeleteDialog from '../HygienistDeleteDialog';
import { HygienistService } from '../../../services/hygienistService';
import { Hygienist } from '../../../types/Hygienist';

// HygienistServiceをモック化
jest.mock('../../../services/hygienistService');
const mockedHygienistService = HygienistService as jest.Mocked<typeof HygienistService>;

describe('HygienistDeleteDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const mockHygienist: Hygienist = {
    id: 1,
    staffId: 'H001',
    name: '佐藤花子',
    licenseNumber: 'DH123456',
    phone: '090-1234-5678',
    email: 'sato@example.com',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('歯科衛生士情報を正しく表示する', () => {
    render(
      <HygienistDeleteDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        hygienist={mockHygienist}
      />
    );

    expect(screen.getByText('歯科衛生士削除の確認')).toBeInTheDocument();
    expect(screen.getByText('以下の歯科衛生士を削除してもよろしいですか？')).toBeInTheDocument();
    
    expect(screen.getByText('H001')).toBeInTheDocument();
    expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    expect(screen.getByText('DH123456')).toBeInTheDocument();
    expect(screen.getByText('090-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('sato@example.com')).toBeInTheDocument();
    
    expect(screen.getByText('※ この操作は取り消すことができません。関連する訪問記録やユーザーアカウントがある場合は削除できません。')).toBeInTheDocument();
  });

  it('歯科衛生士がnullの場合は何も表示しない', () => {
    render(
      <HygienistDeleteDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        hygienist={null}
      />
    );

    expect(screen.queryByText('歯科衛生士削除の確認')).not.toBeInTheDocument();
  });

  it('削除が正常に動作する', async () => {
    mockedHygienistService.deleteHygienist.mockResolvedValue();

    render(
      <HygienistDeleteDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        hygienist={mockHygienist}
      />
    );

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockedHygienistService.deleteHygienist).toHaveBeenCalledWith(1);
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('削除エラーが発生した場合はエラーメッセージを表示する', async () => {
    const errorMessage = 'この歯科衛生士には訪問記録が存在するため削除できません';
    mockedHygienistService.deleteHygienist.mockRejectedValue(new Error(errorMessage));

    render(
      <HygienistDeleteDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        hygienist={mockHygienist}
      />
    );

    const deleteButton = screen.getByText('削除');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
    render(
      <HygienistDeleteDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        hygienist={mockHygienist}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('オプショナルフィールドがない場合は表示されない', () => {
    const hygienistWithoutOptionalFields: Hygienist = {
      id: 1,
      staffId: 'H001',
      name: '佐藤花子',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    };

    render(
      <HygienistDeleteDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        hygienist={hygienistWithoutOptionalFields}
      />
    );

    expect(screen.getByText('H001')).toBeInTheDocument();
    expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    
    // オプショナルフィールドは表示されない
    expect(screen.queryByText('免許番号')).not.toBeInTheDocument();
    expect(screen.queryByText('電話番号')).not.toBeInTheDocument();
    expect(screen.queryByText('メールアドレス')).not.toBeInTheDocument();
  });
});