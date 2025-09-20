import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Grid, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, FormControl, InputLabel, Select, Checkbox, FormGroup, FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { mockPatients, mockHygienists, mockVisitRecords } from '../services/mockData';
import { VisitRecord, ServiceType } from '../types';

export default function VisitRecords() {
  const [records, setRecords] = useState<VisitRecord[]>(mockVisitRecords);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Partial<VisitRecord>>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const serviceTypes: ServiceType[] = ['口腔ケア', '口腔リハビリ', '摂食嚥下指導', 'その他'];

  const handleOpenDialog = (record?: VisitRecord) => {
    if (record) {
      setSelectedRecord(record);
    } else {
      setSelectedRecord({
        visitDate: format(new Date(), 'yyyy-MM-dd'),
        serviceType: [],
        status: 'scheduled',
        oralCondition: {},
        vitalSigns: {}
      });
    }
    setOpenDialog(true);
  };

  const handleSaveRecord = () => {
    if (selectedRecord.id) {
      setRecords(records.map(r => 
        r.id === selectedRecord.id ? { ...r, ...selectedRecord } : r
      ));
    } else {
      const newRecord = {
        ...selectedRecord,
        id: Math.max(...records.map(r => r.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as VisitRecord;
      setRecords([...records, newRecord]);
    }
    setOpenDialog(false);
  };

  const handleDeleteRecord = (id: number) => {
    if (window.confirm('この記録を削除してもよろしいですか？')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const getPatientName = (patientId: number) => {
    const patient = mockPatients.find(p => p.id === patientId);
    return patient ? patient.name : '不明';
  };

  const getHygienistName = (hygienistId: number) => {
    const hygienist = mockHygienists.find(h => h.id === hygienistId);
    return hygienist ? hygienist.name : '不明';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'scheduled': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      case 'scheduled': return '予定';
      default: return status;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">訪問記録管理</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          新規記録
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
              <DatePicker
                label="対象月"
                value={selectedMonth}
                onChange={(newValue) => newValue && setSelectedMonth(newValue)}
                views={['year', 'month']}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>訪問日</TableCell>
              <TableCell>患者名</TableCell>
              <TableCell>担当衛生士</TableCell>
              <TableCell>時間</TableCell>
              <TableCell>サービス内容</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {format(parseISO(record.visitDate), 'MM/dd (E)', { locale: ja })}
                </TableCell>
                <TableCell>{getPatientName(record.patientId)}</TableCell>
                <TableCell>{getHygienistName(record.hygienistId)}</TableCell>
                <TableCell>{record.startTime} - {record.endTime}</TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {record.serviceType.map((type, idx) => (
                      <Chip key={idx} label={type} size="small" color="primary" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(record.status)} 
                    color={getStatusColor(record.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="info" onClick={() => handleOpenDialog(record)}>
                    <Visibility />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleOpenDialog(record)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteRecord(record.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 訪問記録入力ダイアログ */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRecord.id ? '訪問記録編集' : '新規訪問記録'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField
                type="date"
                label="訪問日"
                value={selectedRecord.visitDate || ''}
                onChange={(e) => setSelectedRecord({ ...selectedRecord, visitDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>患者</InputLabel>
                <Select
                  value={selectedRecord.patientId || ''}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, patientId: Number(e.target.value) })}
                >
                  {mockPatients.map(patient => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>担当衛生士</InputLabel>
                <Select
                  value={selectedRecord.hygienistId || ''}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, hygienistId: Number(e.target.value) })}
                >
                  {mockHygienists.map(hygienist => (
                    <MenuItem key={hygienist.id} value={hygienist.id}>
                      {hygienist.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="time"
                label="開始時間"
                value={selectedRecord.startTime || ''}
                onChange={(e) => setSelectedRecord({ ...selectedRecord, startTime: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="time"
                label="終了時間"
                value={selectedRecord.endTime || ''}
                onChange={(e) => setSelectedRecord({ ...selectedRecord, endTime: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>サービス内容</Typography>
              <FormGroup row>
                {serviceTypes.map(type => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={selectedRecord.serviceType?.includes(type) || false}
                        onChange={(e) => {
                          const current = selectedRecord.serviceType || [];
                          if (e.target.checked) {
                            setSelectedRecord({ ...selectedRecord, serviceType: [...current, type] });
                          } else {
                            setSelectedRecord({ ...selectedRecord, serviceType: current.filter(t => t !== type) });
                          }
                        }}
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="ケア内容詳細"
                value={selectedRecord.careDetails || ''}
                onChange={(e) => setSelectedRecord({ ...selectedRecord, careDetails: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="患者の状態"
                value={selectedRecord.patientCondition || ''}
                onChange={(e) => setSelectedRecord({ ...selectedRecord, patientCondition: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>キャンセル</Button>
          <Button onClick={handleSaveRecord} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}