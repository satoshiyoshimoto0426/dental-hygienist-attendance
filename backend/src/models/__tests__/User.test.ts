import { UserModel } from '../User';
import { pool } from '../../database/connection';

// モックデータ
const mockUserData = {
  username: 'testuser',
  password: 'password123',
  role: 'user' as const
};

describe('User', () => {
  beforeAll(async () => {
    // テスト用データベースのセットアップ
    await pool.query('DELETE FROM users WHERE username LIKE $1', ['testuser%']);
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await pool.query('DELETE FROM users WHERE username LIKE $1', ['testuser%']);
  });

  describe('create', () => {
    it('正常なユーザーデータでユーザーを作成できる', async () => {
      const user = await UserModel.create(mockUserData);
      
      expect(user).toBeDefined();
      expect(user.username).toBe(mockUserData.username);
      expect(user.role).toBe(mockUserData.role);
      expect(user.id).toBeGreaterThan(0);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      // パスワードハッシュは返されない
      expect((user as any).password).toBeUndefined();
    });

    it('重複するユーザー名でエラーが発生する', async () => {
      await expect(UserModel.create(mockUserData)).rejects.toThrow('このユーザー名は既に使用されています');
    });

    it('必須フィールドが不足している場合エラーが発生する', async () => {
      const invalidData = { ...mockUserData, username: '' };
      await expect(UserModel.create(invalidData)).rejects.toThrow('バリデーションエラー');
    });

    it('短すぎるパスワードでエラーが発生する', async () => {
      const invalidData = { ...mockUserData, username: 'testuser2', password: '123' };
      await expect(UserModel.create(invalidData)).rejects.toThrow('バリデーションエラー');
    });
  });

  describe('findById', () => {
    it('存在するユーザーIDでユーザーを取得できる', async () => {
      const createdUser = await UserModel.create({ ...mockUserData, username: 'testuser3' });
      const foundUser = await UserModel.findById(createdUser.id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.username).toBe('testuser3');
    });

    it('存在しないユーザーIDでnullが返される', async () => {
      const foundUser = await UserModel.findById(99999);
      expect(foundUser).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('存在するユーザー名でユーザーを取得できる', async () => {
      const foundUser = await UserModel.findByUsername('testuser3');
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.username).toBe('testuser3');
    });

    it('存在しないユーザー名でnullが返される', async () => {
      const foundUser = await UserModel.findByUsername('nonexistent');
      expect(foundUser).toBeNull();
    });
  });

  describe('authenticate', () => {
    it('正しい認証情報で認証できる', async () => {
      const result = await UserModel.authenticate({
        username: 'testuser3',
        password: 'password123'
      });
      
      expect(result).toBeDefined();
      expect(result?.user.username).toBe('testuser3');
      expect(result?.token).toBeDefined();
      expect(typeof result?.token).toBe('string');
    });

    it('間違ったパスワードで認証に失敗する', async () => {
      const result = await UserModel.authenticate({
        username: 'testuser3',
        password: 'wrongpassword'
      });
      
      expect(result).toBeNull();
    });

    it('存在しないユーザー名で認証に失敗する', async () => {
      const result = await UserModel.authenticate({
        username: 'nonexistent',
        password: 'password123'
      });
      
      expect(result).toBeNull();
    });

    it('バリデーションエラーでエラーが発生する', async () => {
      await expect(UserModel.authenticate({
        username: '',
        password: 'password123'
      })).rejects.toThrow('バリデーションエラー');
    });
  });

  describe('verifyToken', () => {
    it('有効なトークンを検証できる', async () => {
      const authResult = await UserModel.authenticate({
        username: 'testuser3',
        password: 'password123'
      });
      
      expect(authResult).toBeDefined();
      
      const payload = await UserModel.verifyToken(authResult!.token);
      
      expect(payload).toBeDefined();
      expect(payload?.username).toBe('testuser3');
      expect(payload?.userId).toBe(authResult!.user.id);
    });

    it('無効なトークンでnullが返される', async () => {
      const payload = await UserModel.verifyToken('invalid-token');
      expect(payload).toBeNull();
    });
  });

  describe('update', () => {
    it('ユーザー情報を更新できる', async () => {
      const createdUser = await UserModel.create({ ...mockUserData, username: 'testuser4' });
      const updateData = { role: 'admin' as const };
      
      const updatedUser = await UserModel.update(createdUser.id, updateData);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.role).toBe('admin');
      expect(updatedUser?.username).toBe('testuser4'); // 変更されていないフィールド
    });

    it('存在しないユーザーIDでnullが返される', async () => {
      const updatedUser = await UserModel.update(99999, { role: 'admin' });
      expect(updatedUser).toBeNull();
    });
  });

  describe('delete', () => {
    it('ユーザーを削除できる', async () => {
      const createdUser = await UserModel.create({ ...mockUserData, username: 'testuser5' });
      const deleted = await UserModel.delete(createdUser.id);
      
      expect(deleted).toBe(true);
      
      const foundUser = await UserModel.findById(createdUser.id);
      expect(foundUser).toBeNull();
    });

    it('存在しないユーザーIDでfalseが返される', async () => {
      const deleted = await UserModel.delete(99999);
      expect(deleted).toBe(false);
    });
  });

  describe('findAll', () => {
    it('全ユーザーを取得できる', async () => {
      await UserModel.create({ ...mockUserData, username: 'testuser6' });
      await UserModel.create({ ...mockUserData, username: 'testuser7' });
      
      const users = await UserModel.findAll();
      
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBeGreaterThanOrEqual(2);
      
      const testUsers = users.filter((u: any) => u.username.startsWith('testuser'));
      expect(testUsers.length).toBeGreaterThanOrEqual(2);
    });
  });
});