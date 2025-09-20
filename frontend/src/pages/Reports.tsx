import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Button, FormControl, InputLabel, Select,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Divider, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Download, Print, Description } from '@mui/icons-material';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { mockPatients, mockHygienists, mockVisitRecords } from '../services/mockData';
import { VisitRecord, Patient, Hygienist } from '../types';
import { exportPatientMonthlyReport, exportHygienistMonthlyReport } from '../utils/excelExport';

export default function Reports() {
  const [reportType, setReportType] = useState<'patient' | 'hygienist'>('patient');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [selectedHygienistId, setSelectedHygienistId] = useState<number | ''>('');

  // 月間の訪問記録をフィルタリング
  const monthlyRecords = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    return mockVisitRecords.filter(record => {
      const recordDate = parseISO(record.visitDate);
      return isWithinInterval(recordDate, { start, end });
    });
  }, [selectedMonth]);

  // 患者別統計
  const patientStatistics = useMemo(() => {
    if (!selectedPatientId) return null;
    
    const patientRecords = monthlyRecords.filter(r => r.patientId === selectedPatientId);
    const patient = mockPatients.find(p => p.id === selectedPatientId);
    
    if (!patient) return null;

    const serviceCount: { [key: string]: number } = {};
    let totalMinutes = 0;

    patientRecords.forEach(record => {
      // サービス種別カウント
      record.serviceType.forEach(type => {
        serviceCount[type] = (serviceCount[type] || 0) + 1;
      });
      
      // 訪問時間計算
      if (record.startTime && record.endTime) {
        const [startHour, startMin] = record.startTime.split(':').map(Number);
        const [endHour, endMin] = record.endTime.split(':').map(Number);
        totalMinutes += (endHour * 60 + endMin) - (startHour * 60 + startMin);
      }
    });

    return {
      patient,
      totalVisits: patientRecords.length,
      completedVisits: patientRecords.filter(r => r.status === 'completed').length,
      cancelledVisits: patientRecords.filter(r => r.status === 'cancelled').length,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      serviceBreakdown: serviceCount,
      records: patientRecords
    };
  }, [selectedPatientId, monthlyRecords]);

  // 歯科衛生士別統計
  const hygienistStatistics = useMemo(() => {
    if (!selectedHygienistId) return null;
    
    const hygienistRecords = monthlyRecords.filter(r => r.hygienistId === selectedHygienistId);
    const hygienist = mockHygienists.find(h => h.id === selectedHygienistId);
    
    if (!hygienist) return null;

    const patientCount = new Set(hygienistRecords.map(r => r.patientId)).size;
    let totalMinutes = 0;

    hygienistRecords.forEach(record => {
      if (record.startTime && record.endTime) {
        const [startHour, startMin] = record.startTime.split(':').map(Number);
        const [endHour, endMin] = record.endTime.split(':').map(Number);
        totalMinutes += (endHour * 60 + endMin) - (startHour * 60 + startMin);
      }
    });

    return {
      hygienist,
      totalVisits: hygienistRecords.length,
      totalPatients: patientCount,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      averageVisitTime: hygienistRecords.length > 0 ? Math.round(totalMinutes / hygienistRecords.length) : 0,
      records: hygienistRecords
    };
  }, [selectedHygienistId, monthlyRecords]);

  // Excel出力機能（新しいA4単一シート形式を使用）
  const exportToExcel = () => {
    if (reportType === 'patient' && patientStatistics) {
      // 患者月間レポートを単一シートA4形式で出力
      exportPatientMonthlyReport(
        patientStatistics.patient,
        patientStatistics.records,
        selectedMonth,
        mockHygienists
      );
    } else if (reportType === 'hygienist' && hygienistStatistics) {
      // 歯科衛生士勤務レポートを単一シートA4形式で出力
      exportHygienistMonthlyReport(
        hygienistStatistics.hygienist,
        hygienistStatistics.records,
        selectedMonth,
        mockPatients
      );
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        月間レポート
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>レポート種別</InputLabel>
              <Select value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
                <MenuItem value="patient">患者別レポート</MenuItem>
                <MenuItem value="hygienist">歯科衛生士別レポート</MenuItem>
              </Select>
            </FormControl>
          </Grid>
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
          <Grid item xs={12} md={3}>
            {reportType === 'patient' ? (
              <FormControl fullWidth>
                <InputLabel>患者選択</InputLabel>
                <Select value={selectedPatientId} onChange={(e) => setSelectedPatientId(Number(e.target.value))}>
                  {mockPatients.map(patient => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth>
                <InputLabel>歯科衛生士選択</InputLabel>
                <Select value={selectedHygienistId} onChange={(e) => setSelectedHygienistId(Number(e.target.value))}>
                  {mockHygienists.map(hygienist => (
                    <MenuItem key={hygienist.id} value={hygienist.id}>
                      {hygienist.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              color="success"
              startIcon={<Download />}
              onClick={exportToExcel}
              fullWidth
              disabled={reportType === 'patient' ? !selectedPatientId : !selectedHygienistId}
            >
              Excel出力
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 患者レポート表示 */}
      {reportType === 'patient' && patientStatistics && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>患者情報</Typography>
                <Typography variant="body2">氏名: {patientStatistics.patient.name}</Typography>
                <Typography variant="body2">年齢: {patientStatistics.patient.age}歳</Typography>
                <Typography variant="body2">要介護度: {patientStatistics.patient.careLevel}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>月間統計</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">総訪問回数</Typography>
                    <Typography variant="h5">{patientStatistics.totalVisits}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">完了</Typography>
                    <Typography variant="h5">{patientStatistics.completedVisits}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">キャンセル</Typography>
                    <Typography variant="h5">{patientStatistics.cancelledVisits}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">総時間</Typography>
                    <Typography variant="h5">{patientStatistics.totalHours}h</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>訪問日</TableCell>
                    <TableCell>担当衛生士</TableCell>
                    <TableCell>時間</TableCell>
                    <TableCell>サービス内容</TableCell>
                    <TableCell>状態</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patientStatistics.records.map((record) => {
                    const hygienist = mockHygienists.find(h => h.id === record.hygienistId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{format(parseISO(record.visitDate), 'MM/dd (E)', { locale: ja })}</TableCell>
                        <TableCell>{hygienist?.name}</TableCell>
                        <TableCell>{record.startTime} - {record.endTime}</TableCell>
                        <TableCell>{record.serviceType.join('、')}</TableCell>
                        <TableCell>
                          <Chip
                            label={record.status === 'completed' ? '完了' : record.status === 'cancelled' ? 'キャンセル' : '予定'}
                            color={record.status === 'completed' ? 'success' : record.status === 'cancelled' ? 'error' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}

      {/* 歯科衛生士レポート表示 */}
      {reportType === 'hygienist' && hygienistStatistics && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {hygienistStatistics.hygienist.name}の月間勤務統計
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">総訪問回数</Typography>
                    <Typography variant="h5">{hygienistStatistics.totalVisits}回</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">担当患者数</Typography>
                    <Typography variant="h5">{hygienistStatistics.totalPatients}名</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">総勤務時間</Typography>
                    <Typography variant="h5">{hygienistStatistics.totalHours}時間</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">平均訪問時間</Typography>
                    <Typography variant="h5">{hygienistStatistics.averageVisitTime}分</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>訪問日</TableCell>
                    <TableCell>患者名</TableCell>
                    <TableCell>時間</TableCell>
                    <TableCell>サービス内容</TableCell>
                    <TableCell>ケア内容</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hygienistStatistics.records.map((record) => {
                    const patient = mockPatients.find(p => p.id === record.patientId);
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{format(parseISO(record.visitDate), 'MM/dd (E)', { locale: ja })}</TableCell>
                        <TableCell>{patient?.name}</TableCell>
                        <TableCell>{record.startTime} - {record.endTime}</TableCell>
                        <TableCell>{record.serviceType.join('、')}</TableCell>
                        <TableCell>{record.careDetails}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}