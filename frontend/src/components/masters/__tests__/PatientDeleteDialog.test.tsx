import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatientDeleteDialog from '../PatientDeleteDialog';
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

const mockPatient: Patient = {
  id: 1,
  patientId: 'P001',
  name: '田中太郎',
  phone: '090-1234-5678',
  email: 'tanaka@example.com',
  address: '東京都渋谷区',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

describe('PatientDeleteDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('患者情報が正しく表示される', () => {
    render(
      <PatientDeleteDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        patient={mockPatient}
      />
    );

    expect(screen.getByText('患者削除の確認')).toBeInTheDocument();
    expect(screen.getByText('P001')).toBeInTheDocument();
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
    expect(screen.getByText('以下の患者を削除してもよろしいですか？')).toBeInTheDocument();
  });

  it('患者がnullの場合は何も表示されない', () => {
    const { container } = render(
      <PatientDeleteDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        patient={null}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});