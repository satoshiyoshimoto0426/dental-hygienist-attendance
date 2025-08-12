import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Stack
} from '@mui/material';
import { Patient, CreatePatientRequest } from '../../types/Patient';
import { PatientService } from '../../services/patientService';
import { useFormValidation } from '../../hooks/useFormValidation';
import { patientValidationRules } from '../../utils/validationRules';
import { useApiError } from '../../hooks/useApiError';
import { ResponsiveDialog } from '../common/ResponsiveDialog';

interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: Patient | null;
}

interface FormData {
  patientId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

const PatientForm: React.FC<PatientFormProps> = ({
  open,
  onClose,
  onSuccess,
  patient
}) => {
  const [loading, setLoading] = useState(false);
  const { handleApiError, handleSuccess } = useApiError();

  const isEditMode = !!patient;

  const initialValues: FormData = {
    patientId: '',
    name: '',
    phone: '',
    email: '',
    address: ''
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
  } = useFormValidation(initialValues, patientValidationRules);

  useEffect(() => {
    if (open) {
      if (patient) {
        // 編集モードの場合、既存データを設定
        setValue('patientId', patient.patientId);
        setValue('name', patient.name);
        setValue('phone', patient.phone || '');
        setValue('email', patient.email || '');
        setValue('address', patient.address || '');
      } else {
        // 新規登録モードの場合、フォームをリセット
        resetForm();
      }
    }
  }, [open, patient, setValue, resetForm]);

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
      const requestData: CreatePatientRequest = {
        patientId: values.patientId.trim(),
        name: values.name.trim(),
        phone: values.phone.trim() || undefined,
        email: values.email.trim() || undefined,
        address: values.address.trim() || undefined
      };

      if (isEditMode && patient) {
        await PatientService.updatePatient(patient.id, requestData);
        handleSuccess('患者情報を更新しました');
      } else {
        await PatientService.createPatient(requestData);
        handleSuccess('患者を登録しました');
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
      title={isEditMode ? '患者情報編集' : '患者登録'}
      actions={actions}
      maxWidth="sm"
    >
      <Box sx={{ pt: { xs: 0, sm: 1 } }}>
        <TextField
          fullWidth
          label="患者ID"
          value={values.patientId}
          onChange={handleInputChange('patientId')}
          onBlur={handleInputBlur('patientId')}
          error={touched.patientId && !!errors.patientId}
          helperText={touched.patientId && errors.patientId}
          margin="normal"
          required
          disabled={loading}
          placeholder="例: P001"
          sx={{ mt: { xs: 2, sm: 1 } }}
        />

        <TextField
          fullWidth
          label="患者名"
          value={values.name}
          onChange={handleInputChange('name')}
          onBlur={handleInputBlur('name')}
          error={touched.name && !!errors.name}
          helperText={touched.name && errors.name}
          margin="normal"
          required
          disabled={loading}
          placeholder="例: 田中 太郎"
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
          placeholder="例: 03-1234-5678"
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
          placeholder="例: tanaka@example.com"
          inputProps={{ inputMode: 'email' }}
        />

        <TextField
          fullWidth
          label="住所"
          value={values.address}
          onChange={handleInputChange('address')}
          onBlur={handleInputBlur('address')}
          error={touched.address && !!errors.address}
          helperText={touched.address && errors.address}
          margin="normal"
          multiline
          rows={3}
          disabled={loading}
          placeholder="例: 東京都渋谷区..."
        />
      </Box>
    </ResponsiveDialog>
  );
};

export default PatientForm;