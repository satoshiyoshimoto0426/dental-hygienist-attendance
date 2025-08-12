import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PatientService } from '../patientService';
import apiClient from '../api';
import { Patient, CreatePatientRequest } from '../../types/Patient';

// apiClientをモック
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
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

const mockPatients: Patient[] = [mockPatient];

describe('PatientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPatients', () => {
    it('患者一覧を正常に取得できる', async () => {
      const mockGet = apiClient.get as any;
      mockGet.mockResolvedValue({
        data: { success: true, data: mockPatients }
      });

      const result = await PatientService.getPatients();

      expect(apiClient.get).toHaveBeenCalledWith('/patients');
      expect(result).toEqual(mockPatients);
    });

    it('APIエラー時に適切なエラーメッセージを投げる', async () => {
      const errorResponse = {
        response: {
          data: {
            error: {
              message: 'データベース接続エラー'
            }
          }
        }
      };
      const mockGet = apiClient.get as any;
      mockGet.mockRejectedValue(errorResponse);

      await expect(PatientService.getPatients()).rejects.toThrow('データベース接続エラー');
    });
  });

  describe('createPatient', () => {
    it('患者を正常に登録できる', async () => {
      const createRequest: CreatePatientRequest = {
        patientId: 'P001',
        name: '田中太郎',
        phone: '090-1234-5678',
        email: 'tanaka@example.com',
        address: '東京都渋谷区'
      };

      const mockPost = apiClient.post as any;
      mockPost.mockResolvedValue({
        data: { success: true, data: mockPatient }
      });

      const result = await PatientService.createPatient(createRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/patients', createRequest);
      expect(result).toEqual(mockPatient);
    });
  });

  describe('deletePatient', () => {
    it('患者を正常に削除できる', async () => {
      const mockDelete = apiClient.delete as any;
      mockDelete.mockResolvedValue({});

      await PatientService.deletePatient(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/patients/1');
    });
  });
});