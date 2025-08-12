import { renderHook, act } from '@testing-library/react';
import { useFormValidation, ValidationRules } from '../useFormValidation';

interface TestFormData {
  name: string;
  email: string;
  age: number;
}

const testValidationRules: ValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  age: {
    required: true,
    custom: (value: number) => {
      if (value < 0 || value > 150) {
        return '年齢は0から150の間で入力してください';
      }
      return null;
    }
  }
};

const initialValues: TestFormData = {
  name: '',
  email: '',
  age: 0
};

describe('useFormValidation', () => {
  it('初期値が正しく設定される', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.hasErrors).toBe(false);
  });

  it('値を正しく更新できる', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setValue('name', 'テスト太郎');
    });

    expect(result.current.values.name).toBe('テスト太郎');
  });

  it('複数の値を一括更新できる', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setValues({
        name: 'テスト太郎',
        email: 'test@example.com'
      });
    });

    expect(result.current.values.name).toBe('テスト太郎');
    expect(result.current.values.email).toBe('test@example.com');
  });

  it('必須フィールドのバリデーションが正しく動作する', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.validateAll();
    });

    expect(result.current.errors.name).toBe('名前は必須項目です');
    expect(result.current.errors.email).toBe('メールアドレスは必須項目です');
    expect(result.current.errors.age).toBe('年齢は必須項目です');
    expect(result.current.isValid).toBe(false);
    expect(result.current.hasErrors).toBe(true);
  });

  it('最小長バリデーションが正しく動作する', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setValue('name', 'a');
      result.current.validateAll();
    });

    expect(result.current.errors.name).toBe('名前は2文字以上で入力してください');
  });

  it('最大長バリデーションが正しく動作する', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setValue('name', 'a'.repeat(51));
      result.current.validateAll();
    });

    expect(result.current.errors.name).toBe('名前は50文字以下で入力してください');
  });

  it('パターンバリデーションが正しく動作する', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setValue('email', 'invalid-email');
      result.current.validateAll();
    });

    expect(result.current.errors.email).toBe('メールアドレスの形式が正しくありません');
  });

  it('カスタムバリデーションが正しく動作する', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setValue('age', 200);
      result.current.validateAll();
    });

    expect(result.current.errors.age).toBe('年齢は0から150の間で入力してください');
  });

  it('有効な値でバリデーションが成功する', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setValue('name', 'テスト太郎');
      result.current.setValue('email', 'test@example.com');
      result.current.setValue('age', 25);
      const validation = result.current.validateAll();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.hasErrors).toBe(false);
  });

  it('フィールドタッチ状態が正しく管理される', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setFieldTouched('name', true);
    });

    expect(result.current.touched.name).toBe(true);
  });

  it('タッチされたフィールドでリアルタイムバリデーションが動作する', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setFieldTouched('name', true);
    });

    act(() => {
      result.current.setValue('name', 'a');
    });

    expect(result.current.errors.name).toBe('名前は2文字以上で入力してください');
  });

  it('フォームリセットが正しく動作する', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      result.current.setValue('name', 'テスト太郎');
      result.current.setFieldTouched('name', true);
      result.current.validateAll();
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('単一フィールドバリデーションが正しく動作する', () => {
    const { result } = renderHook(() => 
      useFormValidation(initialValues, testValidationRules)
    );

    act(() => {
      const error = result.current.validateField('name', '');
      expect(error).toBe('名前は必須項目です');
    });

    act(() => {
      const error = result.current.validateField('name', 'テスト太郎');
      expect(error).toBe('');
    });
  });
});