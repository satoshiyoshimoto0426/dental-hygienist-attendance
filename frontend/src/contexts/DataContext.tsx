import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, Hygienist, VisitRecord, Appointment, Notification } from '../types';
import storageService from '../services/storageService';

interface DataContextType {
  // 患者データ
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (patient: Patient) => Promise<void>;
  deletePatient: (id: number) => Promise<void>;
  
  // 歯科衛生士データ
  hygienists: Hygienist[];
  addHygienist: (hygienist: Omit<Hygienist, 'id'>) => Promise<void>;
  updateHygienist: (hygienist: Hygienist) => Promise<void>;
  deleteHygienist: (id: number) => Promise<void>;
  
  // 訪問記録データ
  visitRecords: VisitRecord[];
  addVisitRecord: (record: Omit<VisitRecord, 'id'>) => Promise<void>;
  updateVisitRecord: (record: VisitRecord) => Promise<void>;
  deleteVisitRecord: (id: number) => Promise<void>;
  
  // 予約データ
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  deleteAppointment: (id: number) => Promise<void>;
  
  // 通知データ
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  
  // ローディング状態
  isLoading: boolean;
  
  // データのリフレッシュ
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hygienists, setHygienists] = useState<Hygienist[]>([]);
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初期データ読み込み
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await storageService.init();
      const [patientsData, hygienistsData, visitRecordsData, appointmentsData, notificationsData] = await Promise.all([
        storageService.getAllPatients(),
        storageService.getAllHygienists(),
        storageService.getAllVisitRecords(),
        storageService.getAllAppointments(),
        storageService.getAllNotifications(),
      ]);
      
      setPatients(patientsData);
      setHygienists(hygienistsData);
      setVisitRecords(visitRecordsData);
      setAppointments(appointmentsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 患者データ操作
  const addPatient = async (patient: Omit<Patient, 'id'>) => {
    const newPatient = await storageService.savePatient({
      ...patient,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Patient);
    setPatients([...patients, newPatient]);
    
    // 通知を追加
    await addNotification({
      type: 'system_update',
      title: '新規患者登録',
      message: `${newPatient.name}様が登録されました`,
      recipient: 'admin',
      date: new Date().toISOString(),
      isRead: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  };

  const updatePatient = async (patient: Patient) => {
    const updatedPatient = await storageService.savePatient({
      ...patient,
      updatedAt: new Date().toISOString(),
    });
    setPatients(patients.map(p => p.id === patient.id ? updatedPatient : p));
  };

  const deletePatient = async (id: number) => {
    await storageService.deletePatient(id);
    setPatients(patients.filter(p => p.id !== id));
  };

  // 歯科衛生士データ操作
  const addHygienist = async (hygienist: Omit<Hygienist, 'id'>) => {
    const newHygienist = await storageService.saveHygienist({
      ...hygienist,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Hygienist);
    setHygienists([...hygienists, newHygienist]);
    
    // 通知を追加
    await addNotification({
      type: 'system_update',
      title: '新規スタッフ登録',
      message: `${newHygienist.name}さんが登録されました`,
      recipient: 'admin',
      date: new Date().toISOString(),
      isRead: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  };

  const updateHygienist = async (hygienist: Hygienist) => {
    const updatedHygienist = await storageService.saveHygienist({
      ...hygienist,
      updatedAt: new Date().toISOString(),
    });
    setHygienists(hygienists.map(h => h.id === hygienist.id ? updatedHygienist : h));
  };

  const deleteHygienist = async (id: number) => {
    await storageService.deleteHygienist(id);
    setHygienists(hygienists.filter(h => h.id !== id));
  };

  // 訪問記録データ操作
  const addVisitRecord = async (record: Omit<VisitRecord, 'id'>) => {
    const newRecord = await storageService.saveVisitRecord({
      ...record,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as VisitRecord);
    setVisitRecords([...visitRecords, newRecord]);
  };

  const updateVisitRecord = async (record: VisitRecord) => {
    const updatedRecord = await storageService.saveVisitRecord({
      ...record,
      updatedAt: new Date().toISOString(),
    });
    setVisitRecords(visitRecords.map(r => r.id === record.id ? updatedRecord : r));
  };

  const deleteVisitRecord = async (id: number) => {
    await storageService.deleteVisitRecord(id);
    setVisitRecords(visitRecords.filter(r => r.id !== id));
  };

  // 予約データ操作
  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = await storageService.saveAppointment({
      ...appointment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Appointment);
    setAppointments([...appointments, newAppointment]);
    
    // リマインダー通知を作成
    const patient = patients.find(p => p.id === appointment.patientId);
    const hygienist = hygienists.find(h => h.id === appointment.hygienistId);
    
    await addNotification({
      type: 'appointment_reminder',
      title: '予約リマインダー',
      message: `${appointment.appointmentDate} ${appointment.startTime} - ${patient?.name}様の予約（担当: ${hygienist?.name}）`,
      recipient: 'hygienist',
      recipientId: appointment.hygienistId,
      date: appointment.appointmentDate,
      isRead: false,
      priority: 'high',
      createdAt: new Date().toISOString(),
    });
  };

  const updateAppointment = async (appointment: Appointment) => {
    const updatedAppointment = await storageService.saveAppointment({
      ...appointment,
      updatedAt: new Date().toISOString(),
    });
    setAppointments(appointments.map(a => a.id === appointment.id ? updatedAppointment : a));
  };

  const deleteAppointment = async (id: number) => {
    await storageService.deleteAppointment(id);
    setAppointments(appointments.filter(a => a.id !== id));
  };

  // 通知データ操作
  const addNotification = async (notification: Omit<Notification, 'id'>) => {
    const newNotification = await storageService.saveNotification({
      ...notification,
      id: Date.now(),
    } as Notification);
    setNotifications([...notifications, newNotification]);
  };

  const markNotificationAsRead = async (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      const updatedNotification = await storageService.saveNotification({
        ...notification,
        isRead: true,
      });
      setNotifications(notifications.map(n => n.id === id ? updatedNotification : n));
    }
  };

  const deleteNotification = async (id: number) => {
    await storageService.deleteNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const refreshData = async () => {
    await loadAllData();
  };

  const value: DataContextType = {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    hygienists,
    addHygienist,
    updateHygienist,
    deleteHygienist,
    visitRecords,
    addVisitRecord,
    updateVisitRecord,
    deleteVisitRecord,
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    notifications,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    isLoading,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};