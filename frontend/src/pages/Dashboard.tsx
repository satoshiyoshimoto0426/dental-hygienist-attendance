import React from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import { People, PersonAdd, CalendarMonth, Assessment } from '@mui/icons-material';

export default function Dashboard() {
  const stats = [
    { title: '登録患者数', value: 128, icon: <People />, color: '#2196f3' },
    { title: '歯科衛生士数', value: 12, icon: <PersonAdd />, color: '#4caf50' },
    { title: '今月の訪問数', value: 245, icon: <CalendarMonth />, color: '#ff9800' },
    { title: '平均訪問回数', value: 3.2, icon: <Assessment />, color: '#9c27b0' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ダッシュボード
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              最近の訪問記録
            </Typography>
            <Typography color="text.secondary">
              本日の訪問予定: 8件
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              お知らせ
            </Typography>
            <Typography variant="body2">
              システムは正常に稼働しています
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}