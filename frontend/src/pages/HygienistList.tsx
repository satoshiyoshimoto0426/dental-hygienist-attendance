import React, { useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Grid,
  FormControl, FormControlLabel, Checkbox, FormGroup, Switch,
  useTheme, useMediaQuery, Fab, Card, CardContent, CardActions,
  Stack, Avatar, Tooltip, Zoom, Alert, Collapse, List,
  ListItem, ListItemText, ListItemAvatar, Divider, Badge
} from '@mui/material';
import {
  Edit, Delete, Add, Visibility, Person, Email, Phone,
  School, Work, Close, Save, Cancel, Star
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Hygienist } from '../types';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';
import ja from 'date-fns/locale/ja';

const AnimatedCard = motion(Card);

export default function HygienistList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { hygienists, addHygienist, updateHygienist, deleteHygienist } = useData();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHygienist, setSelectedHygienist] = useState<Partial<Hygienist>>({});
  const [viewMode, setViewMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const specialtyOptions = ['口腔ケア', '口腔リハビリ', '摂食嚥下指導', '在宅訪問', '高齢者ケア'];

  const filteredHygienists = hygienists.filter(hygienist => 
    hygienist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hygienist.kana.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hygienist.staffId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSave = async () => {
    if (selectedHygienist.id) {
      // 編集
      await updateHygienist(selectedHygienist as Hygienist);
    } else {
      // 新規追加
      const newHygienist = {
        ...selectedHygienist,
        staffId: `DH${String(hygienists.length + 1).padStart(3, '0')}`,
      } as Omit<Hygienist, 'id'>;
      await addHygienist(newHygienist);
    }
    setOpenDialog(false);
    setSelectedHygienist({});
  };

  const handleDelete = async (id: number) => {
    await deleteHygienist(id);
    setDeleteConfirmId(null);
  };

  const handleSpecialtyChange = (specialty: string) => {
    const currentSpecialties = selectedHygienist.specialties || [];
    if (currentSpecialties.includes(specialty)) {
      setSelectedHygienist({
        ...selectedHygienist,
        specialties: currentSpecialties.filter(s => s !== specialty)
      });
    } else {
      setSelectedHygienist({
        ...selectedHygienist,
        specialties: [...currentSpecialties, specialty]
      });
    }
  };

  const gradientBackground = 'linear-gradient(135deg, #2DCE89 0%, #1FAF70 100%)';

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
            歯科衛生士管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            登録衛生士数: {hygienists.length}名 (アクティブ: {hygienists.filter(h => h.isActive).length}名)
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
          {isMobile ? '追加' : '新規スタッフ登録'}
        </Button>
      </Stack>

      {/* 検索バー */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="スタッフ名、カナ、スタッフIDで検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      {/* 衛生士リスト */}
      {isMobile || isTablet ? (
        // モバイル・タブレット表示：カード形式
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={2}>
            {filteredHygienists.map((hygienist) => (
              <Grid item xs={12} sm={6} md={4} key={hygienist.id}>
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
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            hygienist.isActive ? (
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: '#2DCE89',
                                  border: '2px solid white',
                                }}
                              />
                            ) : null
                          }
                        >
                          <Avatar sx={{ background: gradientBackground }}>
                            {hygienist.name.charAt(0)}
                          </Avatar>
                        </Badge>
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {hygienist.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {hygienist.staffId} | {hygienist.licenseNumber}
                          </Typography>
                        </Box>
                        <Chip
                          label={hygienist.isActive ? 'アクティブ' : '非アクティブ'}
                          size="small"
                          color={hygienist.isActive ? 'success' : 'default'}
                        />
                      </Stack>
                      
                      <List dense>
                        <ListItem disablePadding>
                          <ListItemText
                            primary={hygienist.kana}
                            secondary="フリガナ"
                          />
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemText
                            primary={hygienist.email}
                            secondary="メールアドレス"
                          />
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemText
                            primary={hygienist.phone}
                            secondary="電話番号"
                          />
                        </ListItem>
                      </List>
                      
                      {hygienist.specialties && hygienist.specialties.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                          {hygienist.specialties.map((specialty) => (
                            <Chip
                              key={specialty}
                              label={specialty}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ mb: 0.5 }}
                            />
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                    
                    <CardActions>
                      <IconButton size="small" onClick={() => handleOpenDialog(hygienist, true)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog(hygienist)}>
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => setDeleteConfirmId(hygienist.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>

                    <Collapse in={deleteConfirmId === hygienist.id}>
                      <Alert
                        severity="warning"
                        action={
                          <>
                            <Button size="small" onClick={() => handleDelete(hygienist.id)}>
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
                  <TableCell>スタッフID</TableCell>
                  <TableCell>氏名</TableCell>
                  <TableCell>カナ</TableCell>
                  <TableCell>免許番号</TableCell>
                  <TableCell>専門分野</TableCell>
                  <TableCell>入職日</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredHygienists.map((hygienist) => (
                    <motion.tr
                      key={hygienist.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'table-row' }}
                    >
                      <TableCell>{hygienist.staffId}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              hygienist.isActive ? (
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#2DCE89',
                                  }}
                                />
                              ) : null
                            }
                          >
                            <Avatar sx={{ width: 32, height: 32, background: gradientBackground }}>
                              {hygienist.name.charAt(0)}
                            </Avatar>
                          </Badge>
                          <Typography>{hygienist.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{hygienist.kana}</TableCell>
                      <TableCell>{hygienist.licenseNumber}</TableCell>
                      <TableCell>
                        {hygienist.specialties?.map((specialty) => (
                          <Chip
                            key={specialty}
                            label={specialty}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        {hygienist.hireDate && format(new Date(hygienist.hireDate), 'yyyy/MM/dd', { locale: ja })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={hygienist.isActive ? 'アクティブ' : '非アクティブ'}
                          color={hygienist.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="詳細表示">
                            <IconButton size="small" onClick={() => handleOpenDialog(hygienist, true)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="編集">
                            <IconButton size="small" onClick={() => handleOpenDialog(hygienist)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="削除">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => setDeleteConfirmId(hygienist.id)}
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

      {filteredHygienists.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            歯科衛生士が登録されていません
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2, background: gradientBackground }}
          >
            最初のスタッフを登録
          </Button>
        </Box>
      )}

      {/* スタッフ登録・編集ダイアログ */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {viewMode ? 'スタッフ詳細' : selectedHygienist.id ? 'スタッフ情報編集' : '新規スタッフ登録'}
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
                label="スタッフID"
                value={selectedHygienist.staffId || ''}
                disabled
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="氏名"
                value={selectedHygienist.name || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, name: e.target.value })}
                disabled={viewMode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="フリガナ"
                value={selectedHygienist.kana || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, kana: e.target.value })}
                disabled={viewMode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="免許番号"
                value={selectedHygienist.licenseNumber || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, licenseNumber: e.target.value })}
                disabled={viewMode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={selectedHygienist.email || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, email: e.target.value })}
                disabled={viewMode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="電話番号"
                value={selectedHygienist.phone || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, phone: e.target.value })}
                disabled={viewMode}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="入職日"
                type="date"
                value={selectedHygienist.hireDate || ''}
                onChange={(e) => setSelectedHygienist({ ...selectedHygienist, hireDate: e.target.value })}
                disabled={viewMode}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedHygienist.isActive ?? true}
                    onChange={(e) => setSelectedHygienist({ ...selectedHygienist, isActive: e.target.checked })}
                    disabled={viewMode}
                    color="success"
                  />
                }
                label={selectedHygienist.isActive ? 'アクティブ' : '非アクティブ'}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                専門分野
              </Typography>
              <FormGroup row>
                {specialtyOptions.map((specialty) => (
                  <FormControlLabel
                    key={specialty}
                    control={
                      <Checkbox
                        checked={selectedHygienist.specialties?.includes(specialty) || false}
                        onChange={() => handleSpecialtyChange(specialty)}
                        disabled={viewMode}
                      />
                    }
                    label={specialty}
                  />
                ))}
              </FormGroup>
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
            color="success"
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