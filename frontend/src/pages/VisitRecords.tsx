import React, { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

export default function VisitRecords() {
  const [visits] = useState([
    { date: '2024-01-15', patient: '田中太郎', hygienist: '山田美咲', time: '10:00' },
    { date: '2024-01-15', patient: '佐藤花子', hygienist: '山田美咲', time: '14:00' },
    { date: '2024-01-16', patient: '鈴木次郎', hygienist: '高橋恵子', time: '09:00' },
  ]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">訪問記録</Typography>
        <Button variant="contained" startIcon={<Add />}>
          新規記録
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          月間訪問カレンダー
        </Typography>
        
        <Box mt={2}>
          {visits.map((visit, index) => (
            <Paper key={index} elevation={1} sx={{ p: 2, mb: 1 }}>
              <Typography variant="subtitle1">
                {visit.date} {visit.time}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                患者: {visit.patient} | 担当: {visit.hygienist}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}