import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Navigation } from './Navigation';
import { useResponsive } from '../../hooks/useResponsive';

interface LayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 280;
const MOBILE_DRAWER_WIDTH = 280;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  // モバイル・タブレット用のドロワー
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="h6" component="div" color="primary">
          歯科衛生士勤怠
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerClose} edge="end">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Navigation onNavigate={handleDrawerClose} />
    </Box>
  );

  if (isMobile || isTablet) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* モバイル・タブレット用のAppBar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.primary.main
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="メニューを開く"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              歯科衛生士勤怠システム
            </Typography>
          </Toolbar>
        </AppBar>

        {/* モバイル・タブレット用のドロワー */}
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileDrawerOpen}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true // モバイルパフォーマンス向上
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: MOBILE_DRAWER_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          {drawer}
        </Drawer>

        {/* メインコンテンツ */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default
          }}
        >
          <Toolbar /> {/* AppBarの高さ分のスペース */}
          <Container
            maxWidth={false}
            sx={{
              px: { xs: 1, sm: 2 },
              py: { xs: 1, sm: 2 },
              minHeight: 'calc(100vh - 64px)'
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    );
  }

  // デスクトップ用のレイアウト
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* デスクトップ用の固定サイドバー */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`
          }
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6" component="div" color="primary">
            歯科衛生士勤怠システム
          </Typography>
        </Box>
        <Navigation />
      </Drawer>

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            px: 3,
            py: 3,
            minHeight: '100vh'
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};