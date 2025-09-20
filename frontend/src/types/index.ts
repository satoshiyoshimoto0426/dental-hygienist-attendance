// 患者情報
export interface Patient {
  id: number;
  patientId: string;
  name: string;
  kana: string;
  birthDate: string;
  age?: number;
  gender: '男性' | '女性';
  address: string;
  phone: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  careLevel?: string; // 要介護度
  // 新規追加フィールド
  dentalClinic?: string; // 歯科クリニック
  dentist?: string; // 歯科医師
  careOffice?: string; // 居宅介護支援事業所
  careManager?: string; // ケアマネージャー
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 歯科衛生士情報
export interface Hygienist {
  id: number;
  staffId: string;
  name: string;
  kana: string;
  licenseNumber: string;
  email: string;
  phone: string;
  hireDate: string;
  specialties?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// サービス種別
export type ServiceType = '口腔ケア' | '口腔リハビリ' | '摂食嚥下指導' | 'その他';

// 訪問記録
export interface VisitRecord {
  id: number;
  visitDate: string;
  patientId: number;
  hygienistId: number;
  startTime: string;
  endTime: string;
  serviceType: ServiceType[];
  vitalSigns?: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    spO2?: number;
  };
  oralCondition: {
    plaqueIndex?: number; // プラーク指数
    gingivaCondition?: string; // 歯肉の状態
    tongueCondition?: string; // 舌の状態
    dentureCondition?: string; // 義歯の状態
  };
  careDetails: string; // 実施内容
  patientCondition: string; // 患者の状態
  familyComments?: string; // 家族からのコメント
  nextVisitPlan?: string; // 次回訪問計画
  status: 'completed' | 'cancelled' | 'scheduled';
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  patient?: Patient;
  hygienist?: Hygienist;
}

// 月間統計
export interface MonthlyStatistics {
  month: string;
  patientId?: number;
  hygienistId?: number;
  totalVisits: number;
  completedVisits: number;
  cancelledVisits: number;
  totalHours: number;
  serviceBreakdown: {
    serviceType: ServiceType;
    count: number;
    hours: number;
  }[];
  visitDetails: VisitRecord[];
}

// ユーザー（ログイン用）
export interface User {
  id: number;
  username: string;
  role: 'admin' | 'hygienist';
  hygienistId?: number;
  email: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// 月間レポート
export interface MonthlyReport {
  reportMonth: string;
  patient: Patient;
  hygienist?: Hygienist;
  summary: {
    totalVisits: number;
    totalHours: number;
    averageVisitDuration: number;
    mainServices: string[];
  };
  visitRecords: VisitRecord[];
  healthTrends: {
    oralHealthImprovement: string;
    concerns: string[];
    recommendations: string[];
  };
  nextMonthPlan: string;
}

// 予約情報
export interface Appointment {
  id: number;
  patientId: number;
  hygienistId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  serviceType: ServiceType[];
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  reminderSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

// 通知
export interface Notification {
  id: number;
  type: 'appointment_reminder' | 'report_ready' | 'system_update' | 'performance_alert';
  title: string;
  message: string;
  recipient: 'admin' | 'hygienist' | 'all';
  recipientId?: number;
  date: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  createdAt: string;
}

// 業績分析
export interface PerformanceMetrics {
  period: string;
  hygienistId?: number;
  metrics: {
    totalVisits: number;
    completionRate: number;
    averageVisitDuration: number;
    patientSatisfactionScore?: number;
    productivityScore: number;
    revenueGenerated?: number;
  };
  trends: {
    visitGrowthRate: number;
    efficiencyImprovement: number;
  };
  goals: {
    targetVisits: number;
    targetRevenue?: number;
    achievementRate: number;
  };
}