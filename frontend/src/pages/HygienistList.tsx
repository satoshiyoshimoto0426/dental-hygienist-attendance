import React, { useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Grid,
  FormControl, FormControlLabel, Checkbox, FormGroup, Switch
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { Hygienist } from '../types';
import { mockHygienists as initialHygienists } from '../services/mockData';

export default function HygienistList() {
  const [hygienists, setHygienists] = useState<Hygienist[]>(initialHygienists);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHygienist, setSelectedHygienist] = useState<Partial<Hygienist>>({});
  const [viewMode, setViewMode] = useState(false);

  const specialtyOptions = ['口腔ケア', '口腔リハビリ', '摂食嚥下指導', '在宅訪問', '高齢者ケア'];

  const handleOpenDialog = (hygienist?: Hygienist, view = false) => {
    setViewMode(view);
    if (hygienist) {
      setSelectedHygienist(hygienist);
    } else {
      setSelectedHygienist({
        specialties: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (selectedHygienist.id) {
      // 編集
      setHygienists(hygienists.map(h => 
        h.id === selectedHygienist.id ? { ...h, ...selectedHygienist } as Hygienist : h
      ));
    } else {
      // 新規追加
      const newHygienist = {
        ...selectedHygienist,
        id: Math.max(...hygienists.map(h => h.id), 0) + 1,
        staffId: `DH${String(Math.max(...hygienists.map(h => h.id), 0) + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Hygienist;
      setHygienists([...hygienists, newHygienist]);
    }
    setOpenDialog(false);
    setSelectedHygienist({});
  };

  const handleDelete = (id: number) => {
    if (window.confirm('この歯科衛生士情報を削除してもよろしいですか？')) {
      setHygienists(hygienists.filter(h => h.id !== id));
    }
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    const currentSpecialties = selectedHygienist.specialties || [];
    if (checked) {
      setSelectedHygienist({
        ...selectedHygienist,
        specialties: [...currentSpecialties, specialty]
      });
    } else {
      setSelectedHygienist({
        ...selectedHygienist,
        specialties: currentSpecialties.filter(s => s !== specialty)
      });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">歯科衛生士一覧</Typography>
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
              <TableCell>スタッフID</TableCell>
              <TableCell>氏名</TableCell>
              <TableCell>カナ</TableCell>
              <TableCell>免許番号</TableCell>
              <TableCell>専門分野</TableCell>
              <TableCell>メールアドレス</TableCell>
              <TableCell>電話番号</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hygienists.map((hygienist) => (
              <TableRow key={hygienist.id}>
                <TableCell>{hygienist.staffId}</TableCell>
                <TableCell>{hygienist.name}</TableCell>
                <TableCell>{hygienist.kana}</TableCell>
                <TableCell>{hygienist.licenseNumber}</TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {hygienist.specialties?.map((specialty, idx) => (
                      <Chip key={idx} label={specialty} size="small" color="primary" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{hygienist.email}</TableCell>
                <TableCell>{hygienist.phone}</TableCell>
                <TableCell>
                  <Chip
                    label={hygienist.isActive ? '勤務中' : '休職中'}
                    color={hygienist.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    color="info" 
                    size="small"
                    onClick={() => handleOpenDialog(hygienist, true)}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    color="primary"
                    size="small"
                    onClick={() => handleOpenDialog(hygienist, false)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    color="error"
                    size="small"
                    onClick={() => handleDelete(hygienist.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 歯科衛生士情報ダイアログ */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {viewMode ? '歯科衛生士情報詳細' : selectedHygienist.id ? '歯科衛生士情報編集' : '新規歯科衛生士登録'}
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
                value={selectedHygienist.name || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, name: e.target.value })}
                fullWidth
                required
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="カナ"
                value={selectedHygienist.kana || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, kana: e.target.value })}
                fullWidth
                required
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="免許番号"
                value={selectedHygienist.licenseNumber || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, licenseNumber: e.target.value })}
                fullWidth
                required
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="入職日"
                value={selectedHygienist.hireDate || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, hireDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={viewMode}
              />
            </Grid>

            {/* 連絡先情報 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom color="primary" sx={{ mt: 1 }}>
                連絡先情報
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="メールアドレス"
                type="email"
                value={selectedHygienist.email || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, email: e.target.value })}
                fullWidth
                required
                disabled={viewMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="電話番号"
                value={selectedHygienist.phone || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, phone: e.target.value })}
                fullWidth
                required
                disabled={viewMode}
              />
            </Grid>

            {/* 専門分野 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom color="primary" sx={{ mt: 1 }}>
                専門分野
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormGroup row>
                {specialtyOptions.map(specialty => (
                  <FormControlLabel
                    key={specialty}
                    control={
                      <Checkbox
                        checked={selectedHygienist.specialties?.includes(specialty) || false}
                        onChange={(e) => handleSpecialtyChange(specialty, e.target.checked)}
                        disabled={viewMode}
                      />
                    }
                    label={specialty}
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* ステータス */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom color="primary" sx={{ mt: 1 }}>
                ステータス
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedHygienist.isActive || false}
                    onChange={(e) => setSelectedHygienist({ ...selectedHygienist, isActive: e.target.checked })}
                    disabled={viewMode}
                  />
                }
                label={selectedHygienist.isActive ? '勤務中' : '休職中'}
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