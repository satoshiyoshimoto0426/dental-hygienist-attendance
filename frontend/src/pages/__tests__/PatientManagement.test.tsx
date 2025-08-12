import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PatientManagement } from '../PatientManagement';
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
    email: 'yamada@example.com',
    address: '東京都渋谷区',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    patientId: 'P002',
    name: '佐藤花子',
    phone: '090-8765-4321',
    email: 'sato@example.com',
    address: '東京都新宿区',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// API呼び出しのモック
jest.mock('../../services/patientService', () => ({
  getPatients: jest.fn().mockResolvedValue(mockPatients),
  createPatient: jest.fn(),
  updatePatient: jest.fn(),
  deletePatient: jest.fn()
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

describe('PatientManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('患者管理ページが正常に表示される', async () => {
    renderWithProviders(<PatientManagement />);

    expect(screen.getByText('患者管理')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
    });
  });

  it('新規患者登録ボタンが表示される', async () => {
    renderWithProviders(<PatientManagement />);

    await waitFor(() => {
      expect(screen.getByText('新規患者登録')).toBeInTheDocument();
    });
  });

  it('患者一覧が表示される', async () => {
    renderWithProviders(<PatientManagement />);

    await waitFor(() => {
      expect(screen.getByText('P001')).toBeInTheDocument();
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.getByText('090-1234-5678')).toBeInTheDocument();
      expect(screen.getByText('yamada@example.com')).toBeInTheDocument();
      
      expect(screen.getByText('P002')).toBeInTheDocument();
      expect(screen.getByText('佐藤花子')).toBeInTheDocument();
      expect(screen.getByText('090-8765-4321')).toBeInTheDocument();
      expect(screen.getByText('sato@example.com')).toBeInTheDocument();
    });
  });

  it('新規患者登録ボタンをクリックすると登録フォームが表示される', async () => {
    renderWithProviders(<PatientManagement />);

    await waitFor(() => {
      const addButton = screen.getByText('新規患者登録');
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(screen.getByText('患者登録')).toBeInTheDocument();
      expect(screen.getByLabelText('患者ID')).toBeInTheDocument();
      expect(screen.getByLabelText('患者名')).toBeInTheDocument();
    });
  });

  it('患者の編集ボタンをクリックすると編集フォームが表示される', async () => {
    renderWithProviders(<PatientManagement />);

    await waitFor(() => {
      const editButtons = screen.getAllByText('編集');
      fireEvent.click(editButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('患者編集')).toBeInTheDocument();
      expect(screen.getByDisplayValue('山田太郎')).toBeInTheDocument();
    });
  });

  it('患者の削除ボタンをクリックすると削除確認ダイアログが表示される', async () => {
    renderWithProviders(<PatientManagement />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('削除');
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('患者を削除しますか？')).toBeInTheDocument();
      expect(screen.getByText('山田太郎を削除しますか？')).toBeInTheDocument();
    });
  });

  it('患者を削除できる', async () => {
    const patientService = require('../../services/patientService');
    patientService.deletePatient.mockResolvedValueOnce(true);

    renderWithProviders(<PatientManagement />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('削除');
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      const confirmButton = screen.getByText('削除する');
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(patientService.deletePatient).toHaveBeenCalledWith(1);
    });
  });

  it('患者を新規作成できる', async () => {
    const patientService = require('../../services/patientService');
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

    renderWithProviders(<PatientManagement />);

    // 新規登録ボタンをクリック
    await waitFor(() => {
      const addButton = screen.getByText('新規患者登録');
      fireEvent.click(addButton);
    });

    // フォームに入力
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('患者ID'), { target: { value: 'P003' } });
      fireEvent.change(screen.getByLabelText('患者名'), { target: { value: '田中次郎' } });
      fireEvent.change(screen.getByLabelText('電話番号'), { target: { value: '090-1111-2222' } });
      fireEvent.change(screen.getByLabelText('メールアドレス'), { target: { value: 'tanaka@example.com' } });
      fireEvent.change(screen.getByLabelText('住所'), { target: { value: '東京都品川区' } });
    });

    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(patientService.createPatient).toHaveBeenCalledWith({
        patientId: 'P003',
        name: '田中次郎',
        phone: '090-1111-2222',
        email: 'tanaka@example.com',
        address: '東京都品川区'
      });
    });
  });

  it('患者を更新できる', async () => {
    const patientService = require('../../services/patientService');
    const updatedPatient = {
      ...mockPatients[0],
      name: '山田太郎（更新）'
    };
    patientService.updatePatient.mockResolvedValueOnce(updatedPatient);

    renderWithProviders(<PatientManagement />);

    // 編集ボタンをクリック
    await waitFor(() => {
      const editButtons = screen.getAllByText('編集');
      fireEvent.click(editButtons[0]);
    });

    // 名前を変更
    await waitFor(() => {
      const nameInput = screen.getByDisplayValue('山田太郎');
      fireEvent.change(nameInput, { target: { value: '山田太郎（更新）' } });
    });

    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(patientService.updatePatient).toHaveBeenCalledWith(1, expect.objectContaining({
        name: '山田太郎（更新）'
      }));
    });
  });

  it('検索機能が動作する', async () => {
    renderWithProviders(<PatientManagement />);

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('患者名で検索');
      fireEvent.change(searchInput, { target: { value: '山田' } });
    });

    await waitFor(() => {
      expect(screen.getByText('山田太郎')).toBeInTheDocument();
      expect(screen.queryByText('佐藤花子')).not.toBeInTheDocument();
    });
  });

  it('ローディング状態が表示される', () => {
    const patientService = require('../../services/patientService');
    patientService.getPatients.mockReturnValueOnce(new Promise(() => {})); // 永続的にpending

    renderWithProviders(<PatientManagement />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('エラー状態が表示される', async () => {
    const patientService = require('../../services/patientService');
    patientService.getPatients.mockRejectedValueOnce(new Error('API Error'));

    renderWithProviders(<PatientManagement />);

    await waitFor(() => {
      expect(mockErrorContextValue.showError).toHaveBeenCalledWith(
        '患者データの取得に失敗しました'
      );
    });
  });

  it('ページネーションが動作する', async () => {
    // 大量のデータをモック
    const manyPatients = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      patientId: `P${String(i + 1).padStart(3, '0')}`,
      name: `患者${i + 1}`,
      phone: `090-1234-${String(i).padStart(4, '0')}`,
      email: `patient${i + 1}@example.com`,
      address: '東京都',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const patientService = require('../../services/patientService');
    patientService.getPatients.mockResolvedValueOnce(manyPatients);

    renderWithProviders(<PatientManagement />);

    await waitFor(() => {
      expect(screen.getByText('患者1')).toBeInTheDocument();
      expect(screen.queryByText('患者25')).not.toBeInTheDocument();
    });

    // 次のページボタンをクリック
    const nextButton = screen.getByLabelText('次のページ');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('患者21')).toBeInTheDocument();
    });
  });
});