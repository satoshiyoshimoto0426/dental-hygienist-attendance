import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Stack
} from '@mui/material';
import { Hygienist, CreateHygienistRequest } from '../../types/Hygienist';
import { HygienistService } from '../../services/hygienistService';
import { useFormValidation } from '../../hooks/useFormValidation';
import { hygienistValidationRules } from '../../utils/validationRules';
import { useApiError } from '../../hooks/useApiError';
import { ResponsiveDialog } from '../common/ResponsiveDialog';

interface HygienistFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hygienist?: Hygienist | null;
}

interface FormData {
  staffId: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
}

const HygienistForm: React.FC<HygienistFormProps> = ({
  open,
  onClose,
  onSuccess,
  hygienist
}) => {
  const [loading, setLoading] = useState(false);
  const { handleApiError, handleSuccess } = useApiError();

  const isEditMode = !!hygienist;

  const initialValues: FormData = {
    staffId: '',
    name: '',
    licenseNumber: '',
    phone: '',
    email: ''
  };

  const {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    resetForm,
    hasErrors
  } = useFormValidation(initialValues, hygienistValidationRules);

  useEffect(() => {
    if (open) {
      if (hygienist) {
        // 編集モードの場合、既存データを設定
        setValue('staffId', hygienist.staffId);
        setValue('name', hygienist.name);
        setValue('licenseNumber', hygienist.licenseNumber || '');
        setValue('phone', hygienist.phone || '');
        setValue('email', hygienist.email || '');
      } else {
        // 新規登録モードの場合、フォームをリセット
        resetForm();
      }
    }
  }, [open, hygienist, setValue, resetForm]);

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue(field, event.target.value);
  };

  const handleInputBlur = (field: keyof FormData) => () => {
    setFieldTouched(field, true);
  };

  const handleSubmit = async () => {
    const validation = validateAll();
    if (!validation.isValid) {
      return;
    }

    setLoading(true);

    try {
      const requestData: CreateHygienistRequest = {
        staffId: values.staffId.trim(),
        name: values.name.trim(),
        licenseNumber: values.licenseNumber.trim() || undefined,
        phone: values.phone.trim() || undefined,
        email: values.email.trim() || undefined
      };

      if (isEditMode && hygienist) {
        await HygienistService.updateHygienist(hygienist.id, requestData);
        handleSuccess('歯科衛生士情報を更新しました');
      } else {
        await HygienistService.createHygienist(requestData);
        handleSuccess('歯科衛生士を登録しました');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const actions = (
    <Stack 
      direction={{ xs: 'column', sm: 'row' }} 
      spacing={2} 
      sx={{ width: { xs: '100%', sm: 'auto' } }}
    >
      <Button 
        onClick={handleClose} 
        disabled={loading}
        fullWidth={{ xs: true, sm: false }}
        sx={{ order: { xs: 2, sm: 1 } }}
      >
        キャンセル
      </Button>
      <Button
        onClick={handleSubmit}
        variant="contained"
        disabled={loading || hasErrors}
        startIcon={loading ? <CircularProgress size={20} /> : null}
        fullWidth={{ xs: true, sm: false }}
        sx={{ order: { xs: 1, sm: 2 } }}
      >
        {isEditMode ? '更新' : '登録'}
      </Button>
    </Stack>
  );

  return (
    <ResponsiveDialog
      open={open}
      onClose={handleClose}
      title={isEditMode ? '歯科衛生士情報編集' : '歯科衛生士登録'}
      actions={actions}
      maxWidth="sm"
    >
      <Box sx={{ pt: { xs: 0, sm: 1 } }}>
        <TextField
          fullWidth
          label="スタッフID"
          value={values.staffId}
          onChange={handleInputChange('staffId')}
          onBlur={handleInputBlur('staffId')}
          error={touched.staffId && !!errors.staffId}
          helperText={touched.staffId && errors.staffId}
          margin="normal"
          required
          disabled={loading}
          placeholder="例: H001"
          sx={{ mt: { xs: 2, sm: 1 } }}
        />

        <TextField
          fullWidth
          label="歯科衛生士名"
          value={values.name}
          onChange={handleInputChange('name')}
          onBlur={handleInputBlur('name')}
          error={touched.name && !!errors.name}
          helperText={touched.name && errors.name}
          margin="normal"
          required
          disabled={loading}
          placeholder="例: 佐藤 花子"
        />

        <TextField
          fullWidth
          label="免許番号"
          value={values.licenseNumber}
          onChange={handleInputChange('licenseNumber')}
          onBlur={handleInputBlur('licenseNumber')}
          error={touched.licenseNumber && !!errors.licenseNumber}
          helperText={touched.licenseNumber && errors.licenseNumber}
          margin="normal"
          disabled={loading}
          placeholder="例: DH123456"
        />

        <TextField
          fullWidth
          label="電話番号"
          value={values.phone}
          onChange={handleInputChange('phone')}
          onBlur={handleInputBlur('phone')}
          error={touched.phone && !!errors.phone}
          helperText={touched.phone && errors.phone}
          margin="normal"
          disabled={loading}
          placeholder="例: 090-1234-5678"
          inputProps={{ inputMode: 'tel' }}
        />

        <TextField
          fullWidth
          label="メールアドレス"
          type="email"
          value={values.email}
          onChange={handleInputChange('email')}
          onBlur={handleInputBlur('email')}
          error={touched.email && !!errors.email}
          helperText={touched.email && errors.email}
          margin="normal"
          disabled={loading}
          placeholder="例: sato@example.com"
          inputProps={{ inputMode: 'email' }}
        />
      </Box>
    </ResponsiveDialog>
  );
};

export default HygienistForm;