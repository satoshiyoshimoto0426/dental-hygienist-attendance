import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme
} from '@mui/material';
import { useResponsive } from '../../hooks/useResponsive';

export interface TableColumn {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
    format?: (value: any, row?: any) => React.ReactNode;
  hideOnMobile?: boolean;
  mobileLabel?: string;
}

export interface ResponsiveTableProps {
  columns: TableColumn[];
  rows: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  rows,
  onRowClick,
  emptyMessage = 'データがありません',
  stickyHeader = true
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();

  if (rows.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 200,
          color: 'text.secondary'
        }}
      >
        <Typography variant="body1">{emptyMessage}</Typography>
      </Box>
    );
  }

  // モバイル表示：カード形式
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.map((row, index) => (
          <Card
            key={index}
            sx={{
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': onRowClick ? {
                backgroundColor: theme.palette.action.hover
              } : {}
            }}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              {columns
                .filter(column => !column.hideOnMobile)
                .map((column) => {
                  const value = row[column.id];
                    const displayValue = column.format ? column.format(value, row) : value;
                  const label = column.mobileLabel || column.label;

                  return (
                    <Box
                      key={column.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        '&:last-child': { mb: 0 }
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, minWidth: '40%' }}
                      >
                        {label}
                      </Typography>
                      <Box sx={{ textAlign: 'right', flex: 1 }}>
                        {typeof displayValue === 'string' ? (
                          <Typography variant="body2">
                            {displayValue}
                          </Typography>
                        ) : (
                          displayValue
                        )}
                      </Box>
                    </Box>
                  );
                })}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // デスクトップ・タブレット表示：テーブル形式
  return (
    <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
      <Table stickyHeader={stickyHeader}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}
                sx={{
                  fontWeight: 600,
                  backgroundColor: theme.palette.grey[50]
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              hover={!!onRowClick}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:last-child td, &:last-child th': { border: 0 }
              }}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => {
                const value = row[column.id];
                const displayValue = column.format ? column.format(value, row) : value;

                return (
                  <TableCell key={column.id} align={column.align}>
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ステータス表示用のヘルパーコンポーネント
export const StatusChip: React.FC<{
  status: string;
  colorMap?: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'>;
  labelMap?: Record<string, string>;
}> = ({ status, colorMap = {}, labelMap = {} }) => {
  const getColor = (status: string) => {
    return colorMap[status] || 'default';
  };

  const getLabel = (status: string) => {
    return labelMap[status] || status;
  };

  return (
    <Chip
      label={getLabel(status)}
      color={getColor(status)}
      size="small"
      sx={{ minWidth: 80 }}
    />
  );
};