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
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { HygienistMonthlyStats } from '../../types/HygienistReport';
import { Hygienist } from '../../types/Hygienist';
import { HygienistReportService } from '../../services/hygienistReportService';
import { HygienistService } from '../../services/hygienistService';
import { CsvExportService } from '../../services/csvExportService';
import { ExportButton } from './ExportButton';

/**
 * 歯科衛生士レポートコンポーネント
 */
export const HygienistReport: React.FC = () => {
  const [hygienists, setHygienists] = useState<Hygienist[]>([]);
  const [selectedHygienistId, setSelectedHygienistId] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState<HygienistMonthlyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 歯科衛生士一覧を取得
  useEffect(() => {
    const fetchHygienists = async () => {
      try {
        const data = await HygienistService.getHygienists();
        setHygienists(data);
        if (data.length > 0) {
          setSelectedHygienistId(data[0].id);
        }
      } catch (err) {
        setError('歯科衛生士一覧の取得に失敗しました');
      }
    };

    fetchHygienists();
  }, []);

  // レポートデータを取得
  const fetchReportData = async () => {
    if (!selectedHygienistId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await HygienistReportService.getHygienistMonthlyStats({
        hygienistId: selectedHygienistId as number,
        year: selectedYear,
        month: selectedMonth
      });
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レポートの取得に失敗しました');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const selectedHygienist = hygienists.find(h => h.id === selectedHygienistId);
  const displayHygienistName = reportData?.hygienistName || selectedHygienist?.name || '';

  // 年の選択肢を生成
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      years.push(year);
    }
    return years;
  };

  // 月の選択肢を生成
  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  // 訪問ステータスのチップ色を取得
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

  // 訪問ステータスのラベルを取得
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

  // 時間をフォーマット
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  // CSV出力処理
  const handleCsvExport = async () => {
    if (!selectedHygienistId || !reportData) {
      setError('レポートデータが存在しません');
      return;
    }

    try {
      await CsvExportService.exportHygienistReport({
        hygienistId: selectedHygienistId as number,
        year: selectedYear,
        month: selectedMonth
      });
    } catch (error) {
      console.error('CSV出力エラー:', error);
      setError(error instanceof Error ? error.message : 'CSV出力に失敗しました');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        歯科衛生士別レポート
      </Typography>

      {/* 検索条件 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>歯科衛生士</InputLabel>
                <Select
                  value={selectedHygienistId}
                  onChange={(e) => setSelectedHygienistId(e.target.value as number)}
                  label="歯科衛生士"
                >
                  {hygienists.map((hygienist) => (
                    <MenuItem key={hygienist.id} value={hygienist.id}>
                      {hygienist.name} ({hygienist.staffId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>年</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value as number)}
                  label="年"
                >
                  {generateYearOptions().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}年
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>月</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value as number)}
                  label="月"
                >
                  {generateMonthOptions().map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}月
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                onClick={fetchReportData}
                disabled={!selectedHygienistId || loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : '検索'}
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
                  {displayHygienistName}さんの{reportData.year}年{reportData.month}月統計
                </Typography>
                <ExportButton
                  onExport={handleCsvExport}
                  label="CSV出力"
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {reportData.totalVisits}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      総訪問数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {reportData.completedVisits}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      完了訪問数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {reportData.totalHours}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      総勤務時間
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
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
                      <TableCell>日付</TableCell>
                      <TableCell>患者名</TableCell>
                      <TableCell>開始時間</TableCell>
                      <TableCell>終了時間</TableCell>
                      <TableCell>時間</TableCell>
                      <TableCell>ステータス</TableCell>
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
                            {format(new Date(visit.visitDate), 'M/d(E)', { locale: ja })}
                          </TableCell>
                          <TableCell>
                            {visit.patientName}
                            <Typography variant="caption" display="block" color="text.secondary">
                              ID: {visit.patientId}
                            </Typography>
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
                            {visit.status === 'cancelled' && visit.cancellationReason && (
                              <Typography variant="caption" color="error">
                                キャンセル理由: {visit.cancellationReason}
                              </Typography>
                            )}
                            {visit.notes && (
                              <Typography variant="caption" display="block">
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
  );
};