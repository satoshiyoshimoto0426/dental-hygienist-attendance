import request from 'supertest';
import express from 'express';
import { HygienistController } from '../../controllers/hygienistController';
import { HygienistModel } from '../../models/Hygienist';
import { Hygienist, CreateHygienistInput } from '../../types/Hygienist';

// HygienistModelをモック化
jest.mock('../../models/Hygienist');
const MockedHygienistModel = HygienistModel as jest.Mocked<typeof HygienistModel>;

// 認証なしのテスト用アプリを作成
const app = express();
app.use(express.json());

// 認証ミドルウェアをスキップして直接コントローラーをテスト
app.get('/api/hygienists', HygienistController.getHygienists);
app.get('/api/hygienists/:id', HygienistController.getHygienist);
app.post('/api/hygienists', HygienistController.createHygienist);
app.put('/api/hygienists/:id', HygienistController.updateHygienist);
app.delete('/api/hygienists/:id', HygienistController.deleteHygienist);

describe('Hygienist API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/hygienists', () => {
    it('歯科衛生士一覧を取得できる', async () => {
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
        }
      ];

      MockedHygienistModel.findAll.mockResolvedValue(mockHygienists);

      const response = await request(app)
        .get('/api/hygienists')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('佐藤花子');
    });

    it('検索クエリで歯科衛生士を検索できる', async () => {
      const mockHygienists: Hygienist[] = [];
      MockedHygienistModel.searchByName.mockResolvedValue(mockHygienists);

      await request(app)
        .get('/api/hygienists')
        .query({ search: '佐藤' })
        .expect(200);

      expect(MockedHygienistModel.searchByName).toHaveBeenCalledWith('佐藤');
    });
  });

  describe('GET /api/hygienists/:id', () => {
    it('歯科衛生士詳細を取得できる', async () => {
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

      MockedHygienistModel.findById.mockResolvedValue(mockHygienist);

      const response = await request(app)
        .get('/api/hygienists/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('佐藤花子');
    });

    it('存在しない歯科衛生士の場合は404エラーを返す', async () => {
      MockedHygienistModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/hygienists/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('HYGIENIST_NOT_FOUND');
    });
  });

  describe('POST /api/hygienists', () => {
    it('新しい歯科衛生士を作成できる', async () => {
      const createInput: CreateHygienistInput = {
        staffId: 'H001',
        name: '佐藤花子',
        licenseNumber: 'DH123456',
        phone: '090-1234-5678',
        email: 'sato@example.com'
      };

      const mockHygienist: Hygienist = {
        id: 1,
        ...createInput,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      MockedHygienistModel.create.mockResolvedValue(mockHygienist);

      const response = await request(app)
        .post('/api/hygienists')
        .send(createInput)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('佐藤花子');
    });

    it('バリデーションエラーの場合は400エラーを返す', async () => {
      MockedHygienistModel.create.mockRejectedValue(new Error('バリデーションエラー: 歯科衛生士名は必須です'));

      const response = await request(app)
        .post('/api/hygienists')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/hygienists/:id', () => {
    it('歯科衛生士を更新できる', async () => {
      const updateInput = {
        name: '佐藤美花',
        phone: '090-9876-5432'
      };

      const mockHygienist: Hygienist = {
        id: 1,
        staffId: 'H001',
        name: '佐藤美花',
        licenseNumber: 'DH123456',
        phone: '090-9876-5432',
        email: 'sato@example.com',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      MockedHygienistModel.update.mockResolvedValue(mockHygienist);

      const response = await request(app)
        .put('/api/hygienists/1')
        .send(updateInput)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('佐藤美花');
    });

    it('存在しない歯科衛生士の場合は404エラーを返す', async () => {
      MockedHygienistModel.update.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/hygienists/999')
        .send({ name: '佐藤美花' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('HYGIENIST_NOT_FOUND');
    });
  });

  describe('DELETE /api/hygienists/:id', () => {
    it('歯科衛生士を削除できる', async () => {
      MockedHygienistModel.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/hygienists/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('歯科衛生士を削除しました');
    });

    it('存在しない歯科衛生士の場合は404エラーを返す', async () => {
      MockedHygienistModel.delete.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/hygienists/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('HYGIENIST_NOT_FOUND');
    });

    it('訪問記録が存在する場合は400エラーを返す', async () => {
      MockedHygienistModel.delete.mockRejectedValue(new Error('この歯科衛生士には訪問記録が存在するため削除できません'));

      const response = await request(app)
        .delete('/api/hygienists/1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('HYGIENIST_HAS_RECORDS');
    });
  });
});