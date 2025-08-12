import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  IconButton,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Notes as NotesIcon,
  ChangeCircle as StatusIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DailyVisitRecord } from '../../types/DailyVisitRecord';


interface DailyVisitRecordDetailDialogProps {
  open: boolean;
  onClose: () => void;
  record: DailyVisitRecord | null;
    onEdit: (record: DailyVisitRecord) => void;
    onDelete: (record: DailyVisitRecord) => void;
    onOpenStatusManager?: (record: DailyVisitRecord) => void;
    loading?: boolean;
  }

  export const DailyVisitRecordDetailDialog: React.FC<DailyVisitRecordDetailDialogProps> = ({
    open,
    onClose,
    record,
    onEdit,
    onDelete,
    onOpenStatusManager,
    loading = false
  }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (!record) {
    return null;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '完了';
      case 'scheduled': return '予定';
      case 'cancelled': return 'キャンセル';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '未設定';
    return timeString.substring(0, 5); // HH:MM形式に変換
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy年MM月dd日(E)', { locale: ja });
    } catch {
      return dateString;
    }
  };

  const handleEdit = () => {
    onEdit(record);
    onClose();
  };

  const handleDeleteConfirm = () => {
    onDelete(record);
    setDeleteConfirmOpen(false);
    onClose();
  };

  const calculateDuration = () => {
    if (!record.startTime || !record.endTime) return null;
    
    try {
      const start = new Date(`2000-01-01 ${record.startTime}`);
      const end = new Date(`2000-01-01 ${record.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes <= 0) return null;
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (hours > 0) {
        return minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`;
      } else {
        return `${minutes}分`;
      }
    } catch {
      return null;
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              日次訪問記録詳細
            </Typography>
            <Box>
              <IconButton 
                onClick={() => onOpenStatusManager?.(record)} 
                disabled={loading}
                title="ステータス変更"
              >
                <StatusIcon />
              </IconButton>
              <IconButton onClick={handleEdit} disabled={loading} title="編集">
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={() => setDeleteConfirmOpen(true)} 
                disabled={loading}
                color="error"
                title="削除"
              >
                <DeleteIcon />
              </IconButton>
              <IconButton onClick={onClose} title="閉じる">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            {/* 基本情報 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">基本情報</Typography>
                <Chip 
                  label={getStatusLabel(record.status)} 
                  color={getStatusColor(record.status) as any}
                  size="small"
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* 患者情報 */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  患者
                </Typography>
              </Box>
              <Typography variant="body1">
                {record.patient?.name || '不明な患者'}
              </Typography>
              {record.patient?.patientId && (
                <Typography variant="body2" color="text.secondary">
                  患者ID: {record.patient.patientId}
                </Typography>
              )}
            </Grid>

            {/* 歯科衛生士情報 */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <HospitalIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  歯科衛生士
                </Typography>
              </Box>
              <Typography variant="body1">
                {record.hygienist?.name || '不明な歯科衛生士'}
              </Typography>
              {record.hygienist?.staffId && (
                <Typography variant="body2" color="text.secondary">
                  スタッフID: {record.hygienist.staffId}
                </Typography>
              )}
            </Grid>

            {/* 訪問日時 */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TimeIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  訪問日時
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {formatDate(record.visitDate)}
              </Typography>
              
              {(record.startTime || record.endTime) && (
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2">
                    開始: {formatTime(record.startTime)}
                  </Typography>
                  <Typography variant="body2">
                    終了: {formatTime(record.endTime)}
                  </Typography>
                  {calculateDuration() && (
                    <Chip 
                      label={`所要時間: ${calculateDuration()}`} 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>
              )}
            </Grid>

            {/* キャンセル理由 */}
            {record.status === 'cancelled' && record.cancellationReason && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    キャンセル理由
                  </Typography>
                  <Typography variant="body2">
                    {record.cancellationReason}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* 備考 */}
            {record.notes && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <NotesIcon color="primary" />
                  <Typography variant="subtitle2" color="text.secondary">
                    備考
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {record.notes}
                </Typography>
              </Grid>
            )}

            {/* 作成・更新日時 */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  作成日時: {format(new Date(record.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  更新日時: {format(new Date(record.updatedAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            閉じる
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<StatusIcon />}
            onClick={() => onOpenStatusManager?.(record)}
            disabled={loading}
          >
            ステータス変更
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={handleEdit}
            disabled={loading}
          >
            編集
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>
          訪問記録の削除
        </DialogTitle>
        <DialogContent>
          <Typography>
            以下の訪問記録を削除しますか？この操作は取り消せません。
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2">
              患者: {record.patient?.name || '不明な患者'}
            </Typography>
            <Typography variant="body2">
              歯科衛生士: {record.hygienist?.name || '不明な歯科衛生士'}
            </Typography>
            <Typography variant="body2">
              訪問日: {formatDate(record.visitDate)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};