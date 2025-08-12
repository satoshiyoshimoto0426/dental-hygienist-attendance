import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

interface ExportButtonProps {
  onExport: () => Promise<void>;
  disabled?: boolean;
  label?: string;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
}

/**
 * CSV出力ボタンコンポーネント
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled = false,
  label = 'CSV出力',
  variant = 'outlined',
  size = 'medium'
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading || disabled) return;

    setLoading(true);
    try {
      await onExport();
    } catch (error) {
      console.error('CSV出力エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
    >
      {loading ? '出力中...' : label}
    </Button>
  );
};