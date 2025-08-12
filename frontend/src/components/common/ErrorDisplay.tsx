import React from 'react';
import { Alert, AlertTitle, Snackbar, Stack } from '@mui/material';
import { useError } from '../../contexts/ErrorContext';

export const ErrorDisplay: React.FC = () => {
  const { errors, removeError } = useError();

  return (
    <Stack spacing={1} sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
      {errors.map((error) => (
        <Snackbar
          key={error.id}
          open={true}
          autoHideDuration={5000}
          onClose={() => removeError(error.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            severity={error.type}
            onClose={() => removeError(error.id)}
            sx={{ minWidth: '300px' }}
          >
            <AlertTitle>
              {error.type === 'error' ? 'エラー' : 
               error.type === 'warning' ? '警告' : '情報'}
            </AlertTitle>
            {error.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};