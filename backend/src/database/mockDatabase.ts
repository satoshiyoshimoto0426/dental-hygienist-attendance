import bcrypt from 'bcryptjs';

// Mock Database for Development without PostgreSQL
export interface MockData {
  patients: any[];
  hygienists: any[];
  visitRecords: any[];
  dailyVisitRecords: any[];
  users: any[];
  monthlyReports: any[];
}

class MockDatabase {
  private data: MockData;

  constructor() {
    // Initialize with mock data and hashed passwords
    const adminPasswordHash = bcrypt.hashSync('admin', 10);
    const userPasswordHash = bcrypt.hashSync('user', 10);

    this.data = {
      patients: [
        { 
          id: 1, 
          patient_id: 'P001', 
          name: '田中太郎', 
          phone: '090-1234-5678', 
          email: 'tanaka@example.com',
          address: '東京都新宿区1-2-3',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        },
        { 
          id: 2, 
          patient_id: 'P002', 
          name: '佐藤花子', 
          phone: '090-2345-6789', 
          email: 'sato@example.com',
          address: '東京都渋谷区4-5-6',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        },
        { 
          id: 3, 
          patient_id: 'P003', 
          name: '鈴木一郎', 
          phone: '090-3456-7890', 
          email: 'suzuki@example.com',
          address: '東京都港区7-8-9',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        }
      ],
      hygienists: [
        { 
          id: 1, 
          staff_id: 'H001', 
          name: '山田美咲', 
          license_number: 'DH12345', 
          phone: '090-4567-8901',
          email: 'yamada@example.com',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        },
        { 
          id: 2, 
          staff_id: 'H002', 
          name: '高橋健太', 
          license_number: 'DH23456', 
          phone: '090-5678-9012',
          email: 'takahashi@example.com',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        }
      ],
      visitRecords: [
        { 
          id: 1, 
          patient_id: 1, 
          hygienist_id: 1, 
          visit_date: new Date('2024-01-15'), 
          start_time: '09:00', 
          end_time: '10:00', 
          status: 'completed',
          notes: '定期検診完了',
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        },
        { 
          id: 2, 
          patient_id: 2, 
          hygienist_id: 2, 
          visit_date: new Date('2024-01-15'), 
          start_time: '10:30', 
          end_time: '11:30', 
          status: 'completed',
          notes: 'クリーニング実施',
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        }
      ],
      dailyVisitRecords: [
        {
          id: 1,
          patient_id: 1,
          hygienist_id: 1,
          visit_date: new Date('2024-01-15'),
          start_time: '09:00',
          end_time: '10:00',
          status: 'completed',
          treatment_details: '定期検診とクリーニング',
          notes: '特に問題なし',
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        }
      ],
      users: [
        { 
          id: 1, 
          username: 'admin', 
          password_hash: adminPasswordHash, 
          role: 'admin',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        },
        { 
          id: 2, 
          username: 'user', 
          password_hash: userPasswordHash, 
          role: 'user',
          hygienist_id: 1,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        }
      ],
      monthlyReports: []
    };
  }

  // PostgreSQL Pool互換のインターフェース
  async query(text: string, params?: any[]): Promise<{ rows: any[], rowCount: number }> {
    // SQLクエリを解析して適切なモック処理を実行
    const queryLower = text.toLowerCase();
    
    // SELECT文の処理
    if (queryLower.includes('select')) {
      if (queryLower.includes('from users')) {
        if (queryLower.includes('where username')) {
          const username = params?.[0];
          const user = this.data.users.find(u => u.username === username);
          return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
        }
        if (queryLower.includes('where id')) {
          const id = params?.[0];
          const user = this.data.users.find(u => u.id === id);
          return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
        }
        return { rows: this.data.users, rowCount: this.data.users.length };
      }
      
      if (queryLower.includes('from patients')) {
        if (queryLower.includes('where id')) {
          const id = params?.[0];
          const patient = this.data.patients.find(p => p.id === id);
          return { rows: patient ? [patient] : [], rowCount: patient ? 1 : 0 };
        }
        return { rows: this.data.patients, rowCount: this.data.patients.length };
      }
      
      if (queryLower.includes('from hygienists')) {
        if (queryLower.includes('where id')) {
          const id = params?.[0];
          const hygienist = this.data.hygienists.find(h => h.id === id);
          return { rows: hygienist ? [hygienist] : [], rowCount: hygienist ? 1 : 0 };
        }
        return { rows: this.data.hygienists, rowCount: this.data.hygienists.length };
      }
      
      if (queryLower.includes('from visit_records')) {
        return { rows: this.data.visitRecords, rowCount: this.data.visitRecords.length };
      }
      
      if (queryLower.includes('from daily_visit_records')) {
        return { rows: this.data.dailyVisitRecords, rowCount: this.data.dailyVisitRecords.length };
      }
      
      if (queryLower.includes('from monthly_reports')) {
        return { rows: this.data.monthlyReports, rowCount: this.data.monthlyReports.length };
      }
      
      // NOW()の処理
      if (queryLower.includes('now()')) {
        return { rows: [{ now: new Date() }], rowCount: 1 };
      }
    }
    
    // INSERT文の処理
    if (queryLower.includes('insert into')) {
      if (queryLower.includes('patients')) {
        const newPatient = {
          id: this.data.patients.length + 1,
          patient_id: params?.[0],
          name: params?.[1],
          phone: params?.[2],
          email: params?.[3],
          address: params?.[4],
          created_at: new Date(),
          updated_at: new Date()
        };
        this.data.patients.push(newPatient);
        return { rows: [newPatient], rowCount: 1 };
      }
      
      if (queryLower.includes('hygienists')) {
        const newHygienist = {
          id: this.data.hygienists.length + 1,
          staff_id: params?.[0],
          name: params?.[1],
          license_number: params?.[2],
          phone: params?.[3],
          email: params?.[4],
          created_at: new Date(),
          updated_at: new Date()
        };
        this.data.hygienists.push(newHygienist);
        return { rows: [newHygienist], rowCount: 1 };
      }
      
      if (queryLower.includes('visit_records')) {
        const newRecord = {
          id: this.data.visitRecords.length + 1,
          patient_id: params?.[0],
          hygienist_id: params?.[1],
          visit_date: params?.[2],
          start_time: params?.[3],
          end_time: params?.[4],
          status: params?.[5] || 'scheduled',
          notes: params?.[6],
          created_at: new Date(),
          updated_at: new Date()
        };
        this.data.visitRecords.push(newRecord);
        return { rows: [newRecord], rowCount: 1 };
      }
    }
    
    // UPDATE文の処理
    if (queryLower.includes('update')) {
      if (queryLower.includes('patients')) {
        const id = params?.[params.length - 1];
        const patient = this.data.patients.find(p => p.id === id);
        if (patient) {
          // 簡単な更新処理
          Object.assign(patient, { updated_at: new Date() });
          return { rows: [patient], rowCount: 1 };
        }
      }
      
      if (queryLower.includes('hygienists')) {
        const id = params?.[params.length - 1];
        const hygienist = this.data.hygienists.find(h => h.id === id);
        if (hygienist) {
          Object.assign(hygienist, { updated_at: new Date() });
          return { rows: [hygienist], rowCount: 1 };
        }
      }
    }
    
    // DELETE文の処理
    if (queryLower.includes('delete')) {
      if (queryLower.includes('from patients')) {
        const id = params?.[0];
        const index = this.data.patients.findIndex(p => p.id === id);
        if (index !== -1) {
          this.data.patients.splice(index, 1);
          return { rows: [], rowCount: 1 };
        }
      }
      
      if (queryLower.includes('from hygienists')) {
        const id = params?.[0];
        const index = this.data.hygienists.findIndex(h => h.id === id);
        if (index !== -1) {
          this.data.hygienists.splice(index, 1);
          return { rows: [], rowCount: 1 };
        }
      }
    }
    
    // デフォルトレスポンス
    return { rows: [], rowCount: 0 };
  }
  
  // Pool互換のconnectメソッド
  async connect() {
    return {
      query: this.query.bind(this),
      release: () => {}
    };
  }
  
  // Pool互換のendメソッド
  async end() {
    // モックなので何もしない
  }
}

// シングルトンインスタンス
export const mockDatabase = new MockDatabase();

// 開発環境でモックデータベースを使用
export const pool = process.env.USE_MOCK_DB === 'true' 
  ? mockDatabase 
  : null;