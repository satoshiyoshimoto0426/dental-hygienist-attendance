import { PatientModel } from '../Patient';
import { pool } from '../../database/connection';

// モックデータ
const mockPatientData = {
  patientId: 'TEST001',
  name: 'テスト患者',
  phone: '090-1234-5678',
  email: 'test@example.com',
  address: 'テスト住所'
};

describe('PatientModel', () => {
  beforeAll(async () => {
    // テスト用データベースのセットアップ
    await pool.query('DELETE FROM visit_records WHERE patient_id IN (SELECT id FROM patients WHERE patient_id LIKE $1)', ['TEST%']);
    await pool.query('DELETE FROM patients WHERE patient_id LIKE $1', ['TEST%']);
  });

  afterAll(async () => {
    // テストデータのクリーンアップ
    await pool.query('DELETE FROM visit_records WHERE patient_id IN (SELECT id FROM patients WHERE patient_id LIKE $1)', ['TEST%']);
    await pool.query('DELETE FROM patients WHERE patient_id LIKE $1', ['TEST%']);
  });

  describe('create', () => {
    it('正常な患者データで患者を作成できる', async () => {
      const patient = await PatientModel.create(mockPatientData);
      
      expect(patient).toBeDefined();
      expect(patient.patientId).toBe(mockPatientData.patientId);
      expect(patient.name).toBe(mockPatientData.name);
      expect(patient.phone).toBe(mockPatientData.phone);
      expect(patient.email).toBe(mockPatientData.email);
      expect(patient.address).toBe(mockPatientData.address);
      expect(patient.id).toBeGreaterThan(0);
      expect(patient.createdAt).toBeInstanceOf(Date);
      expect(patient.updatedAt).toBeInstanceOf(Date);
    });

    it('重複する患者IDでエラーが発生する', async () => {
      await expect(PatientModel.create(mockPatientData)).rejects.toThrow('この患者IDは既に使用されています');
    });

    it('必須フィールドが不足している場合エラーが発生する', async () => {
      const invalidData = { ...mockPatientData, name: '' };
      await expect(PatientModel.create(invalidData)).rejects.toThrow('バリデーションエラー');
    });

    it('無効なメールアドレスでエラーが発生する', async () => {
      const invalidData = { ...mockPatientData, patientId: 'TEST002', email: 'invalid-email' };
      await expect(PatientModel.create(invalidData)).rejects.toThrow('バリデーションエラー');
    });
  });

  describe('findById', () => {
    it('存在する患者IDで患者を取得できる', async () => {
      const createdPatient = await PatientModel.create({ ...mockPatientData, patientId: 'TEST003' });
      const foundPatient = await PatientModel.findById(createdPatient.id);
      
      expect(foundPatient).toBeDefined();
      expect(foundPatient?.id).toBe(createdPatient.id);
      expect(foundPatient?.patientId).toBe('TEST003');
    });

    it('存在しない患者IDでnullが返される', async () => {
      const foundPatient = await PatientModel.findById(99999);
      expect(foundPatient).toBeNull();
    });
  });

  describe('findByPatientId', () => {
    it('存在する患者IDで患者を取得できる', async () => {
      const foundPatient = await PatientModel.findByPatientId('TEST003');
      
      expect(foundPatient).toBeDefined();
      expect(foundPatient?.patientId).toBe('TEST003');
    });

    it('存在しない患者IDでnullが返される', async () => {
      const foundPatient = await PatientModel.findByPatientId('NONEXISTENT');
      expect(foundPatient).toBeNull();
    });
  });

  describe('update', () => {
    it('患者情報を更新できる', async () => {
      const createdPatient = await PatientModel.create({ ...mockPatientData, patientId: 'TEST004' });
      const updateData = { name: '更新された患者名', phone: '090-9999-9999' };
      
      const updatedPatient = await PatientModel.update(createdPatient.id, updateData);
      
      expect(updatedPatient).toBeDefined();
      expect(updatedPatient?.name).toBe(updateData.name);
      expect(updatedPatient?.phone).toBe(updateData.phone);
      expect(updatedPatient?.email).toBe(mockPatientData.email); // 変更されていないフィールド
    });

    it('存在しない患者IDでnullが返される', async () => {
      const updatedPatient = await PatientModel.update(99999, { name: 'テスト' });
      expect(updatedPatient).toBeNull();
    });
  });

  describe('delete', () => {
    it('患者を削除できる', async () => {
      const createdPatient = await PatientModel.create({ ...mockPatientData, patientId: 'TEST005' });
      const deleted = await PatientModel.delete(createdPatient.id);
      
      expect(deleted).toBe(true);
      
      const foundPatient = await PatientModel.findById(createdPatient.id);
      expect(foundPatient).toBeNull();
    });

    it('存在しない患者IDでfalseが返される', async () => {
      const deleted = await PatientModel.delete(99999);
      expect(deleted).toBe(false);
    });
  });

  describe('findAll', () => {
    it('全患者を取得できる', async () => {
      await PatientModel.create({ ...mockPatientData, patientId: 'TEST006' });
      await PatientModel.create({ ...mockPatientData, patientId: 'TEST007' });
      
      const patients = await PatientModel.findAll();
      
      expect(patients).toBeInstanceOf(Array);
      expect(patients.length).toBeGreaterThanOrEqual(2);
      
      const testPatients = patients.filter(p => p.patientId.startsWith('TEST'));
      expect(testPatients.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('searchByName', () => {
    it('患者名で検索できる', async () => {
      await PatientModel.create({ ...mockPatientData, patientId: 'TEST008', name: '検索テスト患者' });
      
      const patients = await PatientModel.searchByName('検索テスト');
      
      expect(patients).toBeInstanceOf(Array);
      expect(patients.length).toBeGreaterThanOrEqual(1);
      expect(patients[0].name).toContain('検索テスト');
    });

    it('該当しない名前で空配列が返される', async () => {
      const patients = await PatientModel.searchByName('存在しない患者名');
      expect(patients).toBeInstanceOf(Array);
      expect(patients.length).toBe(0);
    });
  });
});