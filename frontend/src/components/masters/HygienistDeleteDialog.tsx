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
import { Hygienist } from '../../types/Hygienist';
import { HygienistService } from '../../services/hygienistService';

interface HygienistDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hygienist: Hygienist | null;
}

const HygienistDeleteDialog: React.FC<HygienistDeleteDialogProps> = ({
  open,
  onClose,
  onSuccess,
  hygienist
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!hygienist) return;

    setLoading(true);
    setError(null);

    try {
      await HygienistService.deleteHygienist(hygienist.id);
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

  if (!hygienist) {
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
        歯科衛生士削除の確認
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <DialogContentText>
          以下の歯科衛生士を削除してもよろしいですか？
        </DialogContentText>
        
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            スタッフID
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {hygienist.staffId}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            歯科衛生士名
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {hygienist.name}
          </Typography>
          
          {hygienist.licenseNumber && (
            <>
              <Typography variant="body2" color="text.secondary">
                免許番号
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {hygienist.licenseNumber}
              </Typography>
            </>
          )}
          
          {hygienist.phone && (
            <>
              <Typography variant="body2" color="text.secondary">
                電話番号
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {hygienist.phone}
              </Typography>
            </>
          )}
          
          {hygienist.email && (
            <>
              <Typography variant="body2" color="text.secondary">
                メールアドレス
              </Typography>
              <Typography variant="body1">
                {hygienist.email}
              </Typography>
            </>
          )}
        </Box>
        
        <DialogContentText sx={{ mt: 2, color: 'error.main' }}>
          ※ この操作は取り消すことができません。関連する訪問記録やユーザーアカウントがある場合は削除できません。
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

export default HygienistDeleteDialog;