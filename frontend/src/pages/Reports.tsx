import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { Download, Print } from '@mui/icons-material';

export default function Reports() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        レポート
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              月次訪問統計
            </Typography>
            <Typography color="text.secondary" paragraph>
              今月の訪問数: 245件
            </Typography>
            <Typography color="text.secondary" paragraph>
              前月比: +12%
            </Typography>
            <Button variant="outlined" startIcon={<Download />}>
              CSV出力
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              患者別レポート
            </Typography>
            <Typography color="text.secondary" paragraph>
              アクティブ患者数: 128名
            </Typography>
            <Typography color="text.secondary" paragraph>
              新規患者数: 8名
            </Typography>
            <Button variant="outlined" startIcon={<Print />}>
              印刷
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              歯科衛生士別パフォーマンス
            </Typography>
            <Typography color="text.secondary">
              月間平均訪問数: 20.4件/人
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}