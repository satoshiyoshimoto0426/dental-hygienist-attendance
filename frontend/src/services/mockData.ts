import { Patient, Hygienist, VisitRecord, User } from '../types';

// モックデータ
export const mockPatients: Patient[] = [
  {
    id: 1,
    patientId: 'P001',
    name: '田中太郎',
    kana: 'タナカタロウ',
    birthDate: '1945-03-15',
    age: 79,
    gender: '男性',
    address: '東京都世田谷区〇〇1-2-3',
    phone: '090-1234-5678',
    emergencyContact: '田中花子（妻）',
    emergencyPhone: '090-1234-5679',
    careLevel: '要介護3',
    medicalHistory: '脳梗塞、高血圧、糖尿病',
    medications: 'アムロジピン、メトホルミン',
    allergies: 'なし',
    notes: '義歯使用、嚥下機能低下あり',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    patientId: 'P002',
    name: '佐藤花子',
    kana: 'サトウハナコ',
    birthDate: '1940-08-20',
    age: 84,
    gender: '女性',
    address: '東京都世田谷区△△2-3-4',
    phone: '080-2345-6789',
    emergencyContact: '佐藤一郎（息子）',
    emergencyPhone: '080-2345-6780',
    careLevel: '要介護2',
    medicalHistory: '認知症、骨粗鬆症',
    medications: 'ドネペジル、ビスホスホネート',
    allergies: 'ペニシリン',
    notes: '部分義歯、口腔乾燥症',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 3,
    patientId: 'P003',
    name: '鈴木次郎',
    kana: 'スズキジロウ',
    birthDate: '1948-12-10',
    age: 76,
    gender: '男性',
    address: '東京都世田谷区□□3-4-5',
    phone: '090-3456-7890',
    emergencyContact: '鈴木美咲（娘）',
    emergencyPhone: '090-3456-7891',
    careLevel: '要介護4',
    medicalHistory: 'パーキンソン病、誤嚥性肺炎既往',
    medications: 'レボドパ',
    allergies: 'なし',
    notes: '経管栄養併用、口腔ケア重要',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

export const mockHygienists: Hygienist[] = [
  {
    id: 1,
    staffId: 'DH001',
    name: '山田美咲',
    kana: 'ヤマダミサキ',
    licenseNumber: 'DH-123456',
    email: 'yamada@example.com',
    phone: '090-1111-2222',
    hireDate: '2020-04-01',
    specialties: ['口腔ケア', '摂食嚥下'],
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    staffId: 'DH002',
    name: '高橋恵子',
    kana: 'タカハシケイコ',
    licenseNumber: 'DH-234567',
    email: 'takahashi@example.com',
    phone: '090-2222-3333',
    hireDate: '2019-04-01',
    specialties: ['口腔リハビリ', '口腔ケア'],
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 3,
    staffId: 'DH003',
    name: '伊藤さやか',
    kana: 'イトウサヤカ',
    licenseNumber: 'DH-345678',
    email: 'ito@example.com',
    phone: '090-3333-4444',
    hireDate: '2021-04-01',
    specialties: ['口腔ケア'],
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

export const mockVisitRecords: VisitRecord[] = [
  {
    id: 1,
    visitDate: '2024-12-01',
    patientId: 1,
    hygienistId: 1,
    startTime: '10:00',
    endTime: '11:00',
    serviceType: ['口腔ケア', '口腔リハビリ'],
    vitalSigns: {
      bloodPressure: '130/80',
      pulse: 72,
      temperature: 36.5,
      spO2: 98
    },
    oralCondition: {
      plaqueIndex: 2,
      gingivaCondition: '軽度炎症あり',
      tongueCondition: '白苔軽度',
      dentureCondition: '適合良好'
    },
    careDetails: '口腔清掃実施、義歯洗浄、舌清掃、口腔体操指導',
    patientCondition: '体調良好、意欲的に参加',
    familyComments: '最近食事量が増えてきた',
    nextVisitPlan: '継続的な口腔ケアと嚥下訓練',
    status: 'completed',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01'
  },
  {
    id: 2,
    visitDate: '2024-12-02',
    patientId: 2,
    hygienistId: 1,
    startTime: '14:00',
    endTime: '15:00',
    serviceType: ['口腔ケア'],
    oralCondition: {
      plaqueIndex: 3,
      gingivaCondition: '中等度炎症',
      tongueCondition: '乾燥傾向',
      dentureCondition: '調整必要'
    },
    careDetails: '口腔清掃、保湿ケア、義歯調整依頼',
    patientCondition: '認知症による協力困難あり',
    nextVisitPlan: '保湿ケアの強化',
    status: 'completed',
    createdAt: '2024-12-02',
    updatedAt: '2024-12-02'
  },
  {
    id: 3,
    visitDate: '2024-12-03',
    patientId: 3,
    hygienistId: 2,
    startTime: '09:00',
    endTime: '10:00',
    serviceType: ['口腔ケア', '摂食嚥下指導'],
    oralCondition: {
      plaqueIndex: 1,
      gingivaCondition: '良好',
      tongueCondition: '正常',
      dentureCondition: 'なし'
    },
    careDetails: '口腔清掃、嚥下訓練、とろみ剤の使用指導',
    patientCondition: 'パーキンソン症状安定',
    familyComments: 'むせが減ってきた',
    nextVisitPlan: '嚥下機能の継続評価',
    status: 'completed',
    createdAt: '2024-12-03',
    updatedAt: '2024-12-03'
  }
];

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    role: 'admin',
    email: 'admin@example.com',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    username: 'yamada',
    role: 'hygienist',
    hygienistId: 1,
    email: 'yamada@example.com',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 3,
    username: 'takahashi',
    role: 'hygienist',
    hygienistId: 2,
    email: 'takahashi@example.com',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];