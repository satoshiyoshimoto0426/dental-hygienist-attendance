import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 単一フィールドのバリデーション
  const validateField = useCallback((name: string, value: any): string => {
    const rule = validationRules[name];
    if (!rule) return '';

    // 必須チェック
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${getFieldDisplayName(name)}は必須項目です`;
    }

    // 値が空の場合、必須以外のバリデーションはスキップ
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return '';
    }

    // 最小長チェック
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return `${getFieldDisplayName(name)}は${rule.minLength}文字以上で入力してください`;
    }

    // 最大長チェック
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return `${getFieldDisplayName(name)}は${rule.maxLength}文字以下で入力してください`;
    }

    // パターンチェック
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${getFieldDisplayName(name)}の形式が正しくありません`;
    }

    // カスタムバリデーション
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) return customError;
    }

    return '';
  }, [validationRules]);

  // 全フィールドのバリデーション
  const validateAll = useCallback((): FormValidationResult => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [values, validateField, validationRules]);

  // 値の更新
  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // リアルタイムバリデーション（フィールドがタッチされている場合のみ）
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // 複数値の一括更新
  const updateValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  // フィールドのタッチ状態を更新
  const setFieldTouched = useCallback((name: string, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
    
    // タッチされた時にバリデーション実行
    if (isTouched) {
      const error = validateField(name, values[name]);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [values, validateField]);

  // フォームのリセット
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // フィールド表示名の取得
  const getFieldDisplayName = (fieldName: string): string => {
    const displayNames: Record<string, string> = {
      name: '名前',
      patientId: '患者ID',
      staffId: 'スタッフID',
      phone: '電話番号',
      email: 'メールアドレス',
      address: '住所',
      licenseNumber: '免許番号',
      visitDate: '訪問日',
      startTime: '開始時間',
      endTime: '終了時間',
      notes: '備考',
      cancellationReason: 'キャンセル理由'
    };
    return displayNames[fieldName] || fieldName;
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setValues: updateValues,
    setFieldTouched,
    validateField,
    validateAll,
    resetForm,
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).some(key => errors[key])
  };
};