import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { DailyVisitRecord, DailyVisitStatus } from '../../types/DailyVisitRecord';

interface DailyVisitRecordStatusManagerProps {
  open: boolean;
  onClose: () => void;
  record: DailyVisitRecord | null;
  onStatusChange: (recordId: number, status: DailyVisitStatus, cancellationReason?: string) => Promise<void>;
  loading?: boolean;
}

export const DailyVisitRecordStatusManager: React.FC<DailyVisitRecordStatusManagerProps> = ({
  open,
  onClose,
  record,
  onStatusChange,
  loading = false
}) => {
  const [newStatus, setNewStatus] = useState<DailyVisitStatus>('completed');
  const [cancellationReason, setCancellationReason] = useState('');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (record) {
      setNewStatus(record.status);
      setCancellationReason(record.cancellationReason || '');
    }
    setError('');
  }, [record, open]);

  const getStatusLabel = (status: DailyVisitStatus) => {
    switch (status) {
      case 'completed': return '完了';
      case 'scheduled': return '予定';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  const handleSubmit = async () => {
    if (!record) return;

    if (newStatus === 'cancelled' && !cancellationReason.trim()) {
      setError('キャンセル理由を入力してください');
      return;
    }

    try {
      setError('');
      await onStatusChange(
        record.id, 
        newStatus, 
        newStatus === 'cancelled' ? cancellationReason : undefined
      );
      onClose();
    } catch (err) {
      console.error('ステータス変更エラー:', err);
      setError(err instanceof Error ? err.message : 'ステータスの変更に失敗しました');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!record) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        訪問記録ステータス変更
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            対象記録
          </Typography>
          <Typography variant="body1">
            {record.patient?.name} - {record.hygienist?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(record.visitDate).toLocaleDateString('ja-JP')}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            現在のステータス: {getStatusLabel(record.status)}
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>新しいステータス</InputLabel>
          <Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as DailyVisitStatus)}
            label="新しいステータス"
          >
            <MenuItem value="scheduled">予定</MenuItem>
            <MenuItem value="completed">完了</MenuItem>
            <MenuItem value="cancelled">キャンセル</MenuItem>
          </Select>
        </FormControl>

        {newStatus === 'cancelled' && (
          <TextField
            fullWidth
            label="キャンセル理由"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            multiline
            rows={3}
            required
            error={newStatus === 'cancelled' && !cancellationReason.trim()}
            helperText={newStatus === 'cancelled' && !cancellationReason.trim() ? 'キャンセル理由は必須です' : ''}
          />
        )}

        {newStatus === 'completed' && record.status !== 'completed' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            ステータスを「完了」に変更すると、この訪問が正式に記録されます。
          </Alert>
        )}

        {newStatus === 'scheduled' && record.status === 'completed' && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            完了済みの訪問を「予定」に戻すと、完了記録が取り消されます。
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          キャンセル
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || newStatus === record.status}
        >
          {loading ? '変更中...' : 'ステータス変更'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};