import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Button,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalHospital as LocalHospitalIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';

interface NavigationProps {
  onNavigate?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { isMobile } = useResponsive();

  const handleLogout = () => {
    logout();
    if (onNavigate) onNavigate();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'ダッシュボード',
      icon: <DashboardIcon />
    },
    {
      path: '/patients',
      label: '患者マスタ',
      icon: <PeopleIcon />
    },
    {
      path: '/hygienists',
      label: '歯科衛生士マスタ',
      icon: <LocalHospitalIcon />
    },
    {
      path: '/attendance',
      label: '訪問記録',
      icon: <EventNoteIcon />
    },
    {
      path: '/reports',
      label: 'レポート',
      icon: <AssessmentIcon />
    }
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* メニューアイテム */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigate(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                minHeight: isMobile ? 56 : 48,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.contrastText
                  }
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isMobile ? 48 : 40,
                  color: isActive(item.path) 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.text.secondary
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: isMobile ? '16px' : '14px',
                  fontWeight: isActive(item.path) ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* ユーザー情報とログアウト */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: isMobile ? '14px' : '12px' }}
          >
            ログイン中
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: isMobile ? '16px' : '14px',
              wordBreak: 'break-all'
            }}
          >
            {user?.username}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: isMobile ? '12px' : '11px' }}
          >
            {user?.role === 'admin' ? '管理者' : 'ユーザー'}
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          color="primary"
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
          sx={{
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '14px' : '13px',
            borderRadius: 1
          }}
        >
          ログアウト
        </Button>
      </Box>
    </Box>
  );
};