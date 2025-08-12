import { Request, Response } from 'express';
import { HygienistController } from '../hygienistController';
import { HygienistModel } from '../../models/Hygienist';
import { Hygienist, CreateHygienistInput, UpdateHygienistInput } from '../../types/Hygienist';

// HygienistModelをモック化
jest.mock('../../models/Hygienist');
const MockedHygienistModel = HygienistModel as jest.Mocked<typeof HygienistModel>;

describe('HygienistController', () => {
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

  describe('getHygienists', () => {
    it('歯科衛生士一覧を正常に取得できる', async () => {
      const mockHygienists: Hygienist[] = [
        {
          id: 1,
          staffId: 'H001',
          name: '佐藤花子',
          licenseNumber: 'DH123456',
          phone: '090-1234-5678',
          email: 'sato@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      MockedHygienistModel.findAll.mockResolvedValue(mockHygienists);
      mockRequest.query = {};

      await HygienistController.getHygienists(mockRequest as Request, mockResponse as Response);

      expect(MockedHygienistModel.findAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockHygienists
      });
    });

    it('検索クエリがある場合は検索を実行する', async () => {
      const mockHygienists: Hygienist[] = [];
      MockedHygienistModel.searchByName.mockResolvedValue(mockHygienists);
      mockRequest.query = { search: '佐藤' };

      await HygienistController.getHygienists(mockRequest as Request, mockResponse as Response);

      expect(MockedHygienistModel.searchByName).toHaveBeenCalledWith('佐藤');
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockHygienists
      });
    });

    it('エラーが発生した場合は500エラーを返す', async () => {
      MockedHygienistModel.findAll.mockRejectedValue(new Error('データベースエラー'));
      mockRequest.query = {};

      await HygienistController.getHygienists(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'HYGIENIST_FETCH_ERROR',
          message: 'データベースエラー'
        }
      });
    });
  });

  describe('getHygienist', () => {
    it('歯科衛生士詳細を正常に取得できる', async () => {
      const mockHygienist: Hygienist = {
        id: 1,
        staffId: 'H001',
        name: '佐藤花子',
        licenseNumber: 'DH123456',
        phone: '090-1234-5678',
        email: 'sato@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedHygienistModel.findById.mockResolvedValue(mockHygienist);
      mockRequest.params = { id: '1' };

      await HygienistController.getHygienist(mockRequest as Request, mockResponse as Response);

      expect(MockedHygienistModel.findById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockHygienist
      });
    });

    it('無効なIDの場合は400エラーを返す', async () => {
      mockRequest.params = { id: 'invalid' };

      await HygienistController.getHygienist(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_HYGIENIST_ID',
          message: '無効な歯科衛生士IDです'
        }
      });
    });

    it('歯科衛生士が見つからない場合は404エラーを返す', async () => {
      MockedHygienistModel.findById.mockResolvedValue(null);
      mockRequest.params = { id: '1' };

      await HygienistController.getHygienist(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'HYGIENIST_NOT_FOUND',
          message: '歯科衛生士が見つかりません'
        }
      });
    });
  });

  describe('createHygienist', () => {
    it('歯科衛生士を正常に作成できる', async () => {
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
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedHygienistModel.create.mockResolvedValue(mockHygienist);
      mockRequest.body = createInput;

      await HygienistController.createHygienist(mockRequest as Request, mockResponse as Response);

      expect(MockedHygienistModel.create).toHaveBeenCalledWith(createInput);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockHygienist
      });
    });

    it('バリデーションエラーの場合は400エラーを返す', async () => {
      MockedHygienistModel.create.mockRejectedValue(new Error('バリデーションエラー: 歯科衛生士名は必須です'));
      mockRequest.body = {};

      await HygienistController.createHygienist(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'バリデーションエラー: 歯科衛生士名は必須です'
        }
      });
    });

    it('スタッフID重複の場合は409エラーを返す', async () => {
      MockedHygienistModel.create.mockRejectedValue(new Error('このスタッフIDは既に使用されています'));
      mockRequest.body = { staffId: 'H001', name: '佐藤花子' };

      await HygienistController.createHygienist(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DUPLICATE_STAFF_ID',
          message: 'このスタッフIDは既に使用されています'
        }
      });
    });
  });

  describe('updateHygienist', () => {
    it('歯科衛生士を正常に更新できる', async () => {
      const updateInput: UpdateHygienistInput = {
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
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedHygienistModel.update.mockResolvedValue(mockHygienist);
      mockRequest.params = { id: '1' };
      mockRequest.body = updateInput;

      await HygienistController.updateHygienist(mockRequest as Request, mockResponse as Response);

      expect(MockedHygienistModel.update).toHaveBeenCalledWith(1, updateInput);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockHygienist
      });
    });

    it('歯科衛生士が見つからない場合は404エラーを返す', async () => {
      MockedHygienistModel.update.mockResolvedValue(null);
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: '佐藤美花' };

      await HygienistController.updateHygienist(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'HYGIENIST_NOT_FOUND',
          message: '歯科衛生士が見つかりません'
        }
      });
    });
  });

  describe('deleteHygienist', () => {
    it('歯科衛生士を正常に削除できる', async () => {
      MockedHygienistModel.delete.mockResolvedValue(true);
      mockRequest.params = { id: '1' };

      await HygienistController.deleteHygienist(mockRequest as Request, mockResponse as Response);

      expect(MockedHygienistModel.delete).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { message: '歯科衛生士を削除しました' }
      });
    });

    it('歯科衛生士が見つからない場合は404エラーを返す', async () => {
      MockedHygienistModel.delete.mockResolvedValue(false);
      mockRequest.params = { id: '1' };

      await HygienistController.deleteHygienist(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'HYGIENIST_NOT_FOUND',
          message: '歯科衛生士が見つかりません'
        }
      });
    });

    it('訪問記録が存在する場合は400エラーを返す', async () => {
      MockedHygienistModel.delete.mockRejectedValue(new Error('この歯科衛生士には訪問記録が存在するため削除できません'));
      mockRequest.params = { id: '1' };

      await HygienistController.deleteHygienist(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'HYGIENIST_HAS_RECORDS',
          message: 'この歯科衛生士には訪問記録が存在するため削除できません'
        }
      });
    });

    it('ユーザーアカウントが関連付けられている場合は400エラーを返す', async () => {
      MockedHygienistModel.delete.mockRejectedValue(new Error('この歯科衛生士にはユーザーアカウントが関連付けられているため削除できません'));
      mockRequest.params = { id: '1' };

      await HygienistController.deleteHygienist(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'HYGIENIST_HAS_RECORDS',
          message: 'この歯科衛生士にはユーザーアカウントが関連付けられているため削除できません'
        }
      });
    });
  });
});