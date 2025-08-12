import React, { useState } from 'react';
import { Box, Typography, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import HygienistList from './HygienistList';
import HygienistForm from './HygienistForm';
import HygienistDeleteDialog from './HygienistDeleteDialog';
import { Hygienist } from '../../types/Hygienist';
import { useResponsive } from '../../hooks/useResponsive';

const HygienistMaster: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHygienist, setSelectedHygienist] = useState<Hygienist | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isMobile } = useResponsive();

  // 新規登録ダイアログを開く
  const handleAdd = () => {
    setSelectedHygienist(null);
    setFormOpen(true);
  };

  // 編集ダイアログを開く
  const handleEdit = (hygienist: Hygienist) => {
    setSelectedHygienist(hygienist);
    setFormOpen(true);
  };

  // 削除確認ダイアログを開く
  const handleDelete = (hygienist: Hygienist) => {
    setSelectedHygienist(hygienist);
    setDeleteDialogOpen(true);
  };

  // フォームを閉じる
  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedHygienist(null);
  };

  // 削除ダイアログを閉じる
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedHygienist(null);
  };

  // 操作成功時の処理（一覧を再読み込み）
  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          歯科衛生士マスタ管理
        </Typography>
      </Box>
      
      <HygienistList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        refreshTrigger={refreshTrigger}
      />

      <HygienistForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleSuccess}
        hygienist={selectedHygienist}
      />

      <HygienistDeleteDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleSuccess}
        hygienist={selectedHygienist}
      />

      {/* モバイル用のフローティングアクションボタン */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="歯科衛生士を追加"
          onClick={handleAdd}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default HygienistMaster;