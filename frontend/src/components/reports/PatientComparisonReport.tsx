import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV2';
import { ja } from 'date-fns/locale';
import { PatientComparisonReport as PatientComparisonReportType } from '../../types/PatientReport';
import { PatientReportService } from '../../services/patientReportService';

/**
 * 患者比較レポートコンポーネント
 */
export const PatientComparisonReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<PatientComparisonReportType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // レポートを取得
  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      const report = await PatientReportService.getPatientComparisonReport(year, month);
      setReportData(report);
    } catch (error) {
      console.error('患者比較レポート取得エラー:', error);
      setError(error instanceof Error ? error.message : '患者比較レポートの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 時間を分に変換
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          患者比較レポート
        </Typography>

        {/* 検索条件 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <Button
                  variant="contained"
                  onClick={handleGenerateReport}
                  disabled={loading}
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
                <Typography variant="h6" gutterBottom>
                  全体統計 ({reportData.year}年{reportData.month}月)
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {reportData.totalPatients}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        対象患者数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {reportData.averageVisitsPerPatient}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        患者あたり平均訪問回数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {reportData.patients.reduce((sum, p) => sum + p.totalVisits, 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総訪問回数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {Math.round(reportData.patients.reduce((sum, p) => sum + p.totalHours, 0) * 100) / 100}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        総時間（時間）
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* 患者別詳細 */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  患者別詳細
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>患者名</TableCell>
                        <TableCell align="right">総訪問回数</TableCell>
                        <TableCell align="right">完了回数</TableCell>
                        <TableCell align="right">キャンセル回数</TableCell>
                        <TableCell align="right">予定回数</TableCell>
                        <TableCell align="right">総時間</TableCell>
                        <TableCell align="right">平均訪問時間</TableCell>
                        <TableCell align="right">完了率</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.patients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            該当する患者データがありません
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportData.patients
                          .sort((a, b) => b.totalVisits - a.totalVisits) // 訪問回数の多い順にソート
                          .map((patient) => (
                            <TableRow key={patient.patientId}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {patient.patientName}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="primary">
                                  {patient.totalVisits}回
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="success.main">
                                  {patient.completedVisits}回
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="error.main">
                                  {patient.cancelledVisits}回
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" color="warning.main">
                                  {patient.scheduledVisits}回
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {patient.totalHours}時間
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {formatDuration(patient.averageVisitDuration)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography 
                                  variant="body2" 
                                  color={patient.totalVisits > 0 && 
                                    (patient.completedVisits / patient.totalVisits) >= 0.8 ? 
                                    'success.main' : 'text.primary'}
                                >
                                  {patient.totalVisits > 0 ? 
                                    Math.round((patient.completedVisits / patient.totalVisits) * 100) : 0}%
                                </Typography>
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