import React, { useState } from 'react';
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
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { HygienistComparisonReport as HygienistComparisonReportType } from '../../types/HygienistReport';
import { HygienistReportService } from '../../services/hygienistReportService';

/**
 * 歯科衛生士比較レポートコンポーネント
 */
export const HygienistComparisonReport: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState<HygienistComparisonReportType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // レポートデータを取得
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await HygienistReportService.getHygienistComparisonReport(selectedYear, selectedMonth);
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レポートの取得に失敗しました');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

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

  // 時間をフォーマット
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        歯科衛生士比較レポート
      </Typography>

      {/* 検索条件 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
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
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                onClick={fetchReportData}
                disabled={loading}
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
              <Typography variant="h6" gutterBottom>
                {reportData.year}年{reportData.month}月 歯科衛生士統計サマリー
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={6} sm={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {reportData.totalHygienists}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      活動歯科衛生士数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {reportData.averageVisitsPerHygienist}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      平均訪問数/人
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* 歯科衛生士別詳細 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                歯科衛生士別詳細
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>歯科衛生士名</TableCell>
                      <TableCell>スタッフID</TableCell>
                      <TableCell align="right">総訪問数</TableCell>
                      <TableCell align="right">完了訪問数</TableCell>
                      <TableCell align="right">キャンセル数</TableCell>
                      <TableCell align="right">総勤務時間</TableCell>
                      <TableCell align="right">平均訪問時間</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.hygienists.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          該当期間の訪問記録がありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData.hygienists
                        .sort((a, b) => b.totalVisits - a.totalVisits)
                        .map((hygienist) => (
                          <TableRow key={hygienist.hygienistId}>
                            <TableCell>
                              <Typography variant="body1" fontWeight="medium">
                                {hygienist.hygienistName}
                              </Typography>
                            </TableCell>
                            <TableCell>{hygienist.staffId}</TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="medium">
                                {hygienist.totalVisits}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" color="success.main">
                                {hygienist.completedVisits}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" color="error.main">
                                {hygienist.cancelledVisits}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" color="info.main">
                                {hygienist.totalHours}時間
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" color="warning.main">
                                {formatDuration(hygienist.averageVisitDuration)}
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
  );
};