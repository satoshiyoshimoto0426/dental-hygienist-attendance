import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
    Grid,
    Card,
    CardActionArea,
    Avatar,
    Paper,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as LocalHospitalIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  path,
  color
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { isMobile } = useResponsive();

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardActionArea
        onClick={() => navigate(path)}
        sx={{
          height: '100%',
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, width: '100%' }}>
          <Avatar
            sx={{
              bgcolor: color,
              width: isMobile ? 48 : 56,
              height: isMobile ? 48 : 56,
              mr: 2
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              component="h3"
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              {title}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: isMobile ? '14px' : '16px' }}
        >
          {description}
        </Typography>
      </CardActionArea>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const { isMobile } = useResponsive();

  const dashboardItems: DashboardCardProps[] = [
    {
      title: '患者マスタ',
      description: '患者情報の登録・管理を行います',
      icon: <PeopleIcon />,
      path: '/patients',
      color: theme.palette.primary.main
    },
    {
      title: '歯科衛生士マスタ',
      description: '歯科衛生士情報の登録・管理を行います',
      icon: <LocalHospitalIcon />,
      path: '/hygienists',
      color: theme.palette.secondary.main
    },
    {
      title: '訪問記録',
      description: '患者訪問記録の入力・管理を行います',
      icon: <EventNoteIcon />,
      path: '/attendance',
      color: theme.palette.success.main
    },
    {
      title: 'レポート',
      description: '月間統計の確認・CSV出力を行います',
      icon: <AssessmentIcon />,
      path: '/reports',
      color: theme.palette.info.main
    }
  ];

  const stats = [
    { label: '今月の訪問予定', value: '-', unit: '件' },
    { label: '完了した訪問', value: '-', unit: '件' },
    { label: 'キャンセル', value: '-', unit: '件' }
  ];

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          component="h1"
          sx={{ fontWeight: 600, mb: 1 }}
        >
          ダッシュボード
        </Typography>
        <Typography
          variant={isMobile ? "body1" : "h6"}
          color="text.secondary"
        >
          ようこそ、{user?.username}さん
        </Typography>
      </Box>

      {/* メインメニューカード */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <DashboardCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* 統計情報 */}
      <Box>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          component="h2"
          sx={{ fontWeight: 600, mb: 2 }}
        >
          今月の統計
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  textAlign: 'center',
                  height: '100%'
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, fontSize: isMobile ? '12px' : '14px' }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  component="div"
                  sx={{ fontWeight: 700, mb: 0.5 }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '12px' : '14px' }}
                >
                  {stat.unit}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};