import { Request, Response } from 'express';
import { PatientController } from '../patientController';
import { PatientModel } from '../../models/Patient';
import { Patient, CreatePatientInput, UpdatePatientInput } from '../../types/Patient';

// PatientModelをモック化
jest.mock('../../models/Patient');
const MockedPatientModel = PatientModel as jest.Mocked<typeof PatientModel>;

describe('PatientController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };
    
    jest.clearAllMocks();
  });

  describe('getPatients', () => {
    it('患者一覧を正常に取得できる', async () => {
      const mockPatients: Patient[] = [
        {
          id: 1,
          patientId: 'P001',
          name: '田中太郎',
          phone: '090-1234-5678',
          email: 'tanaka@example.com',
          address: '東京都渋谷区',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      MockedPatientModel.findAll.mockResolvedValue(mockPatients);
      mockRequest.query = {};

      await PatientController.getPatients(mockRequest as Request, mockResponse as Response);

      expect(MockedPatientModel.findAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockPatients
      });
    });

    it('検索クエリがある場合は検索を実行する', async () => {
      const mockPatients: Patient[] = [];
      MockedPatientModel.searchByName.mockResolvedValue(mockPatients);
      mockRequest.query = { search: '田中' };

      await PatientController.getPatients(mockRequest as Request, mockResponse as Response);

      expect(MockedPatientModel.searchByName).toHaveBeenCalledWith('田中');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockPatients
      });
    });

    it('エラーが発生した場合は500エラーを返す', async () => {
      MockedPatientModel.findAll.mockRejectedValue(new Error('データベースエラー'));
      mockRequest.query = {};

      await PatientController.getPatients(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'PATIENT_FETCH_ERROR',
          message: 'データベースエラー'
        }
      });
    });
  });

  describe('getPatient', () => {
    it('患者詳細を正常に取得できる', async () => {
      const mockPatient: Patient = {
        id: 1,
        patientId: 'P001',
        name: '田中太郎',
        phone: '090-1234-5678',
        email: 'tanaka@example.com',
        address: '東京都渋谷区',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedPatientModel.findById.mockResolvedValue(mockPatient);
      mockRequest.params = { id: '1' };

      await PatientController.getPatient(mockRequest as Request, mockResponse as Response);

      expect(MockedPatientModel.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockPatient
      });
    });

    it('無効なIDの場合は400エラーを返す', async () => {
      mockRequest.params = { id: 'invalid' };

      await PatientController.getPatient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_PATIENT_ID',
          message: '無効な患者IDです'
        }
      });
    });

    it('患者が見つからない場合は404エラーを返す', async () => {
      MockedPatientModel.findById.mockResolvedValue(null);
      mockRequest.params = { id: '1' };

      await PatientController.getPatient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: '患者が見つかりません'
        }
      });
    });
  });

  describe('createPatient', () => {
    it('患者を正常に作成できる', async () => {
      const createInput: CreatePatientInput = {
        patientId: 'P001',
        name: '田中太郎',
        phone: '090-1234-5678',
        email: 'tanaka@example.com',
        address: '東京都渋谷区'
      };

      const mockPatient: Patient = {
        id: 1,
        ...createInput,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedPatientModel.create.mockResolvedValue(mockPatient);
      mockRequest.body = createInput;

      await PatientController.createPatient(mockRequest as Request, mockResponse as Response);

      expect(MockedPatientModel.create).toHaveBeenCalledWith(createInput);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockPatient
      });
    });

    it('バリデーションエラーの場合は400エラーを返す', async () => {
      MockedPatientModel.create.mockRejectedValue(new Error('バリデーションエラー: 患者名は必須です'));
      mockRequest.body = {};

      await PatientController.createPatient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'バリデーションエラー: 患者名は必須です'
        }
      });
    });

    it('患者ID重複の場合は409エラーを返す', async () => {
      MockedPatientModel.create.mockRejectedValue(new Error('この患者IDは既に使用されています'));
      mockRequest.body = { patientId: 'P001', name: '田中太郎' };

      await PatientController.createPatient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DUPLICATE_PATIENT_ID',
          message: 'この患者IDは既に使用されています'
        }
      });
    });
  });

  describe('updatePatient', () => {
    it('患者を正常に更新できる', async () => {
      const updateInput: UpdatePatientInput = {
        name: '田中次郎',
        phone: '090-9876-5432'
      };

      const mockPatient: Patient = {
        id: 1,
        patientId: 'P001',
        name: '田中次郎',
        phone: '090-9876-5432',
        email: 'tanaka@example.com',
        address: '東京都渋谷区',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedPatientModel.update.mockResolvedValue(mockPatient);
      mockRequest.params = { id: '1' };
      mockRequest.body = updateInput;

      await PatientController.updatePatient(mockRequest as Request, mockResponse as Response);

      expect(MockedPatientModel.update).toHaveBeenCalledWith(1, updateInput);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockPatient
      });
    });

    it('患者が見つからない場合は404エラーを返す', async () => {
      MockedPatientModel.update.mockResolvedValue(null);
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: '田中次郎' };

      await PatientController.updatePatient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: '患者が見つかりません'
        }
      });
    });
  });

  describe('deletePatient', () => {
    it('患者を正常に削除できる', async () => {
      MockedPatientModel.delete.mockResolvedValue(true);
      mockRequest.params = { id: '1' };

      await PatientController.deletePatient(mockRequest as Request, mockResponse as Response);

      expect(MockedPatientModel.delete).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { message: '患者を削除しました' }
      });
    });

    it('患者が見つからない場合は404エラーを返す', async () => {
      MockedPatientModel.delete.mockResolvedValue(false);
      mockRequest.params = { id: '1' };

      await PatientController.deletePatient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'PATIENT_NOT_FOUND',
          message: '患者が見つかりません'
        }
      });
    });

    it('訪問記録が存在する場合は400エラーを返す', async () => {
      MockedPatientModel.delete.mockRejectedValue(new Error('この患者には訪問記録が存在するため削除できません'));
      mockRequest.params = { id: '1' };

      await PatientController.deletePatient(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'PATIENT_HAS_RECORDS',
          message: 'この患者には訪問記録が存在するため削除できません'
        }
      });
    });
  });
});