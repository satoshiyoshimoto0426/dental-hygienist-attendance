import request from 'supertest';
import express from 'express';
import { PatientController } from '../../controllers/patientController';
import { PatientModel } from '../../models/Patient';
import { Patient, CreatePatientInput } from '../../types/Patient';

// PatientModelをモック化
jest.mock('../../models/Patient');
const MockedPatientModel = PatientModel as jest.Mocked<typeof PatientModel>;

// 認証なしのテスト用アプリを作成
const app = express();
app.use(express.json());

// 認証ミドルウェアをスキップして直接コントローラーをテスト
app.get('/api/patients', PatientController.getPatients);
app.get('/api/patients/:id', PatientController.getPatient);
app.post('/api/patients', PatientController.createPatient);
app.put('/api/patients/:id', PatientController.updatePatient);
app.delete('/api/patients/:id', PatientController.deletePatient);

describe('Patient API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/patients', () => {
    it('患者一覧を取得できる', async () => {
      const mockPatients: Patient[] = [
        {
          id: 1,
          patientId: 'P001',
          name: '田中太郎',
          phone: '090-1234-5678',
          email: 'tanaka@example.com',
          address: '東京都渋谷区',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01')
        }
      ];

      MockedPatientModel.findAll.mockResolvedValue(mockPatients);

      const response = await request(app)
        .get('/api/patients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('田中太郎');
    });

    it('検索クエリで患者を検索できる', async () => {
      const mockPatients: Patient[] = [];
      MockedPatientModel.searchByName.mockResolvedValue(mockPatients);

      await request(app)
        .get('/api/patients')
        .query({ search: '田中' })
        .expect(200);

      expect(MockedPatientModel.searchByName).toHaveBeenCalledWith('田中');
    });
  });

  describe('POST /api/patients', () => {
    it('新しい患者を作成できる', async () => {
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
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      MockedPatientModel.create.mockResolvedValue(mockPatient);

      const response = await request(app)
        .post('/api/patients')
        .send(createInput)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('田中太郎');
    });
  });

  describe('DELETE /api/patients/:id', () => {
    it('患者を削除できる', async () => {
      MockedPatientModel.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/patients/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('患者を削除しました');
    });
  });
});