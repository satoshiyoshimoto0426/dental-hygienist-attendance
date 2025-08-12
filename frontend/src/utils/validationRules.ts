import { ValidationRules } from '../hooks/useFormValidation';

// 共通のバリデーションパターン
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\-\(\)\+\s]+$/,
  patientId: /^[A-Za-z0-9\-_]+$/,
  staffId: /^[A-Za-z0-9\-_]+$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
};

// 患者登録フォームのバリデーションルール
export const patientValidationRules: ValidationRules = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  patientId: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.patientId,
    custom: (value: string) => {
      if (value && !/^[A-Za-z0-9\-_]+$/.test(value)) {
        return '患者IDは英数字、ハイフン、アンダースコアのみ使用できます';
      }
      return null;
    }
  },
  phone: {
    required: false,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.phone,
    custom: (value: string) => {
      if (value && !VALIDATION_PATTERNS.phone.test(value)) {
        return '電話番号の形式が正しくありません';
      }
      return null;
    }
  },
  email: {
    required: false,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.email,
    custom: (value: string) => {
      if (value && !VALIDATION_PATTERNS.email.test(value)) {
        return 'メールアドレスの形式が正しくありません';
      }
      return null;
    }
  },
  address: {
    required: false,
    maxLength: 500
  }
};

// 歯科衛生士登録フォームのバリデーションルール
export const hygienistValidationRules: ValidationRules = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  staffId: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.staffId,
    custom: (value: string) => {
      if (value && !/^[A-Za-z0-9\-_]+$/.test(value)) {
        return 'スタッフIDは英数字、ハイフン、アンダースコアのみ使用できます';
      }
      return null;
    }
  },
  licenseNumber: {
    required: false,
    maxLength: 50
  },
  phone: {
    required: false,
    maxLength: 20,
    pattern: VALIDATION_PATTERNS.phone,
    custom: (value: string) => {
      if (value && !VALIDATION_PATTERNS.phone.test(value)) {
        return '電話番号の形式が正しくありません';
      }
      return null;
    }
  },
  email: {
    required: false,
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.email,
    custom: (value: string) => {
      if (value && !VALIDATION_PATTERNS.email.test(value)) {
        return 'メールアドレスの形式が正しくありません';
      }
      return null;
    }
  }
};

// 訪問記録入力フォームのバリデーションルール
export const visitRecordValidationRules: ValidationRules = {
  patientId: {
    required: true,
    custom: (value: number) => {
      if (!value || value <= 0) {
        return '患者を選択してください';
      }
      return null;
    }
  },
  hygienistId: {
    required: true,
    custom: (value: number) => {
      if (!value || value <= 0) {
        return '歯科衛生士を選択してください';
      }
      return null;
    }
  },
  visitDate: {
    required: true,
    custom: (value: string) => {
      if (!value) {
        return '訪問日を選択してください';
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return '有効な日付を選択してください';
      }
      return null;
    }
  },
  startTime: {
    required: false,
    pattern: VALIDATION_PATTERNS.time,
    custom: (value: string) => {
      if (value && !VALIDATION_PATTERNS.time.test(value)) {
        return '開始時間の形式が正しくありません（HH:MM）';
      }
      return null;
    }
  },
  endTime: {
    required: false,
    pattern: VALIDATION_PATTERNS.time,
    custom: (value: string, allValues?: any) => {
      if (value && !VALIDATION_PATTERNS.time.test(value)) {
        return '終了時間の形式が正しくありません（HH:MM）';
      }
      
      // 開始時間と終了時間の整合性チェック
      if (value && allValues?.startTime) {
        const startTime = new Date(`2000-01-01T${allValues.startTime}:00`);
        const endTime = new Date(`2000-01-01T${value}:00`);
        
        if (endTime <= startTime) {
          return '終了時間は開始時間より後に設定してください';
        }
      }
      
      return null;
    }
  },
  status: {
    required: true,
    custom: (value: string) => {
      const validStatuses = ['scheduled', 'completed', 'cancelled'];
      if (!validStatuses.includes(value)) {
        return '有効なステータスを選択してください';
      }
      return null;
    }
  },
  cancellationReason: {
    required: false,
    maxLength: 500,
    custom: (value: string, allValues?: any) => {
      // キャンセル時は理由が必須
      if (allValues?.status === 'cancelled' && (!value || value.trim() === '')) {
        return 'キャンセル理由を入力してください';
      }
      return null;
    }
  },
  notes: {
    required: false,
    maxLength: 1000
  }
};

// 日付バリデーション用のヘルパー関数
export const validateDateRange = (startDate: string, endDate: string): string | null => {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return '有効な日付を入力してください';
  }
  
  if (end < start) {
    return '終了日は開始日以降に設定してください';
  }
  
  return null;
};

// 時間バリデーション用のヘルパー関数
export const validateTimeRange = (startTime: string, endTime: string): string | null => {
  if (!startTime || !endTime) return null;
  
  if (!VALIDATION_PATTERNS.time.test(startTime) || !VALIDATION_PATTERNS.time.test(endTime)) {
    return '時間の形式が正しくありません（HH:MM）';
  }
  
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  if (end <= start) {
    return '終了時間は開始時間より後に設定してください';
  }
  
  return null;
};