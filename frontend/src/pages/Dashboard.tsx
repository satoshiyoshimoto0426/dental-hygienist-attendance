import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent, LinearProgress,
  Avatar, Chip, List, ListItem, ListItemAvatar, ListItemText,
  IconButton, Badge, Tooltip, Fab, Zoom, useTheme, useMediaQuery,
  Container, Alert, AlertTitle, Divider, Button, Stack
} from '@mui/material';
import {
  People, PersonAdd, CalendarMonth, Assessment, TrendingUp,
  NotificationsActive, Warning, CheckCircle, Schedule,
  LocalHospital, Favorite, Star, EmojiEvents, Add,
  Refresh, BarChart, PieChart, Timeline, Speed
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';
import ja from 'date-fns/locale/ja';
import { useNavigate } from 'react-router-dom';

// アニメーション付きカードコンポーネント
const AnimatedCard = motion(Card);

// グラデーション背景スタイル
const gradientStyles = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #2DCE89 0%, #1FAF70 100%)',
  warning: 'linear-gradient(135deg, #FB6340 0%, #FA3A0E 100%)',
  info: 'linear-gradient(135deg, #11CDEF 0%, #0DA5C0 100%)',
};

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { patients, hygienists, visitRecords, appointments, notifications, isLoading, refreshData } = useData();
  
  const [refreshing, setRefreshing] = useState(false);

  // 今日の日付
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // 統計計算
  const todaysAppointments = appointments.filter(a => a.appointmentDate === today && a.status === 'confirmed');
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const thisMonthVisits = visitRecords.filter(v => {
    const visitMonth = format(new Date(v.visitDate), 'yyyy-MM');
    const currentMonth = format(new Date(), 'yyyy-MM');
    return visitMonth === currentMonth;
  });
  
  const completionRate = thisMonthVisits.length > 0 
    ? Math.round((thisMonthVisits.filter(v => v.status === 'completed').length / thisMonthVisits.length) * 100)
    : 0;

  const stats = [
    {
      title: '登録患者数',
      value: patients.length,
      icon: <People sx={{ fontSize: 40 }} />,
      gradient: gradientStyles.primary,
      trend: '+12%',
      subtitle: '前月比',
    },
    {
      title: '歯科衛生士数',
      value: hygienists.filter(h => h.isActive).length,
      icon: <PersonAdd sx={{ fontSize: 40 }} />,
      gradient: gradientStyles.success,
      trend: `${hygienists.length}名中`,
      subtitle: 'アクティブ',
    },
    {
      title: '今月の訪問数',
      value: thisMonthVisits.length,
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      gradient: gradientStyles.warning,
      trend: `${completionRate}%`,
      subtitle: '完了率',
    },
    {
      title: '本日の予約',
      value: todaysAppointments.length,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      gradient: gradientStyles.info,
      trend: '件',
      subtitle: '確定済み',
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress color="primary" />
        <Typography variant="h6" align="center" sx={{ mt: 2 }}>
          データを読み込んでいます...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme.palette.mode === 'light' 
        ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        : theme.palette.background.default,
      pb: 4,
    }}>
      <Container maxWidth="xl">
        <Box sx={{ pt: 3, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={2}>
            <Box>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: gradientStyles.primary,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                管理画面
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {format(new Date(), 'yyyy年MM月dd日（E）', { locale: ja })}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Tooltip title="データを更新">
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    background: 'white',
                    boxShadow: 2,
                    '&:hover': { background: 'white', transform: 'rotate(180deg)' },
                    transition: 'transform 0.5s',
                  }}
                >
                  <Refresh color="primary" />
                </IconButton>
              </Tooltip>
              <Badge badgeContent={unreadNotifications.length} color="error">
                <IconButton
                  sx={{
                    background: 'white',
                    boxShadow: 2,
                    '&:hover': { background: 'white' },
                  }}
                >
                  <NotificationsActive color="primary" />
                </IconButton>
              </Badge>
            </Stack>
          </Stack>
        </Box>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 統計カード */}
          <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <AnimatedCard
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.98 }}
                    sx={{
                      height: '100%',
                      background: stat.gradient,
                      color: 'white',
                      position: 'relative',
                      overflow: 'visible',
                      cursor: 'pointer',
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                            {stat.title}
                          </Typography>
                          <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700 }}>
                            {stat.value.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {stat.trend} {stat.subtitle}
                          </Typography>
                        </Box>
                        <Box sx={{ opacity: 0.8 }}>
                          {stat.icon}
                        </Box>
                      </Box>
                    </CardContent>
                  </AnimatedCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* メインコンテンツ */}
          <Grid container spacing={3}>
            {/* 本日の予約 */}
            <Grid item xs={12} md={8}>
              <motion.div variants={itemVariants}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      本日の予約
                    </Typography>
                    <Chip
                      label={`${todaysAppointments.length}件`}
                      color="primary"
                      size="small"
                    />
                  </Stack>
                  
                  {todaysAppointments.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <AlertTitle>予約なし</AlertTitle>
                      本日の予約はありません
                    </Alert>
                  ) : (
                    <List>
                      {todaysAppointments.slice(0, 5).map((appointment, index) => {
                        const patient = patients.find(p => p.id === appointment.patientId);
                        const hygienist = hygienists.find(h => h.id === appointment.hygienistId);
                        return (
                          <React.Fragment key={appointment.id}>
                            {index > 0 && <Divider />}
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar sx={{ background: gradientStyles.primary }}>
                                  <LocalHospital />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {patient?.name || '未設定'}
                                    </Typography>
                                    <Chip
                                      label={`${appointment.startTime} - ${appointment.endTime}`}
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                    />
                                  </Stack>
                                }
                                secondary={`担当: ${hygienist?.name || '未設定'} | ${appointment.serviceType.join('・')}`}
                              />
                            </ListItem>
                          </React.Fragment>
                        );
                      })}
                    </List>
                  )}
                  
                  {todaysAppointments.length > 5 && (
                    <Button
                      fullWidth
                      variant="text"
                      onClick={() => navigate('/schedule')}
                      sx={{ mt: 2 }}
                    >
                      すべての予約を見る ({todaysAppointments.length}件)
                    </Button>
                  )}
                </Paper>
              </motion.div>
            </Grid>

            {/* 通知とパフォーマンス */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {/* 通知 */}
                <motion.div variants={itemVariants}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        お知らせ
                      </Typography>
                      <Badge badgeContent={unreadNotifications.length} color="error">
                        <NotificationsActive color="action" />
                      </Badge>
                    </Stack>
                    
                    {unreadNotifications.length === 0 ? (
                      <Alert severity="success" sx={{ borderRadius: 2 }}>
                        新しいお知らせはありません
                      </Alert>
                    ) : (
                      <List dense>
                        {unreadNotifications.slice(0, 3).map((notification) => (
                          <ListItem key={notification.id}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 32, height: 32, background: gradientStyles.warning }}>
                                <Warning sx={{ fontSize: 18 }} />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={notification.title}
                              secondary={notification.message}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                </motion.div>

                {/* パフォーマンス指標 */}
                <motion.div variants={itemVariants}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: gradientStyles.success,
                      color: 'white',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      今月のパフォーマンス
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            訪問完了率
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {completionRate}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={completionRate}
                          sx={{
                            mt: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: 'white',
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          患者満足度
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              sx={{
                                fontSize: 16,
                                color: star <= 4 ? 'white' : 'rgba(255, 255, 255, 0.3)',
                              }}
                            />
                          ))}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                </motion.div>
              </Stack>
            </Grid>
          </Grid>

          {/* クイックアクションボタン */}
          <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
            <Stack spacing={2}>
              <Zoom in={true} timeout={300}>
                <Fab
                  color="primary"
                  onClick={() => navigate('/patients')}
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    background: gradientStyles.primary,
                    '&:hover': {
                      background: gradientStyles.primary,
                      transform: 'scale(1.1) rotate(10deg)',
                    },
                  }}
                >
                  <Add />
                </Fab>
              </Zoom>
            </Stack>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}