import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { Patient } from '../../types/Patient';
import { PatientService } from '../../services/patientService';

interface PatientDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient: Patient | null;
}

const PatientDeleteDialog: React.FC<PatientDeleteDialogProps> = ({
  open,
  onClose,
  onSuccess,
  patient
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!patient) return;

    setLoading(true);
    setError(null);

    try {
      await PatientService.deletePatient(patient.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!patient) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        患者削除の確認
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <DialogContentText>
          以下の患者を削除してもよろしいですか？
        </DialogContentText>
        
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            患者ID
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {patient.patientId}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            患者名
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {patient.name}
          </Typography>
          
          {patient.phone && (
            <>
              <Typography variant="body2" color="text.secondary">
                電話番号
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {patient.phone}
              </Typography>
            </>
          )}
          
          {patient.email && (
            <>
              <Typography variant="body2" color="text.secondary">
                メールアドレス
              </Typography>
              <Typography variant="body1">
                {patient.email}
              </Typography>
            </>
          )}
        </Box>
        
        <DialogContentText sx={{ mt: 2, color: 'error.main' }}>
          ※ この操作は取り消すことができません。関連する訪問記録も削除される可能性があります。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          削除
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientDeleteDialog;