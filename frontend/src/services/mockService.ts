// ブラウザ上で動作するモックサービス
import bcrypt from 'bcryptjs';

interface MockData {
  patients: any[];
  hygienists: any[];
  visitRecords: any[];
  dailyVisitRecords: any[];
  users: any[];
  currentUser: any;
}

class MockService {
  private data: MockData;
  private readonly STORAGE_KEY = 'dental-hygienist-mock-data';

  constructor() {
    // LocalStorageから既存データを読み込むか、初期データを作成
    const savedData = localStorage.getItem(this.STORAGE_KEY);
    if (savedData) {
      this.data = JSON.parse(savedData);
    } else {
      this.initializeData();
    }
  }

  private initializeData() {
    this.data = {
      patients: [
        { 
          id: 1, 
          patientId: 'P001', 
          name: '田中太郎', 
          phone: '090-1234-5678', 
          email: 'tanaka@example.com',
          address: '東京都新宿区1-2-3',
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date('2024-01-01').toISOString()
        },
        { 
          id: 2, 
          patientId: 'P002', 
          name: '佐藤花子', 
          phone: '090-2345-6789', 
          email: 'sato@example.com',
          address: '東京都渋谷区4-5-6',
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date('2024-01-01').toISOString()
        },
        { 
          id: 3, 
          patientId: 'P003', 
          name: '鈴木一郎', 
          phone: '090-3456-7890', 
          email: 'suzuki@example.com',
          address: '東京都港区7-8-9',
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date('2024-01-01').toISOString()
        }
      ],
      hygienists: [
        { 
          id: 1, 
          staffId: 'H001', 
          name: '山田美咲', 
          licenseNumber: 'DH12345', 
          phone: '090-4567-8901',
          email: 'yamada@example.com',
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date('2024-01-01').toISOString()
        },
        { 
          id: 2, 
          staffId: 'H002', 
          name: '高橋健太', 
          licenseNumber: 'DH23456', 
          phone: '090-5678-9012',
          email: 'takahashi@example.com',
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date('2024-01-01').toISOString()
        }
      ],
      visitRecords: [
        { 
          id: 1, 
          patientId: 1, 
          hygienistId: 1, 
          visitDate: '2024-01-15', 
          startTime: '09:00', 
          endTime: '10:00', 
          status: 'completed',
          notes: '定期検診完了',
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date('2024-01-15').toISOString()
        },
        { 
          id: 2, 
          patientId: 2, 
          hygienistId: 2, 
          visitDate: '2024-01-15', 
          startTime: '10:30', 
          endTime: '11:30', 
          status: 'completed',
          notes: 'クリーニング実施',
          createdAt: new Date('2024-01-15').toISOString(),
          updatedAt: new Date('2024-01-15').toISOString()
        }
      ],
      dailyVisitRecords: [],
      users: [
        { 
          id: 1, 
          username: 'admin', 
          passwordHash: bcrypt.hashSync('admin', 10), 
          role: 'admin',
          createdAt: new Date('2024-01-01').toISOString(),
          updatedAt: new Date('2024-01-01').toISOString()
        }
      ],
      currentUser: null
    };
    this.saveData();
  }

  private saveData() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  // 認証
  async login(username: string, password: string): Promise<any> {
    const user = this.data.users.find(u => u.username === username);
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      throw new Error('パスワードが間違っています');
    }

    const token = 'mock-token-' + Date.now();
    this.data.currentUser = { ...user, token };
    this.saveData();

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    };
  }

  async logout(): Promise<void> {
    this.data.currentUser = null;
    this.saveData();
  }

  // 患者管理
  async getPatients(): Promise<any[]> {
    return this.data.patients;
  }

  async getPatient(id: number): Promise<any> {
    return this.data.patients.find(p => p.id === id);
  }

  async createPatient(patient: any): Promise<any> {
    const newPatient = {
      ...patient,
      id: Math.max(...this.data.patients.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.patients.push(newPatient);
    this.saveData();
    return newPatient;
  }

  async updatePatient(id: number, patient: any): Promise<any> {
    const index = this.data.patients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('患者が見つかりません');
    
    this.data.patients[index] = {
      ...this.data.patients[index],
      ...patient,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.patients[index];
  }

  async deletePatient(id: number): Promise<void> {
    this.data.patients = this.data.patients.filter(p => p.id !== id);
    this.saveData();
  }

  // 歯科衛生士管理
  async getHygienists(): Promise<any[]> {
    return this.data.hygienists;
  }

  async getHygienist(id: number): Promise<any> {
    return this.data.hygienists.find(h => h.id === id);
  }

  async createHygienist(hygienist: any): Promise<any> {
    const newHygienist = {
      ...hygienist,
      id: Math.max(...this.data.hygienists.map(h => h.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.hygienists.push(newHygienist);
    this.saveData();
    return newHygienist;
  }

  async updateHygienist(id: number, hygienist: any): Promise<any> {
    const index = this.data.hygienists.findIndex(h => h.id === id);
    if (index === -1) throw new Error('歯科衛生士が見つかりません');
    
    this.data.hygienists[index] = {
      ...this.data.hygienists[index],
      ...hygienist,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.hygienists[index];
  }

  async deleteHygienist(id: number): Promise<void> {
    this.data.hygienists = this.data.hygienists.filter(h => h.id !== id);
    this.saveData();
  }

  // 訪問記録管理
  async getVisitRecords(params?: any): Promise<any[]> {
    let records = [...this.data.visitRecords];
    
    if (params?.patientId) {
      records = records.filter(r => r.patientId === params.patientId);
    }
    if (params?.hygienistId) {
      records = records.filter(r => r.hygienistId === params.hygienistId);
    }
    if (params?.date) {
      records = records.filter(r => r.visitDate === params.date);
    }
    
    return records;
  }

  async createVisitRecord(record: any): Promise<any> {
    const newRecord = {
      ...record,
      id: Math.max(...this.data.visitRecords.map(r => r.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.visitRecords.push(newRecord);
    this.saveData();
    return newRecord;
  }

  async updateVisitRecord(id: number, record: any): Promise<any> {
    const index = this.data.visitRecords.findIndex(r => r.id === id);
    if (index === -1) throw new Error('訪問記録が見つかりません');
    
    this.data.visitRecords[index] = {
      ...this.data.visitRecords[index],
      ...record,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    return this.data.visitRecords[index];
  }

  async deleteVisitRecord(id: number): Promise<void> {
    this.data.visitRecords = this.data.visitRecords.filter(r => r.id !== id);
    this.saveData();
  }

  // データリセット
  resetData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeData();
  }
}

// シングルトンインスタンス
export const mockService = new MockService();