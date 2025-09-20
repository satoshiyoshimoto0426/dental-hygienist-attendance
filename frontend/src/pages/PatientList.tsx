import React, { useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem, FormControl,
  InputLabel, Select, Chip, useTheme, useMediaQuery, Fab, Card,
  CardContent, CardActions, Stack, Avatar, Tooltip, Zoom, Alert,
  Collapse, List, ListItem, ListItemText, ListItemAvatar, Divider
} from '@mui/material';
import {
  Edit, Delete, Add, Visibility, Person, Phone, Home,
  LocalHospital, MedicalServices, Close, Save, Cancel
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Patient } from '../types';
import { useData } from '../contexts/DataContext';

const AnimatedCard = motion(Card);

export default function PatientList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { patients, addPatient, updatePatient, deletePatient } = useData();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Partial<Patient>>({});
  const [viewMode, setViewMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.kana.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSave = async () => {
    if (selectedPatient.id) {
      // 編集
      await updatePatient(selectedPatient as Patient);
    } else {
      // 新規追加
      const newPatient = {
        ...selectedPatient,
        patientId: `P${String(patients.length + 1).padStart(3, '0')}`,
        age: selectedPatient.birthDate ? 
          new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear() : 0,
      } as Omit<Patient, 'id'>;
      await addPatient(newPatient);
    }
    setOpenDialog(false);
    setSelectedPatient({});
  };

  const handleDelete = async (id: number) => {
    await deletePatient(id);
    setDeleteConfirmId(null);
  };

  const gradientBackground = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom sx={{ fontWeight: 700 }}>
            患者管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            登録患者数: {patients.length}名
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: gradientBackground,
            borderRadius: 2,
            px: 3,
            '&:hover': {
              background: gradientBackground,
              transform: 'translateY(-2px)',
            },
          }}
        >
          {isMobile ? '追加' : '新規患者登録'}
        </Button>
      </Stack>

      {/* 検索バー */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="患者名、カナ、患者IDで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      {/* 患者リスト */}
      {isMobile || isTablet ? (
        // モバイル・タブレット表示：カード形式
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={2}>
            {filteredPatients.map((patient) => (
              <Grid item xs={12} sm={6} md={4} key={patient.id}>
                <motion.div variants={itemVariants}>
                  <AnimatedCard
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        height: 6,
                        background: gradientBackground,
                      }}
                    />
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Avatar sx={{ background: gradientBackground }}>
                          {patient.name.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {patient.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {patient.patientId} | {patient.age}歳
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <List dense>
                        <ListItem disablePadding>
                          <ListItemText
                            primary={patient.kana}
                            secondary="フリガナ"
                          />
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemText
                            primary={patient.phone}
                            secondary="電話番号"
                          />
                        </ListItem>
                        {patient.careLevel && (
                          <ListItem disablePadding>
                            <ListItemText
                              primary={patient.careLevel}
                              secondary="要介護度"
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                    
                    <CardActions>
                      <IconButton size="small" onClick={() => handleOpenDialog(patient, true)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog(patient)}>
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => setDeleteConfirmId(patient.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>

                    <Collapse in={deleteConfirmId === patient.id}>
                      <Alert
                        severity="warning"
                        action={
                          <>
                            <Button size="small" onClick={() => handleDelete(patient.id)}>
                              削除
                            </Button>
                            <Button size="small" onClick={() => setDeleteConfirmId(null)}>
                              キャンセル
                            </Button>
                          </>
                        }
                      >
                        本当に削除しますか？
                      </Alert>
                    </Collapse>
                  </AnimatedCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      ) : (
        // デスクトップ表示：テーブル形式
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>患者ID</TableCell>
                  <TableCell>氏名</TableCell>
                  <TableCell>カナ</TableCell>
                  <TableCell>年齢</TableCell>
                  <TableCell>性別</TableCell>
                  <TableCell>電話番号</TableCell>
                  <TableCell>要介護度</TableCell>
                  <TableCell>歯科クリニック</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredPatients.map((patient) => (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'table-row' }}
                    >
                      <TableCell>{patient.patientId}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ width: 32, height: 32, background: gradientBackground }}>
                            {patient.name.charAt(0)}
                          </Avatar>
                          <Typography>{patient.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{patient.kana}</TableCell>
                      <TableCell>{patient.age}歳</TableCell>
                      <TableCell>
                        <Chip 
                          label={patient.gender} 
                          size="small"
                          color={patient.gender === '男性' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{patient.careLevel || '-'}</TableCell>
                      <TableCell>{patient.dentalClinic || '-'}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="詳細表示">
                            <IconButton size="small" onClick={() => handleOpenDialog(patient, true)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="編集">
                            <IconButton size="small" onClick={() => handleOpenDialog(patient)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="削除">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => setDeleteConfirmId(patient.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {filteredPatients.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            患者が登録されていません
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2, background: gradientBackground }}
          >
            最初の患者を登録
          </Button>
        </Box>
      )}

      {/* 患者登録・編集ダイアログ */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {viewMode ? '患者詳細' : selectedPatient.id ? '患者情報編集' : '新規患者登録'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="患者ID"
                value={selectedPatient.patientId || ''}
                disabled
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="氏名"
                value={selectedPatient.name || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, name: e.target.value })}
                disabled={viewMode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="フリガナ"
                value={selectedPatient.kana || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, kana: e.target.value })}
                disabled={viewMode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="生年月日"
                type="date"
                value={selectedPatient.birthDate || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, birthDate: e.target.value })}
                disabled={viewMode}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="電話番号"
                value={selectedPatient.phone || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, phone: e.target.value })}
                disabled={viewMode}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="住所"
                value={selectedPatient.address || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, address: e.target.value })}
                disabled={viewMode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="緊急連絡先"
                value={selectedPatient.emergencyContact || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, emergencyContact: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="緊急連絡先電話"
                value={selectedPatient.emergencyPhone || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, emergencyPhone: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="歯科クリニック"
                value={selectedPatient.dentalClinic || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, dentalClinic: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="歯科医師"
                value={selectedPatient.dentist || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, dentist: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="居宅介護支援事業所"
                value={selectedPatient.careOffice || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, careOffice: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ケアマネージャー"
                value={selectedPatient.careManager || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, careManager: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="既往歴"
                value={selectedPatient.medicalHistory || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, medicalHistory: e.target.value })}
                disabled={viewMode}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="服用薬"
                value={selectedPatient.medications || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, medications: e.target.value })}
                disabled={viewMode}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="アレルギー"
                value={selectedPatient.allergies || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, allergies: e.target.value })}
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="備考"
                value={selectedPatient.notes || ''}
                onChange={(e) => setSelectedPatient({ ...selectedPatient, notes: e.target.value })}
                disabled={viewMode}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
            {viewMode ? '閉じる' : 'キャンセル'}
          </Button>
          {!viewMode && (
            <Button 
              onClick={handleSave} 
              variant="contained"
              startIcon={<Save />}
              sx={{ background: gradientBackground }}
            >
              保存
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* フローティングアクションボタン（モバイル） */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              background: gradientBackground,
            }}
            onClick={() => handleOpenDialog()}
          >
            <Add />
          </Fab>
        </Zoom>
      )}
    </Box>
  );
}