import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatientList from '../PatientList';
import { PatientService } from '../../../services/patientService';
import { Patient } from '../../../types/Patient';

// PatientServiceをモック
vi.mock('../../../services/patientService', () => ({
  PatientService: {
    getPatients: vi.fn(),
    getPatient: vi.fn(),
    createPatient: vi.fn(),
    updatePatient: vi.fn(),
    deletePatient: vi.fn(),
  }
}));

const mockPatients: Patient[] = [
  {
    id: 1,
    patientId: 'P001',
    name: '田中太郎',
    phone: '090-1234-5678',
    email: 'tanaka@example.com',
    address: '東京都渋谷区',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

describe('PatientList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('患者一覧が正しく表示される', async () => {
    const mockGetPatients = PatientService.getPatients as any;
    mockGetPatients.mockResolvedValue(mockPatients);

    render(
      <PatientList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    // ローディング表示の確認
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // 患者データの表示を待つ
    await waitFor(() => {
      expect(screen.getByText('田中太郎')).toBeInTheDocument();
    });

    expect(screen.getByText('P001')).toBeInTheDocument();
  });

  it('患者データが空の場合、適切なメッセージが表示される', async () => {
    const mockGetPatients = PatientService.getPatients as any;
    mockGetPatients.mockResolvedValue([]);

    render(
      <PatientList
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAdd={mockOnAdd}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('登録されている患者がありません')).toBeInTheDocument();
    });
  });
});