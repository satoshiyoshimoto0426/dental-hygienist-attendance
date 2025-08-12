import React, { useState } from 'react';
import { Box, Typography, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PatientList from './PatientList';
import PatientForm from './PatientForm';
import PatientDeleteDialog from './PatientDeleteDialog';
import { Patient } from '../../types/Patient';
import { useResponsive } from '../../hooks/useResponsive';

const PatientMaster: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isMobile } = useResponsive();

  // 新規登録ダイアログを開く
  const handleAdd = () => {
    setSelectedPatient(null);
    setFormOpen(true);
  };

  // 編集ダイアログを開く
  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormOpen(true);
  };

  // 削除確認ダイアログを開く
  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  // フォームを閉じる
  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedPatient(null);
  };

  // 削除ダイアログを閉じる
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedPatient(null);
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
          患者マスタ管理
        </Typography>
      </Box>
      
      <PatientList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        refreshTrigger={refreshTrigger}
      />

      <PatientForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleSuccess}
        patient={selectedPatient}
      />

      <PatientDeleteDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onSuccess={handleSuccess}
        patient={selectedPatient}
      />

      {/* モバイル用のフローティングアクションボタン */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="患者を追加"
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

export default PatientMaster;