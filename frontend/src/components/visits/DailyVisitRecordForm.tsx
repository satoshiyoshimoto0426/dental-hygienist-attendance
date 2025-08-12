import React, { useEffect } from 'react';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { format } from 'date-fns';
import {
  DailyVisitRecord,
  CreateDailyVisitRecordInput,
  UpdateDailyVisitRecordInput,
  DailyVisitStatus
} from '../../types/DailyVisitRecord';
import { Patient } from '../../types/Patient';
import { Hygienist } from '../../types/Hygienist';
import { useFormValidation } from '../../hooks/useFormValidation';
import { visitRecordValidationRules } from '../../utils/validationRules';
import { useApiError } from '../../hooks/useApiError';
import { ResponsiveDialog } from '../common/ResponsiveDialog';

interface DailyVisitRecordFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDailyVisitRecordInput | UpdateDailyVisitRecordInput) => Promise<void>;
  record?: DailyVisitRecord;
  selectedDate?: Date;
  patients: Patient[];
  hygienists: Hygienist[];
  loading?: boolean;
}

interface FormData {
  patientId: number;
  hygienistId: number;
  visitDate: string;
  startTime: string;
  endTime: string;
  status: DailyVisitStatus;
  cancellationReason: string;
  notes: string;
}

const initialFormData: FormData = {
  patientId: 0,
  hygienistId: 0,
  visitDate: '',
  startTime: '09:00',
  endTime: '10:00',
  status: 'completed',
  cancellationReason: '',
  notes: ''
};

export const DailyVisitRecordForm: React.FC<DailyVisitRecordFormProps> = ({
  open,
  onClose,
  onSubmit,
  record,
  selectedDate,
  patients,
  hygienists,
  loading = false
}) => {
  const { handleApiError, handleSuccess } = useApiError();

  const {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    resetForm,
    hasErrors
  } = useFormValidation(initialFormData, visitRecordValidationRules);

  // フォームデータの初期化
  useEffect(() => {
    if (open) {
      if (record) {
        // 編集モード
        setValue('patientId', record.patientId);
        setValue('hygienistId', record.hygienistId);
        setValue('visitDate', record.visitDate);
        setValue('startTime', record.startTime || '09:00');
        setValue('endTime', record.endTime || '10:00');
        setValue('status', record.status);
        setValue('cancellationReason', record.cancellationReason || '');
        setValue('notes', record.notes || '');
      } else if (selectedDate) {
        // 新規作成モード（日付選択済み）
        resetForm();
        setValue('visitDate', format(selectedDate, 'yyyy-MM-dd'));
      } else {
        // 新規作成モード
        resetForm();
      }
    }
  }, [record, selectedDate, open, setValue, resetForm]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setValue(field, value);
  };

  const handleInputBlur = (field: keyof FormData) => () => {
    setFieldTouched(field, true);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setValue('visitDate', format(date, 'yyyy-MM-dd'));
    }
    setFieldTouched('visitDate', true);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', time: Date | null) => {
    if (time) {
      setValue(field, format(time, 'HH:mm'));
    }
    setFieldTouched(field, true);
  };

  const handleSubmit = async () => {
    const validation = validateAll();
    if (!validation.isValid) {
      return;
    }

    try {
      const submitData = {
        patientId: values.patientId,
        hygienistId: values.hygienistId,
        visitDate: values.visitDate,
        startTime: values.startTime || undefined,
        endTime: values.endTime || undefined,
        status: values.status,
        cancellationReason: values.cancellationReason || undefined,
        notes: values.notes || undefined
      };

      await onSubmit(submitData);
      handleSuccess(record ? '訪問記録を更新しました' : '訪問記録を登録しました');
      onClose();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const parseTimeString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
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
          sx={{ order: { xs: 2, sm: 1 }, width: { xs: '100%', sm: 'auto' } }}
        >
        キャンセル
      </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || hasErrors}
          sx={{ order: { xs: 1, sm: 2 }, width: { xs: '100%', sm: 'auto' } }}
        >
        {loading ? '保存中...' : '保存'}
      </Button>
    </Stack>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <ResponsiveDialog
        open={open}
        onClose={handleClose}
        title={record ? '日次訪問記録の編集' : '日次訪問記録の追加'}
        actions={actions}
        maxWidth="md"
      >
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={touched.patientId && !!errors.patientId}
              >
                <InputLabel>患者 *</InputLabel>
                <Select
                  value={values.patientId || ''}
                  onChange={(e) => handleInputChange('patientId', Number(e.target.value))}
                  onBlur={handleInputBlur('patientId')}
                  label="患者 *"
                >
                  <MenuItem value="">
                    <em>選択してください</em>
                  </MenuItem>
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.patientId})
                    </MenuItem>
                  ))}
                </Select>
                {touched.patientId && errors.patientId && (
                  <FormHelperText>{errors.patientId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={touched.hygienistId && !!errors.hygienistId}
              >
                <InputLabel>歯科衛生士 *</InputLabel>
                <Select
                  value={values.hygienistId || ''}
                  onChange={(e) => handleInputChange('hygienistId', Number(e.target.value))}
                  onBlur={handleInputBlur('hygienistId')}
                  label="歯科衛生士 *"
                >
                  <MenuItem value="">
                    <em>選択してください</em>
                  </MenuItem>
                  {hygienists.map((hygienist) => (
                    <MenuItem key={hygienist.id} value={hygienist.id}>
                      {hygienist.name} ({hygienist.staffId})
                    </MenuItem>
                  ))}
                </Select>
                {touched.hygienistId && errors.hygienistId && (
                  <FormHelperText>{errors.hygienistId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="訪問日 *"
                value={values.visitDate ? new Date(values.visitDate) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: touched.visitDate && !!errors.visitDate,
                    helperText: touched.visitDate && errors.visitDate
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={touched.status && !!errors.status}
              >
                <InputLabel>ステータス *</InputLabel>
                <Select
                  value={values.status}
                  onChange={(e) => handleInputChange('status', e.target.value as DailyVisitStatus)}
                  onBlur={handleInputBlur('status')}
                  label="ステータス *"
                >
                  <MenuItem value="scheduled">予定</MenuItem>
                  <MenuItem value="completed">完了</MenuItem>
                  <MenuItem value="cancelled">キャンセル</MenuItem>
                </Select>
                {touched.status && errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TimePicker
                label="開始時間"
                value={values.startTime ? parseTimeString(values.startTime) : null}
                onChange={(time) => handleTimeChange('startTime', time)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: touched.startTime && !!errors.startTime,
                    helperText: touched.startTime && errors.startTime
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TimePicker
                label="終了時間"
                value={values.endTime ? parseTimeString(values.endTime) : null}
                onChange={(time) => handleTimeChange('endTime', time)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: touched.endTime && !!errors.endTime,
                    helperText: touched.endTime && errors.endTime
                  }
                }}
              />
            </Grid>

            {values.status === 'cancelled' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="キャンセル理由 *"
                  value={values.cancellationReason}
                  onChange={(e) => handleInputChange('cancellationReason', e.target.value)}
                  onBlur={handleInputBlur('cancellationReason')}
                  multiline
                  rows={2}
                  error={touched.cancellationReason && !!errors.cancellationReason}
                  helperText={touched.cancellationReason && errors.cancellationReason}
                  placeholder="キャンセルの理由を入力してください"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="備考"
                value={values.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                onBlur={handleInputBlur('notes')}
                multiline
                rows={3}
                error={touched.notes && !!errors.notes}
                helperText={touched.notes && errors.notes}
                placeholder="その他の備考があれば入力してください"
              />
            </Grid>
          </Grid>
      </ResponsiveDialog>
    </LocalizationProvider>
  );
};