import { HygienistModel } from '../Hygienist';
import { pool } from '../../database/connection';

// モックデータ
const mockHygienistData = {
  staffId: 'HTEST001',
  name: 'テスト歯科衛生士',
  licenseNumber: 'DH-TEST001',
  phone: '080-1234-5678',
  email: 'hygienist@test.com'
};

describe('HygienistModel', () => {
  beforeAll(async () => {
    // テスト用データベースのセットアップ
    await pool.query('DELETE FROM visit_records WHERE hygienist_id IN (SELECT id FROM hygienists WHERE staff_id LIKE $1)', ['HTEST%']);
    await pool.query('DELETE FROM users WHERE hygienist_id IN (SELECT id FROM hygienists WHERE staff_id LIKE $1)', ['HTEST%']);
    await pool.query('DELETE FROM hygienists WHERE staff_id LIKE $1', ['HTEST%']);
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await pool.query('DELETE FROM visit_records WHERE hygienist_id IN (SELECT id FROM hygienists WHERE staff_id LIKE $1)', ['HTEST%']);
    await pool.query('DELETE FROM users WHERE hygienist_id IN (SELECT id FROM hygienists WHERE staff_id LIKE $1)', ['HTEST%']);
    await pool.query('DELETE FROM hygienists WHERE staff_id LIKE $1', ['HTEST%']);
  });

  describe('create', () => {
    it('正常な歯科衛生士データで歯科衛生士を作成できる', async () => {
      const hygienist = await HygienistModel.create(mockHygienistData);
      
      expect(hygienist).toBeDefined();
      expect(hygienist.staffId).toBe(mockHygienistData.staffId);
      expect(hygienist.name).toBe(mockHygienistData.name);
      expect(hygienist.licenseNumber).toBe(mockHygienistData.licenseNumber);
      expect(hygienist.phone).toBe(mockHygienistData.phone);
      expect(hygienist.email).toBe(mockHygienistData.email);
      expect(hygienist.id).toBeGreaterThan(0);
      expect(hygienist.createdAt).toBeInstanceOf(Date);
      expect(hygienist.updatedAt).toBeInstanceOf(Date);
    });

    it('重複するスタッフIDでエラーが発生する', async () => {
      await expect(HygienistModel.create(mockHygienistData)).rejects.toThrow('このスタッフIDは既に使用されています');
    });

    it('必須フィールドが不足している場合エラーが発生する', async () => {
      const invalidData = { ...mockHygienistData, name: '' };
      await expect(HygienistModel.create(invalidData)).rejects.toThrow('バリデーションエラー');
    });

    it('無効なメールアドレスでエラーが発生する', async () => {
      const invalidData = { ...mockHygienistData, staffId: 'HTEST002', email: 'invalid-email' };
      await expect(HygienistModel.create(invalidData)).rejects.toThrow('バリデーションエラー');
    });
  });

  describe('findById', () => {
    it('存在する歯科衛生士IDで歯科衛生士を取得できる', async () => {
      const createdHygienist = await HygienistModel.create({ ...mockHygienistData, staffId: 'HTEST003' });
      const foundHygienist = await HygienistModel.findById(createdHygienist.id);
      
      expect(foundHygienist).toBeDefined();
      expect(foundHygienist?.id).toBe(createdHygienist.id);
      expect(foundHygienist?.staffId).toBe('HTEST003');
    });

    it('存在しない歯科衛生士IDでnullが返される', async () => {
      const foundHygienist = await HygienistModel.findById(99999);
      expect(foundHygienist).toBeNull();
    });
  });

  describe('findByStaffId', () => {
    it('存在するスタッフIDで歯科衛生士を取得できる', async () => {
      const foundHygienist = await HygienistModel.findByStaffId('HTEST003');
      
      expect(foundHygienist).toBeDefined();
      expect(foundHygienist?.staffId).toBe('HTEST003');
    });

    it('存在しないスタッフIDでnullが返される', async () => {
      const foundHygienist = await HygienistModel.findByStaffId('NONEXISTENT');
      expect(foundHygienist).toBeNull();
    });
  });

  describe('update', () => {
    it('歯科衛生士情報を更新できる', async () => {
      const createdHygienist = await HygienistModel.create({ ...mockHygienistData, staffId: 'HTEST004' });
      const updateData = { name: '更新された歯科衛生士名', phone: '080-9999-9999' };
      
      const updatedHygienist = await HygienistModel.update(createdHygienist.id, updateData);
      
      expect(updatedHygienist).toBeDefined();
      expect(updatedHygienist?.name).toBe(updateData.name);
      expect(updatedHygienist?.phone).toBe(updateData.phone);
      expect(updatedHygienist?.email).toBe(mockHygienistData.email); // 変更されていないフィールド
    });

    it('存在しない歯科衛生士IDでnullが返される', async () => {
      const updatedHygienist = await HygienistModel.update(99999, { name: 'テスト' });
      expect(updatedHygienist).toBeNull();
    });
  });

  describe('delete', () => {
    it('歯科衛生士を削除できる', async () => {
      const createdHygienist = await HygienistModel.create({ ...mockHygienistData, staffId: 'HTEST005' });
      const deleted = await HygienistModel.delete(createdHygienist.id);
      
      expect(deleted).toBe(true);
      
      const foundHygienist = await HygienistModel.findById(createdHygienist.id);
      expect(foundHygienist).toBeNull();
    });

    it('存在しない歯科衛生士IDでfalseが返される', async () => {
      const deleted = await HygienistModel.delete(99999);
      expect(deleted).toBe(false);
    });
  });

  describe('findAll', () => {
    it('全歯科衛生士を取得できる', async () => {
      await HygienistModel.create({ ...mockHygienistData, staffId: 'HTEST006' });
      await HygienistModel.create({ ...mockHygienistData, staffId: 'HTEST007' });
      
      const hygienists = await HygienistModel.findAll();
      
      expect(hygienists).toBeInstanceOf(Array);
      expect(hygienists.length).toBeGreaterThanOrEqual(2);
      
      const testHygienists = hygienists.filter(h => h.staffId.startsWith('HTEST'));
      expect(testHygienists.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('searchByName', () => {
    it('歯科衛生士名で検索できる', async () => {
      await HygienistModel.create({ ...mockHygienistData, staffId: 'HTEST008', name: '検索テスト歯科衛生士' });
      
      const hygienists = await HygienistModel.searchByName('検索テスト');
      
      expect(hygienists).toBeInstanceOf(Array);
      expect(hygienists.length).toBeGreaterThanOrEqual(1);
      expect(hygienists[0].name).toContain('検索テスト');
    });

    it('該当しない名前で空配列が返される', async () => {
      const hygienists = await HygienistModel.searchByName('存在しない歯科衛生士名');
      expect(hygienists).toBeInstanceOf(Array);
      expect(hygienists.length).toBe(0);
    });
  });
});