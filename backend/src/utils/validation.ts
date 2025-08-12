import Joi from 'joi';

/**
 * 患者データのバリデーションスキーマ
 */
export const patientValidationSchema = {
  create: Joi.object({
    patientId: Joi.string().required().max(50).messages({
      'string.empty': '患者IDは必須です',
      'string.max': '患者IDは50文字以内で入力してください',
      'any.required': '患者IDは必須です'
    }),
    name: Joi.string().required().max(100).messages({
      'string.empty': '患者名は必須です',
      'string.max': '患者名は100文字以内で入力してください',
      'any.required': '患者名は必須です'
    }),
    phone: Joi.string().optional().max(20).pattern(/^[0-9\-\+\(\)\s]+$/).messages({
      'string.max': '電話番号は20文字以内で入力してください',
      'string.pattern.base': '電話番号の形式が正しくありません'
    }),
    email: Joi.string().optional().email().max(100).messages({
      'string.email': 'メールアドレスの形式が正しくありません',
      'string.max': 'メールアドレスは100文字以内で入力してください'
    }),
    address: Joi.string().optional().max(500).messages({
      'string.max': '住所は500文字以内で入力してください'
    })
  }),
  
  update: Joi.object({
    patientId: Joi.string().optional().max(50).messages({
      'string.max': '患者IDは50文字以内で入力してください'
    }),
    name: Joi.string().optional().max(100).messages({
      'string.max': '患者名は100文字以内で入力してください'
    }),
    phone: Joi.string().optional().max(20).pattern(/^[0-9\-\+\(\)\s]+$/).messages({
      'string.max': '電話番号は20文字以内で入力してください',
      'string.pattern.base': '電話番号の形式が正しくありません'
    }),
    email: Joi.string().optional().email().max(100).messages({
      'string.email': 'メールアドレスの形式が正しくありません',
      'string.max': 'メールアドレスは100文字以内で入力してください'
    }),
    address: Joi.string().optional().max(500).messages({
      'string.max': '住所は500文字以内で入力してください'
    })
  })
};

/**
 * 歯科衛生士データのバリデーションスキーマ
 */
export const hygienistValidationSchema = {
  create: Joi.object({
    staffId: Joi.string().required().max(50).messages({
      'string.empty': 'スタッフIDは必須です',
      'string.max': 'スタッフIDは50文字以内で入力してください',
      'any.required': 'スタッフIDは必須です'
    }),
    name: Joi.string().required().max(100).messages({
      'string.empty': '歯科衛生士名は必須です',
      'string.max': '歯科衛生士名は100文字以内で入力してください',
      'any.required': '歯科衛生士名は必須です'
    }),
    licenseNumber: Joi.string().optional().max(50).messages({
      'string.max': '免許番号は50文字以内で入力してください'
    }),
    phone: Joi.string().optional().max(20).pattern(/^[0-9\-\+\(\)\s]+$/).messages({
      'string.max': '電話番号は20文字以内で入力してください',
      'string.pattern.base': '電話番号の形式が正しくありません'
    }),
    email: Joi.string().optional().email().max(100).messages({
      'string.email': 'メールアドレスの形式が正しくありません',
      'string.max': 'メールアドレスは100文字以内で入力してください'
    })
  }),
  
  update: Joi.object({
    staffId: Joi.string().optional().max(50).messages({
      'string.max': 'スタッフIDは50文字以内で入力してください'
    }),
    name: Joi.string().optional().max(100).messages({
      'string.max': '歯科衛生士名は100文字以内で入力してください'
    }),
    licenseNumber: Joi.string().optional().max(50).messages({
      'string.max': '免許番号は50文字以内で入力してください'
    }),
    phone: Joi.string().optional().max(20).pattern(/^[0-9\-\+\(\)\s]+$/).messages({
      'string.max': '電話番号は20文字以内で入力してください',
      'string.pattern.base': '電話番号の形式が正しくありません'
    }),
    email: Joi.string().optional().email().max(100).messages({
      'string.email': 'メールアドレスの形式が正しくありません',
      'string.max': 'メールアドレスは100文字以内で入力してください'
    })
  })
};

/**
 * 日次訪問記録データのバリデーションスキーマ
 */
export const dailyVisitRecordValidationSchema = {
  create: Joi.object({
    patientId: Joi.number().integer().positive().required().messages({
      'number.base': '患者IDは数値である必要があります',
      'number.integer': '患者IDは整数である必要があります',
      'number.positive': '患者IDは正の数である必要があります',
      'any.required': '患者IDは必須です'
    }),
    hygienistId: Joi.number().integer().positive().required().messages({
      'number.base': '歯科衛生士IDは数値である必要があります',
      'number.integer': '歯科衛生士IDは整数である必要があります',
      'number.positive': '歯科衛生士IDは正の数である必要があります',
      'any.required': '歯科衛生士IDは必須です'
    }),
    visitDate: Joi.date().required().messages({
      'date.base': '訪問日は有効な日付である必要があります',
      'any.required': '訪問日は必須です'
    }),
    startTime: Joi.string().optional().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.pattern.base': '開始時間はHH:MM形式で入力してください'
    }),
    endTime: Joi.string().optional().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.pattern.base': '終了時間はHH:MM形式で入力してください'
    }),
    status: Joi.string().optional().valid('scheduled', 'completed', 'cancelled').messages({
      'any.only': 'ステータスは scheduled, completed, cancelled のいずれかである必要があります'
    }),
    cancellationReason: Joi.string().optional().max(500).messages({
      'string.max': 'キャンセル理由は500文字以内で入力してください'
    }),
    notes: Joi.string().optional().max(1000).messages({
      'string.max': '備考は1000文字以内で入力してください'
    })
  }),
  
  update: Joi.object({
    patientId: Joi.number().integer().positive().optional().messages({
      'number.base': '患者IDは数値である必要があります',
      'number.integer': '患者IDは整数である必要があります',
      'number.positive': '患者IDは正の数である必要があります'
    }),
    hygienistId: Joi.number().integer().positive().optional().messages({
      'number.base': '歯科衛生士IDは数値である必要があります',
      'number.integer': '歯科衛生士IDは整数である必要があります',
      'number.positive': '歯科衛生士IDは正の数である必要があります'
    }),
    visitDate: Joi.date().optional().messages({
      'date.base': '訪問日は有効な日付である必要があります'
    }),
    startTime: Joi.string().optional().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.pattern.base': '開始時間はHH:MM形式で入力してください'
    }),
    endTime: Joi.string().optional().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).messages({
      'string.pattern.base': '終了時間はHH:MM形式で入力してください'
    }),
    status: Joi.string().optional().valid('scheduled', 'completed', 'cancelled').messages({
      'any.only': 'ステータスは scheduled, completed, cancelled のいずれかである必要があります'
    }),
    cancellationReason: Joi.string().optional().max(500).messages({
      'string.max': 'キャンセル理由は500文字以内で入力してください'
    }),
    notes: Joi.string().optional().max(1000).messages({
      'string.max': '備考は1000文字以内で入力してください'
    })
  })
};

/**
 * ユーザーデータのバリデーションスキーマ
 */
export const userValidationSchema = {
  create: Joi.object({
    username: Joi.string().required().min(3).max(50).alphanum().messages({
      'string.empty': 'ユーザー名は必須です',
      'string.min': 'ユーザー名は3文字以上で入力してください',
      'string.max': 'ユーザー名は50文字以内で入力してください',
      'string.alphanum': 'ユーザー名は英数字のみ使用できます',
      'any.required': 'ユーザー名は必須です'
    }),
    password: Joi.string().required().min(6).max(100).messages({
      'string.empty': 'パスワードは必須です',
      'string.min': 'パスワードは6文字以上で入力してください',
      'string.max': 'パスワードは100文字以内で入力してください',
      'any.required': 'パスワードは必須です'
    }),
    role: Joi.string().optional().valid('admin', 'user').messages({
      'any.only': '役割は admin または user である必要があります'
    }),
    hygienistId: Joi.number().integer().positive().optional().messages({
      'number.base': '歯科衛生士IDは数値である必要があります',
      'number.integer': '歯科衛生士IDは整数である必要があります',
      'number.positive': '歯科衛生士IDは正の数である必要があります'
    })
  }),
  
  login: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'ユーザー名は必須です',
      'any.required': 'ユーザー名は必須です'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'パスワードは必須です',
      'any.required': 'パスワードは必須です'
    })
  })
};

/**
 * バリデーションエラーのフォーマット
 */
export const formatValidationError = (error: Joi.ValidationError): string[] => {
  return error.details.map(detail => detail.message);
};

/**
 * 患者データのバリデーション
 */
export const validatePatientData = (data: any, isUpdate = false) => {
  const schema = isUpdate ? patientValidationSchema.update : patientValidationSchema.create;
  return schema.validate(data, { abortEarly: false });
};

/**
 * 歯科衛生士データのバリデーション
 */
export const validateHygienistData = (data: any, isUpdate = false) => {
  const schema = isUpdate ? hygienistValidationSchema.update : hygienistValidationSchema.create;
  return schema.validate(data, { abortEarly: false });
};

/**
 * 日次訪問記録データのバリデーション
 */
export const validateDailyVisitRecordData = (data: any, isUpdate = false) => {
  const schema = isUpdate ? dailyVisitRecordValidationSchema.update : dailyVisitRecordValidationSchema.create;
  return schema.validate(data, { abortEarly: false });
};

/**
 * ユーザーデータのバリデーション
 */
export const validateUserData = (data: any) => {
  return userValidationSchema.create.validate(data, { abortEarly: false });
};

/**
 * 月次報告記録データのバリデーションスキーマ
 */
export const monthlyReportValidationSchema = {
  create: Joi.object({
    patientId: Joi.number().integer().positive().required().messages({
      'number.base': '患者IDは数値である必要があります',
      'number.integer': '患者IDは整数である必要があります',
      'number.positive': '患者IDは正の数である必要があります',
      'any.required': '患者IDは必須です'
    }),
    hygienistId: Joi.number().integer().positive().required().messages({
      'number.base': '歯科衛生士IDは数値である必要があります',
      'number.integer': '歯科衛生士IDは整数である必要があります',
      'number.positive': '歯科衛生士IDは正の数である必要があります',
      'any.required': '歯科衛生士IDは必須です'
    }),
    reportYear: Joi.number().integer().min(2000).max(2100).required().messages({
      'number.base': '報告年は数値である必要があります',
      'number.integer': '報告年は整数である必要があります',
      'number.min': '報告年は2000年以降である必要があります',
      'number.max': '報告年は2100年以前である必要があります',
      'any.required': '報告年は必須です'
    }),
    reportMonth: Joi.number().integer().min(1).max(12).required().messages({
      'number.base': '報告月は数値である必要があります',
      'number.integer': '報告月は整数である必要があります',
      'number.min': '報告月は1以上である必要があります',
      'number.max': '報告月は12以下である必要があります',
      'any.required': '報告月は必須です'
    }),
    summary: Joi.string().optional().max(2000).messages({
      'string.max': '総括は2000文字以内で入力してください'
    }),
    careManagerNotes: Joi.string().optional().max(2000).messages({
      'string.max': 'ケアマネ向けコメントは2000文字以内で入力してください'
    })
  }),
  
  update: Joi.object({
    summary: Joi.string().optional().max(2000).messages({
      'string.max': '総括は2000文字以内で入力してください'
    }),
    careManagerNotes: Joi.string().optional().max(2000).messages({
      'string.max': 'ケアマネ向けコメントは2000文字以内で入力してください'
    }),
    status: Joi.string().optional().valid('draft', 'submitted', 'approved').messages({
      'any.only': 'ステータスは draft, submitted, approved のいずれかである必要があります'
    })
  })
};

/**
 * 月次報告記録データのバリデーション
 */
export const validateMonthlyReportData = (data: any, isUpdate = false) => {
  const schema = isUpdate ? monthlyReportValidationSchema.update : monthlyReportValidationSchema.create;
  return schema.validate(data, { abortEarly: false });
};

/**
 * ログインデータのバリデーション
 */
export const validateLoginInput = (data: any) => {
  return userValidationSchema.login.validate(data, { abortEarly: false });
};