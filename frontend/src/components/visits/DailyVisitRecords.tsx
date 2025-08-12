import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { DailyVisitCalendar } from './DailyVisitCalendar';

export const DailyVisitRecords: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          日次訪問記録管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          カレンダー形式で日次訪問記録を管理できます。日付をクリックして新しい記録を追加したり、既存の記録をクリックして編集できます。
        </Typography>
      </Box>
      
      <DailyVisitCalendar />
    </Container>
  );
};