import { useCallback } from 'react';
import { useError } from '../contexts/ErrorContext';
import { ApiClientError } from '../services/api';

export const useApiError = () => {
  const { addError } = useError();

  const handleApiError = useCallback((error: unknown) => {
    if (error instanceof ApiClientError) {
      addError(error.message, 'error', {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      });
    } else if (error instanceof Error) {
      addError(error.message, 'error');
    } else {
      addError('予期しないエラーが発生しました', 'error');
    }
  }, [addError]);

  const handleSuccess = useCallback((message: string) => {
    addError(message, 'info');
  }, [addError]);

  const handleWarning = useCallback((message: string) => {
    addError(message, 'warning');
  }, [addError]);

  return {
    handleApiError,
    handleSuccess,
    handleWarning
  };
};