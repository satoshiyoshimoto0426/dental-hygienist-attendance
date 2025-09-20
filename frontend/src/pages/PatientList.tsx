import React, { useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem, FormControl,
  InputLabel, Select, Chip
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { Patient } from '../types';
import { mockPatients as initialPatients } from '../services/mockData';

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Partial<Patient>>({});
  const [viewMode, setViewMode] = useState(false);

  const handleOpenDialog = (patient?: Patient, view = false) => {
    setViewMode(view);
    if (patient) {
      setSelectedPatient(patient);
    } else {
      setSelectedPatient({
        gender: '男性',
        careLevel: '要介護1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (selectedPatient.id) {
      // 編集
      setPatients(patients.map(p => 
        p.id === selectedPatient.id ? { ...p, ...selectedPatient } as Patient : p
      ));
    } else {
      // 新規追加
      const newPatient = {
        ...selectedPatient,
        id: Math.max(...patients.map(p => p.id), 0) + 1,
        patientId: `P${String(Math.max(...patients.map(p => p.id), 0) + 1).padStart(3, '0')}`,
        age: selectedPatient.birthDate ? 
          new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear() : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Patient;
      setPatients([...patients, newPatient]);
    }
    setOpenDialog(false);
    setSelectedPatient({});
  };

  const handleDelete = (id: number) => {
    if (window.confirm('この患者情報を削除してもよろしいですか？')) {
      setPatients(patients.filter(p => p.id !== id));
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">患者一覧</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          新規登録
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>患者ID</TableCell>
              <TableCell>氏名</TableCell>
              <TableCell>カナ</TableCell>
              <TableCell>年齢</TableCell>
              <TableCell>性別</TableCell>
              <TableCell>要介護度</TableCell>
              <TableCell>電話番号</TableCell>
              <TableCell>ケアマネージャー</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.patientId}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.kana}</TableCell>
                <TableCell>{patient.age || calculateAge(patient.birthDate)}歳</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>
                  <Chip label={patient.careLevel || '未設定'} size="small" color="primary" />
                </TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{patient.careManager || '-'}</TableCell>
                <TableCell align="center">
                  <IconButton 
                    color="info" 
                    size="small"
                    onClick={() => handleOpenDialog(patient, true)}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    color="primary"
                    size="small"
                    onClick={() => handleOpenDialog(patient, false)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    color="error"
                    size="small"
                    onClick={() => handleDelete(patient.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 患者情報ダイアログ */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {viewMode ? '患者情報詳細' : selectedPatient.id ? '患者情報編集' : '新規患者登録'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* 基本情報 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom color="primary">
                基本情報
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="氏名"
                value={selectedPatient.name || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, name: e.target.value })}
                fullWidth
                required
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="カナ"
                value={selectedPatient.kana || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, kana: e.target.value })}
                fullWidth
                required
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                type="date"
                label="生年月日"
                value={selectedPatient.birthDate || ''}
                onChange={(e) => setSelectedPatient({ 
                  ...selectedPatient, 
                  birthDate: e.target.value,
                  age: calculateAge(e.target.value)
                })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>性別</InputLabel>
                <Select
                  value={selectedPatient.gender || '男性'}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, gender: e.target.value as '男性' | '女性' })}
                  disabled={viewMode}
                >
                  <MenuItem value="男性">男性</MenuItem>
                  <MenuItem value="女性">女性</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>要介護度</InputLabel>
                <Select
                  value={selectedPatient.careLevel || ''}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, careLevel: e.target.value })}
                  disabled={viewMode}
                >
                  <MenuItem value="">なし</MenuItem>
                  <MenuItem value="要支援1">要支援1</MenuItem>
                  <MenuItem value="要支援2">要支援2</MenuItem>
                  <MenuItem value="要介護1">要介護1</MenuItem>
                  <MenuItem value="要介護2">要介護2</MenuItem>
                  <MenuItem value="要介護3">要介護3</MenuItem>
                  <MenuItem value="要介護4">要介護4</MenuItem>
                  <MenuItem value="要介護5">要介護5</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* 連絡先情報 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom color="primary" sx={{ mt: 1 }}>
                連絡先情報
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="住所"
                value={selectedPatient.address || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, address: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="電話番号"
                value={selectedPatient.phone || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, phone: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="緊急連絡先（続柄）"
                value={selectedPatient.emergencyContact || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, emergencyContact: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="緊急連絡先電話番号"
                value={selectedPatient.emergencyPhone || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, emergencyPhone: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>

            {/* 医療・介護情報 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom color="primary" sx={{ mt: 1 }}>
                医療・介護情報
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="歯科クリニック"
                value={selectedPatient.dentalClinic || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, dentalClinic: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="担当歯科医師"
                value={selectedPatient.dentist || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, dentist: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="居宅介護支援事業所"
                value={selectedPatient.careOffice || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, careOffice: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="ケアマネージャー"
                value={selectedPatient.careManager || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, careManager: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="既往歴"
                value={selectedPatient.medicalHistory || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, medicalHistory: e.target.value })}
                fullWidth
                multiline
                rows={2}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="服薬情報"
                value={selectedPatient.medications || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, medications: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="アレルギー"
                value={selectedPatient.allergies || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, allergies: e.target.value })}
                fullWidth
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="備考"
                value={selectedPatient.notes || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, notes: e.target.value })}
                fullWidth
                multiline
                rows={2}
                disabled={viewMode}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {viewMode ? '閉じる' : 'キャンセル'}
          </Button>
          {!viewMode && (
            <Button onClick={handleSave} variant="contained">
              保存
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}