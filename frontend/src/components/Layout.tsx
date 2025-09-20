import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Toolbar, Typography, IconButton
} from '@mui/material';
import {
  Dashboard, People, PersonAdd, CalendarMonth, Assessment, Logout
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

export default function Layout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { text: 'ダッシュボード', icon: <Dashboard />, path: '/dashboard' },
    { text: '患者一覧', icon: <People />, path: '/patients' },
    { text: '歯科衛生士一覧', icon: <PersonAdd />, path: '/hygienists' },
    { text: '訪問記録', icon: <CalendarMonth />, path: '/visits' },
    { text: 'レポート', icon: <Assessment />, path: '/reports' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            歯科衛生士月間勤怠システム
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component={Link} to={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}