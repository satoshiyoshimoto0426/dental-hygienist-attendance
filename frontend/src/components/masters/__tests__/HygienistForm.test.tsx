import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HygienistForm from '../HygienistForm';
import { HygienistService } from '../../../services/hygienistService';
import { Hygienist } from '../../../types/Hygienist';

// HygienistServiceをモック化
jest.mock('../../../services/hygienistService');
const mockedHygienistService = HygienistService as jest.Mocked<typeof HygienistService>;

describe('HygienistForm', () => {
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

  it('新規登録モードで正しく表示される', () => {
    render(
      <HygienistForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('歯科衛生士登録')).toBeInTheDocument();
    expect(screen.getByLabelText('スタッフID')).toHaveValue('');
    expect(screen.getByLabelText('歯科衛生士名')).toHaveValue('');
    expect(screen.getByLabelText('免許番号')).toHaveValue('');
    expect(screen.getByLabelText('電話番号')).toHaveValue('');
    expect(screen.getByLabelText('メールアドレス')).toHaveValue('');
    expect(screen.getByText('登録')).toBeInTheDocument();
  });

  it('編集モードで既存データが表示される', () => {
    render(
      <HygienistForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        hygienist={mockHygienist}
      />
    );

    expect(screen.getByText('歯科衛生士情報編集')).toBeInTheDocument();
    expect(screen.getByLabelText('スタッフID')).toHaveValue('H001');
    expect(screen.getByLabelText('歯科衛生士名')).toHaveValue('佐藤花子');
    expect(screen.getByLabelText('免許番号')).toHaveValue('DH123456');
    expect(screen.getByLabelText('電話番号')).toHaveValue('090-1234-5678');
    expect(screen.getByLabelText('メールアドレス')).toHaveValue('sato@example.com');
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('必須フィールドのバリデーションが動作する', async () => {
    render(
      <HygienistForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByText('登録');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('スタッフIDは必須です')).toBeInTheDocument();
      expect(screen.getByText('歯科衛生士名は必須です')).toBeInTheDocument();
    });

    expect(mockedHygienistService.createHygienist).not.toHaveBeenCalled();
  });

  it('メールアドレスのバリデーションが動作する', async () => {
    render(
      <HygienistForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const emailInput = screen.getByLabelText('メールアドレス');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByText('登録');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('正しいメールアドレス形式で入力してください')).toBeInTheDocument();
    });
  });

  it('新規登録が正常に動作する', async () => {
    const newHygienist: Hygienist = {
      id: 2,
      staffId: 'H002',
      name: '田中美咲',
      licenseNumber: 'DH789012',
      phone: '090-9876-5432',
      email: 'tanaka@example.com',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    };

    mockedHygienistService.createHygienist.mockResolvedValue(newHygienist);

    render(
      <HygienistForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // フォームに入力
    fireEvent.change(screen.getByLabelText('スタッフID'), { target: { value: 'H002' } });
    fireEvent.change(screen.getByLabelText('歯科衛生士名'), { target: { value: '田中美咲' } });
    fireEvent.change(screen.getByLabelText('免許番号'), { target: { value: 'DH789012' } });
    fireEvent.change(screen.getByLabelText('電話番号'), { target: { value: '090-9876-5432' } });
    fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'tanaka@example.com' } });

    // 登録ボタンをクリック
    const submitButton = screen.getByText('登録');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedHygienistService.createHygienist).toHaveBeenCalledWith({
        staffId: 'H002',
        name: '田中美咲',
        licenseNumber: 'DH789012',
        phone: '090-9876-5432',
        email: 'tanaka@example.com'
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('更新が正常に動作する', async () => {
    const updatedHygienist: Hygienist = {
      ...mockHygienist,
      name: '佐藤美花',
      phone: '090-9999-9999'
    };

    mockedHygienistService.updateHygienist.mockResolvedValue(updatedHygienist);

    render(
      <HygienistForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        hygienist={mockHygienist}
      />
    );

    // フォームを編集
    fireEvent.change(screen.getByLabelText('歯科衛生士名'), { target: { value: '佐藤美花' } });
    fireEvent.change(screen.getByLabelText('電話番号'), { target: { value: '090-9999-9999' } });

    // 更新ボタンをクリック
    const submitButton = screen.getByText('更新');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedHygienistService.updateHygienist).toHaveBeenCalledWith(1, {
        staffId: 'H001',
        name: '佐藤美花',
        licenseNumber: 'DH123456',
        phone: '090-9999-9999',
        email: 'sato@example.com'
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('APIエラーが発生した場合はエラーメッセージを表示する', async () => {
    const errorMessage = 'このスタッフIDは既に使用されています';
    mockedHygienistService.createHygienist.mockRejectedValue(new Error(errorMessage));

    render(
      <HygienistForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // フォームに入力
    fireEvent.change(screen.getByLabelText('スタッフID'), { target: { value: 'H001' } });
    fireEvent.change(screen.getByLabelText('歯科衛生士名'), { target: { value: '佐藤花子' } });

    // 登録ボタンをクリック
    const submitButton = screen.getByText('登録');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('キャンセルボタンをクリックするとonCloseが呼ばれる', () => {
    render(
      <HygienistForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});