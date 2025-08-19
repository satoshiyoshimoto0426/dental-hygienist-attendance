import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
    CircularProgress,
    Divider
  } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { format } from 'date-fns';
import { Patient } from '../../types/Patient';
import { PatientMonthlyStats } from '../../types/PatientReport';
import { PatientService } from '../../services/patientService';
import { PatientReportService } from '../../services/patientReportService';
import { CsvExportService } from '../../services/csvExportService';
import { ExportButton } from './ExportButton';

/**
 * 患者別レポートコンポーネント
 */
export const PatientReport: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<PatientMonthlyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 患者一覧を取得
  useEffect(() => {
    const fetchPatients = async () => {
      try {
          const patientsData = await PatientService.getPatients();
        setPatients(patientsData);
      } catch (error) {
        console.error('患者一覧取得エラー:', error);
        setError('患者一覧の取得に失敗しました');
      }
    };

    fetchPatients();
  }, []);

  // レポートを取得
  const handleGenerateReport = async () => {
    if (!selectedPatientId) {
      setError('患者を選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      const stats = await PatientReportService.getPatientMonthlyStats({
        patientId: selectedPatientId as number,
        year,
        month
      });

      setReportData(stats);
    } catch (error) {
      console.error('レポート取得エラー:', error);
      setError(error instanceof Error ? error.message : 'レポートの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const displayPatientName = reportData?.patientName || selectedPatient?.name || '';

  // 訪問状態のチップ色を取得
  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'scheduled':
        return 'warning';
      default:
        return 'default';
    }
  };

  // 訪問状態のラベルを取得
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了';
      case 'cancelled':
        return 'キャンセル';
      case 'scheduled':
        return '予定';
      default:
        return status;
    }
  };

  // 時間を分に変換
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  // CSV出力処理
  const handleCsvExport = async () => {
    if (!selectedPatientId || !reportData) {
      setError('レポートデータが存在しません');
      return;
    }

    try {
      await CsvExportService.exportPatientReport({
        patientId: selectedPatientId as number,
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1
      });
    } catch (error) {
      console.error('CSV出力エラー:', error);
      setError(error instanceof Error ? error.message : 'CSV出力に失敗しました');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          患者別統計レポート
        </Typography>

        {/* 検索条件 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>患者</InputLabel>
                  <Select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value as number)}
                    label="患者"
                  >
                    <MenuItem value="">選択してください</MenuItem>
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.patientId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="対象月"
                  value={selectedDate}
                  onChange={(newValue) => newValue && setSelectedDate(newValue)}
                  views={['year', 'month']}
                  format="yyyy年MM月"
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  onClick={handleGenerateReport}
                  disabled={loading || !selectedPatientId}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'レポート生成'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* エラー表示 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* レポート結果 */}
        {reportData && (
          <>
            {/* 統計サマリー */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {displayPatientName}さんの統計 ({reportData.year}年{reportData.month}月)
                  </Typography>
                  <ExportButton
                    onExport={handleCsvExport}
                    label="CSV出力"
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {reportData.totalVisits}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総訪問回数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {reportData.completedVisits}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        完了回数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {reportData.totalHours}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総時間（時間）
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {formatDuration(reportData.averageVisitDuration)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        平均訪問時間
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="error.main">
                        {reportData.cancelledVisits}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        キャンセル回数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="warning.main">
                        {reportData.scheduledVisits}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        予定回数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary">
                        {reportData.completedVisits > 0 ? 
                          Math.round((reportData.completedVisits / reportData.totalVisits) * 100) : 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        完了率
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 訪問詳細 */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  訪問詳細
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>訪問日</TableCell>
                        <TableCell>開始時間</TableCell>
                        <TableCell>終了時間</TableCell>
                        <TableCell>時間</TableCell>
                        <TableCell>状態</TableCell>
                        <TableCell>担当者</TableCell>
                        <TableCell>備考</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.visitDetails.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            訪問記録がありません
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportData.visitDetails.map((visit) => (
                          <TableRow key={visit.id}>
                            <TableCell>
                              {format(new Date(visit.visitDate), 'yyyy/MM/dd (E)', { locale: ja })}
                            </TableCell>
                            <TableCell>{visit.startTime || '-'}</TableCell>
                            <TableCell>{visit.endTime || '-'}</TableCell>
                            <TableCell>{formatDuration(visit.duration)}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(visit.status)}
                                color={getStatusChipColor(visit.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {visit.hygienistName}
                              {visit.hygienistStaffId && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  ({visit.hygienistStaffId})
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {visit.status === 'cancelled' && visit.cancellationReason && (
                                <Typography variant="body2" color="error">
                                  キャンセル理由: {visit.cancellationReason}
                                </Typography>
                              )}
                              {visit.notes && (
                                <Typography variant="body2" color="text.secondary">
                                  {visit.notes}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
};