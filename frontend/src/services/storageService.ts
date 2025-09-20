import { Patient, Hygienist, VisitRecord, Appointment, Notification } from '../types';

// IndexedDBを使用した永続化サービス
class StorageService {
  private dbName = 'DentalHygienistDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // オブジェクトストアの作成
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
          patientStore.createIndex('patientId', 'patientId', { unique: true });
        }

        if (!db.objectStoreNames.contains('hygienists')) {
          const hygienistStore = db.createObjectStore('hygienists', { keyPath: 'id', autoIncrement: true });
          hygienistStore.createIndex('staffId', 'staffId', { unique: true });
        }

        if (!db.objectStoreNames.contains('visitRecords')) {
          const visitStore = db.createObjectStore('visitRecords', { keyPath: 'id', autoIncrement: true });
          visitStore.createIndex('patientId', 'patientId', { unique: false });
          visitStore.createIndex('hygienistId', 'hygienistId', { unique: false });
          visitStore.createIndex('visitDate', 'visitDate', { unique: false });
        }

        if (!db.objectStoreNames.contains('appointments')) {
          const appointmentStore = db.createObjectStore('appointments', { keyPath: 'id', autoIncrement: true });
          appointmentStore.createIndex('patientId', 'patientId', { unique: false });
          appointmentStore.createIndex('hygienistId', 'hygienistId', { unique: false });
          appointmentStore.createIndex('appointmentDate', 'appointmentDate', { unique: false });
        }

        if (!db.objectStoreNames.contains('notifications')) {
          const notificationStore = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
          notificationStore.createIndex('date', 'date', { unique: false });
          notificationStore.createIndex('isRead', 'isRead', { unique: false });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    const transaction = this.db!.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // 患者データ操作
  async getAllPatients(): Promise<Patient[]> {
    const store = await this.getStore('patients');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async savePatient(patient: Patient): Promise<Patient> {
    const store = await this.getStore('patients', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = patient.id 
        ? store.put(patient)
        : store.add({ ...patient, id: Date.now() });
      
      request.onsuccess = async () => {
        const savedPatient = await this.getPatient(request.result as number);
        resolve(savedPatient!);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPatient(id: number): Promise<Patient | null> {
    const store = await this.getStore('patients');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePatient(id: number): Promise<void> {
    const store = await this.getStore('patients', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 歯科衛生士データ操作
  async getAllHygienists(): Promise<Hygienist[]> {
    const store = await this.getStore('hygienists');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveHygienist(hygienist: Hygienist): Promise<Hygienist> {
    const store = await this.getStore('hygienists', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = hygienist.id 
        ? store.put(hygienist)
        : store.add({ ...hygienist, id: Date.now() });
      
      request.onsuccess = async () => {
        const savedHygienist = await this.getHygienist(request.result as number);
        resolve(savedHygienist!);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getHygienist(id: number): Promise<Hygienist | null> {
    const store = await this.getStore('hygienists');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteHygienist(id: number): Promise<void> {
    const store = await this.getStore('hygienists', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 訪問記録データ操作
  async getAllVisitRecords(): Promise<VisitRecord[]> {
    const store = await this.getStore('visitRecords');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveVisitRecord(record: VisitRecord): Promise<VisitRecord> {
    const store = await this.getStore('visitRecords', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = record.id 
        ? store.put(record)
        : store.add({ ...record, id: Date.now() });
      
      request.onsuccess = async () => {
        const savedRecord = await this.getVisitRecord(request.result as number);
        resolve(savedRecord!);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getVisitRecord(id: number): Promise<VisitRecord | null> {
    const store = await this.getStore('visitRecords');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteVisitRecord(id: number): Promise<void> {
    const store = await this.getStore('visitRecords', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 予約データ操作
  async getAllAppointments(): Promise<Appointment[]> {
    const store = await this.getStore('appointments');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveAppointment(appointment: Appointment): Promise<Appointment> {
    const store = await this.getStore('appointments', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = appointment.id 
        ? store.put(appointment)
        : store.add({ ...appointment, id: Date.now() });
      
      request.onsuccess = async () => {
        const savedAppointment = await this.getAppointment(request.result as number);
        resolve(savedAppointment!);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAppointment(id: number): Promise<Appointment | null> {
    const store = await this.getStore('appointments');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAppointment(id: number): Promise<void> {
    const store = await this.getStore('appointments', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 通知データ操作
  async getAllNotifications(): Promise<Notification[]> {
    const store = await this.getStore('notifications');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async saveNotification(notification: Notification): Promise<Notification> {
    const store = await this.getStore('notifications', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = notification.id 
        ? store.put(notification)
        : store.add({ ...notification, id: Date.now() });
      
      request.onsuccess = async () => {
        const savedNotification = await this.getNotification(request.result as number);
        resolve(savedNotification!);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getNotification(id: number): Promise<Notification | null> {
    const store = await this.getStore('notifications');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteNotification(id: number): Promise<void> {
    const store = await this.getStore('notifications', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // データベース全体のクリア
  async clearAllData(): Promise<void> {
    const stores = ['patients', 'hygienists', 'visitRecords', 'appointments', 'notifications'];
    
    for (const storeName of stores) {
      const store = await this.getStore(storeName, 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// シングルトンインスタンス
const storageService = new StorageService();
export default storageService;