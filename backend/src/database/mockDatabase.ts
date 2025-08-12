// Mock Database for Development without PostgreSQL
export interface MockData {
  patients: any[];
  hygienists: any[];
  visitRecords: any[];
  users: any[];
}

class MockDatabase {
  private data: MockData = {
    patients: [
      { id: 1, patientId: 'P001', name: '田中太郎', phone: '090-1234-5678', email: 'tanaka@example.com' },
      { id: 2, patientId: 'P002', name: '佐藤花子', phone: '090-2345-6789', email: 'sato@example.com' },
      { id: 3, patientId: 'P003', name: '鈴木一郎', phone: '090-3456-7890', email: 'suzuki@example.com' }
    ],
    hygienists: [
      { id: 1, staffId: 'H001', name: '山田美咲', licenseNumber: 'DH12345', phone: '090-4567-8901' },
      { id: 2, staffId: 'H002', name: '高橋健太', licenseNumber: 'DH23456', phone: '090-5678-9012' }
    ],
    visitRecords: [
      { 
        id: 1, 
        patientId: 1, 
        hygienistId: 1, 
        visitDate: '2024-01-15', 
        startTime: '09:00', 
        endTime: '10:00', 
        status: 'completed' 
      },
      { 
        id: 2, 
        patientId: 2, 
        hygienistId: 2, 
        visitDate: '2024-01-15', 
        startTime: '10:30', 
        endTime: '11:30', 
        status: 'completed' 
      }
    ],
    users: [
      { id: 1, username: 'admin', passwordHash: '$2b$12$hash', role: 'admin' },
      { id: 2, username: 'user', passwordHash: '$2b$12$hash', role: 'user' }
    ]
  };

  // Patients
  async getPatients() {
    return this.data.patients;
  }

  async getPatientById(id: number) {
    return this.data.patients.find(p => p.id === id);
  }

  async createPatient(patient: any) {
    const newPatient = { ...patient, id: this.data.patients.length + 1 };
    this.data.patients.push(newPatient);
    return newPatient;
  }

  async updatePatient(id: number, patient: any) {
    const index = this.data.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.patients[index] = { ...this.data.patients[index], ...patient };
      return this.data.patients[index];
    }
    return null;
  }

  async deletePatient(id: number) {
    const index = this.data.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      return this.data.patients.splice(index, 1)[0];
    }
    return null;
  }

  // Hygienists
  async getHygienists() {
    return this.data.hygienists;
  }

  async getHygienistById(id: number) {
    return this.data.hygienists.find(h => h.id === id);
  }

  async createHygienist(hygienist: any) {
    const newHygienist = { ...hygienist, id: this.data.hygienists.length + 1 };
    this.data.hygienists.push(newHygienist);
    return newHygienist;
  }

  async updateHygienist(id: number, hygienist: any) {
    const index = this.data.hygienists.findIndex(h => h.id === id);
    if (index !== -1) {
      this.data.hygienists[index] = { ...this.data.hygienists[index], ...hygienist };
      return this.data.hygienists[index];
    }
    return null;
  }

  async deleteHygienist(id: number) {
    const index = this.data.hygienists.findIndex(h => h.id === id);
    if (index !== -1) {
      return this.data.hygienists.splice(index, 1)[0];
    }
    return null;
  }

  // Visit Records
  async getVisitRecords() {
    return this.data.visitRecords.map(record => ({
      ...record,
      patient: this.data.patients.find(p => p.id === record.patientId),
      hygienist: this.data.hygienists.find(h => h.id === record.hygienistId)
    }));
  }

  async createVisitRecord(record: any) {
    const newRecord = { ...record, id: this.data.visitRecords.length + 1 };
    this.data.visitRecords.push(newRecord);
    return newRecord;
  }

  // Users
  async getUserByUsername(username: string) {
    return this.data.users.find(u => u.username === username);
  }
}

export const mockDb = new MockDatabase();