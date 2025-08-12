import { HygienistService } from '../hygienistService';
import apiClient from '../api';
import { Hygienist, CreateHygienistRequest } from '../../types/Hygienist';

// apiClientをモック化
jest.mock('../api');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('HygienistService', () => {
  beforeEach(() => {
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
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01')
        }
      ];

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: mockHygienists
        }
      });

      const result = await HygienistService.getHygienists();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/hygienists');
      expect(result).toEqual(mockHygienists);
    });

    it('APIエラーの場合は適切なエラーメッセージを投げる', async () => {
      const errorResponse = {
        response: {
          data: {
            error: {
              message: 'データベースエラー'
            }
          }
        }
      };

      mockedApiClient.get.mockRejectedValue(errorResponse);

      await expect(HygienistService.getHygienists()).rejects.toThrow('データベースエラー');
    });

    it('不明なエラーの場合はデフォルトメッセージを投げる', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network Error'));

      await expect(HygienistService.getHygienists()).rejects.toThrow('歯科衛生士一覧の取得に失敗しました');
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
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockedApiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: mockHygienist
        }
      });

      const result = await HygienistService.getHygienist(1);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/hygienists/1');
      expect(result).toEqual(mockHygienist);
    });
  });

  describe('createHygienist', () => {
    it('歯科衛生士を正常に作成できる', async () => {
      const createRequest: CreateHygienistRequest = {
        staffId: 'H001',
        name: '佐藤花子',
        licenseNumber: 'DH123456',
        phone: '090-1234-5678',
        email: 'sato@example.com'
      };

      const mockHygienist: Hygienist = {
        id: 1,
        ...createRequest,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockedApiClient.post.mockResolvedValue({
        data: {
          success: true,
          data: mockHygienist
        }
      });

      const result = await HygienistService.createHygienist(createRequest);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/hygienists', createRequest);
      expect(result).toEqual(mockHygienist);
    });
  });

  describe('updateHygienist', () => {
    it('歯科衛生士を正常に更新できる', async () => {
      const updateData = {
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

      mockedApiClient.put.mockResolvedValue({
        data: {
          success: true,
          data: mockHygienist
        }
      });

      const result = await HygienistService.updateHygienist(1, updateData);

      expect(mockedApiClient.put).toHaveBeenCalledWith('/hygienists/1', updateData);
      expect(result).toEqual(mockHygienist);
    });
  });

  describe('deleteHygienist', () => {
    it('歯科衛生士を正常に削除できる', async () => {
      mockedApiClient.delete.mockResolvedValue({
        data: {
          success: true,
          data: { message: '歯科衛生士を削除しました' }
        }
      });

      await HygienistService.deleteHygienist(1);

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/hygienists/1');
    });

    it('削除エラーの場合は適切なエラーメッセージを投げる', async () => {
      const errorResponse = {
        response: {
          data: {
            error: {
              message: 'この歯科衛生士には訪問記録が存在するため削除できません'
            }
          }
        }
      };

      mockedApiClient.delete.mockRejectedValue(errorResponse);

      await expect(HygienistService.deleteHygienist(1)).rejects.toThrow('この歯科衛生士には訪問記録が存在するため削除できません');
    });
  });
});