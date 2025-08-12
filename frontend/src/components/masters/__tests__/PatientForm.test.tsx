import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PatientForm from '../PatientForm';
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

describe('PatientForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('新規登録モードで正しく表示される', () => {
    render(
      <PatientForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('患者登録')).toBeInTheDocument();
    expect(screen.getByText('登録')).toBeInTheDocument();
  });

  it('編集モードで既存データが表示される', () => {
    render(
      <PatientForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        patient={mockPatient}
      />
    );

    expect(screen.getByText('患者情報編集')).toBeInTheDocument();
    expect(screen.getByDisplayValue('P001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('田中太郎')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });
});