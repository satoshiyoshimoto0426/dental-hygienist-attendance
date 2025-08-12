import {
  VALIDATION_PATTERNS,
  patientValidationRules,
  hygienistValidationRules,
  visitRecordValidationRules,
  validateDateRange,
  validateTimeRange
} from '../validationRules';

describe('VALIDATION_PATTERNS', () => {
  describe('email pattern', () => {
    it('有効なメールアドレスにマッチする', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.jp',
        'test123@test-domain.org'
      ];

      validEmails.forEach(email => {
        expect(VALIDATION_PATTERNS.email.test(email)).toBe(true);
      });
    });

    it('無効なメールアドレスにマッチしない', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'test@',
        'test.domain.com'
      ];

      invalidEmails.forEach(email => {
        expect(VALIDATION_PATTERNS.email.test(email)).toBe(false);
      });
    });
  });

  describe('phone pattern', () => {
    it('有効な電話番号にマッチする', () => {
      const validPhones = [
        '03-1234-5678',
        '090-1234-5678',
        '(03) 1234-5678',
        '+81-3-1234-5678',
        '0312345678'
      ];

      validPhones.forEach(phone => {
        expect(VALIDATION_PATTERNS.phone.test(phone)).toBe(true);
      });
    });

    it('無効な電話番号にマッチしない', () => {
      const invalidPhones = [
        'abc-defg-hijk',
        '123-abc-5678'
      ];

      invalidPhones.forEach(phone => {
        expect(VALIDATION_PATTERNS.phone.test(phone)).toBe(false);
      });
    });
  });

  describe('patientId pattern', () => {
    it('有効な患者IDにマッチする', () => {
      const validIds = [
        'P001',
        'PATIENT_123',
        'p-001',
        'P_001'
      ];

      validIds.forEach(id => {
        expect(VALIDATION_PATTERNS.patientId.test(id)).toBe(true);
      });
    });

    it('無効な患者IDにマッチしない', () => {
      const invalidIds = [
        'P 001',
        'P@001',
        'P#001'
      ];

      invalidIds.forEach(id => {
        expect(VALIDATION_PATTERNS.patientId.test(id)).toBe(false);
      });
    });
  });

  describe('time pattern', () => {
    it('有効な時間形式にマッチする', () => {
      const validTimes = [
        '09:00',
        '23:59',
        '00:00',
        '12:30'
      ];

      validTimes.forEach(time => {
        expect(VALIDATION_PATTERNS.time.test(time)).toBe(true);
      });
    });

    it('無効な時間形式にマッチしない', () => {
      const invalidTimes = [
        '9:00',
        '24:00',
        '12:60',
        '12:5',
        'abc:def'
      ];

      invalidTimes.forEach(time => {
        expect(VALIDATION_PATTERNS.time.test(time)).toBe(false);
      });
    });
  });
});

describe('patientValidationRules', () => {
  it('患者名の必須チェックが正しく動作する', () => {
    expect(patientValidationRules.name.required).toBe(true);
    expect(patientValidationRules.name.minLength).toBe(1);
    expect(patientValidationRules.name.maxLength).toBe(100);
  });

  it('患者IDの必須チェックが正しく動作する', () => {
    expect(patientValidationRules.patientId.required).toBe(true);
    expect(patientValidationRules.patientId.minLength).toBe(1);
    expect(patientValidationRules.patientId.maxLength).toBe(50);
  });

  it('患者IDのカスタムバリデーションが正しく動作する', () => {
    const customValidator = patientValidationRules.patientId.custom!;
    
    expect(customValidator('P001')).toBeNull();
    expect(customValidator('P@001')).toBe('患者IDは英数字、ハイフン、アンダースコアのみ使用できます');
  });

  it('メールアドレスのカスタムバリデーションが正しく動作する', () => {
    const customValidator = patientValidationRules.email.custom!;
    
    expect(customValidator('test@example.com')).toBeNull();
    expect(customValidator('invalid-email')).toBe('メールアドレスの形式が正しくありません');
  });
});

describe('hygienistValidationRules', () => {
  it('歯科衛生士名の必須チェックが正しく動作する', () => {
    expect(hygienistValidationRules.name.required).toBe(true);
    expect(hygienistValidationRules.name.minLength).toBe(1);
    expect(hygienistValidationRules.name.maxLength).toBe(100);
  });

  it('スタッフIDの必須チェックが正しく動作する', () => {
    expect(hygienistValidationRules.staffId.required).toBe(true);
    expect(hygienistValidationRules.staffId.minLength).toBe(1);
    expect(hygienistValidationRules.staffId.maxLength).toBe(50);
  });

  it('スタッフIDのカスタムバリデーションが正しく動作する', () => {
    const customValidator = hygienistValidationRules.staffId.custom!;
    
    expect(customValidator('H001')).toBeNull();
    expect(customValidator('H@001')).toBe('スタッフIDは英数字、ハイフン、アンダースコアのみ使用できます');
  });
});

describe('visitRecordValidationRules', () => {
  it('患者IDの必須チェックが正しく動作する', () => {
    expect(visitRecordValidationRules.patientId.required).toBe(true);
    
    const customValidator = visitRecordValidationRules.patientId.custom!;
    expect(customValidator(0)).toBe('患者を選択してください');
    expect(customValidator(1)).toBeNull();
  });

  it('歯科衛生士IDの必須チェックが正しく動作する', () => {
    expect(visitRecordValidationRules.hygienistId.required).toBe(true);
    
    const customValidator = visitRecordValidationRules.hygienistId.custom!;
    expect(customValidator(0)).toBe('歯科衛生士を選択してください');
    expect(customValidator(1)).toBeNull();
  });

  it('訪問日の必須チェックが正しく動作する', () => {
    expect(visitRecordValidationRules.visitDate.required).toBe(true);
    
    const customValidator = visitRecordValidationRules.visitDate.custom!;
    expect(customValidator('')).toBe('訪問日を選択してください');
    expect(customValidator('invalid-date')).toBe('有効な日付を選択してください');
    expect(customValidator('2024-01-01')).toBeNull();
  });

  it('開始時間のバリデーションが正しく動作する', () => {
    const customValidator = visitRecordValidationRules.startTime.custom!;
    
    expect(customValidator('09:00')).toBeNull();
    expect(customValidator('25:00')).toBe('開始時間の形式が正しくありません（HH:MM）');
  });

  it('終了時間のバリデーションが正しく動作する', () => {
    const customValidator = visitRecordValidationRules.endTime.custom!;
    
    expect(customValidator('10:00')).toBeNull();
    expect(customValidator('25:00')).toBe('終了時間の形式が正しくありません（HH:MM）');
    
    // 開始時間より前の終了時間
    expect(customValidator('08:00', { startTime: '09:00' })).toBe('終了時間は開始時間より後に設定してください');
    expect(customValidator('10:00', { startTime: '09:00' })).toBeNull();
  });

  it('ステータスのバリデーションが正しく動作する', () => {
    const customValidator = visitRecordValidationRules.status.custom!;
    
    expect(customValidator('scheduled')).toBeNull();
    expect(customValidator('completed')).toBeNull();
    expect(customValidator('cancelled')).toBeNull();
    expect(customValidator('invalid')).toBe('有効なステータスを選択してください');
  });

  it('キャンセル理由のバリデーションが正しく動作する', () => {
    const customValidator = visitRecordValidationRules.cancellationReason.custom!;
    
    expect(customValidator('理由', { status: 'completed' })).toBeNull();
    expect(customValidator('', { status: 'cancelled' })).toBe('キャンセル理由を入力してください');
    expect(customValidator('理由', { status: 'cancelled' })).toBeNull();
  });
});

describe('validateDateRange', () => {
  it('有効な日付範囲でnullを返す', () => {
    expect(validateDateRange('2024-01-01', '2024-01-31')).toBeNull();
    expect(validateDateRange('2024-01-01', '2024-01-01')).toBeNull();
  });

  it('無効な日付範囲でエラーメッセージを返す', () => {
    expect(validateDateRange('2024-01-31', '2024-01-01')).toBe('終了日は開始日以降に設定してください');
  });

  it('無効な日付形式でエラーメッセージを返す', () => {
    expect(validateDateRange('invalid', '2024-01-01')).toBe('有効な日付を入力してください');
    expect(validateDateRange('2024-01-01', 'invalid')).toBe('有効な日付を入力してください');
  });

  it('空の値でnullを返す', () => {
    expect(validateDateRange('', '2024-01-01')).toBeNull();
    expect(validateDateRange('2024-01-01', '')).toBeNull();
  });
});

describe('validateTimeRange', () => {
  it('有効な時間範囲でnullを返す', () => {
    expect(validateTimeRange('09:00', '10:00')).toBeNull();
    expect(validateTimeRange('09:00', '09:01')).toBeNull();
  });

  it('無効な時間範囲でエラーメッセージを返す', () => {
    expect(validateTimeRange('10:00', '09:00')).toBe('終了時間は開始時間より後に設定してください');
    expect(validateTimeRange('09:00', '09:00')).toBe('終了時間は開始時間より後に設定してください');
  });

  it('無効な時間形式でエラーメッセージを返す', () => {
    expect(validateTimeRange('invalid', '10:00')).toBe('時間の形式が正しくありません（HH:MM）');
    expect(validateTimeRange('09:00', 'invalid')).toBe('時間の形式が正しくありません（HH:MM）');
  });

  it('空の値でnullを返す', () => {
    expect(validateTimeRange('', '10:00')).toBeNull();
    expect(validateTimeRange('09:00', '')).toBeNull();
  });
});