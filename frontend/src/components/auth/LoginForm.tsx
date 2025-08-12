import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  useTheme
} from '@mui/material';
import { LoginRequest } from '../../types/Auth';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';

export const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const theme = useTheme();
  const { isMobile } = useResponsive();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(credentials);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.grey[50],
        px: { xs: 2, sm: 0 }
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            maxWidth: 400,
            mx: 'auto',
            boxShadow: theme.shadows[8]
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                component="h1"
                sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}
              >
                歯科衛生士勤怠システム
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
              >
                ログインしてください
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="ユーザー名"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="ユーザー名を入力してください"
                margin="normal"
                autoComplete="username"
                autoFocus
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="パスワード"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="パスワードを入力してください"
                margin="normal"
                autoComplete="current-password"
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !credentials.username || !credentials.password}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '16px', sm: '18px' },
                  fontWeight: 600
                }}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};