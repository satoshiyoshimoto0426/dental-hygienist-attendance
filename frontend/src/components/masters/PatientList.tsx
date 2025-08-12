import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tooltip,
  Button,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Patient } from '../../types/Patient';
import { PatientService } from '../../services/patientService';
import { ResponsiveTable, TableColumn } from '../common/ResponsiveTable';
import { useResponsive } from '../../hooks/useResponsive';

interface PatientListProps {
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onAdd: () => void;
  refreshTrigger?: number;
}

const PatientList: React.FC<PatientListProps> = ({
  onEdit,
  onDelete,
  onAdd,
  refreshTrigger
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = useResponsive();

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const patientsData = await PatientService.getPatients();
      setPatients(patientsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [refreshTrigger]);

  const columns: TableColumn[] = [
    {
      id: 'patientId',
      label: '患者ID',
      minWidth: 100,
      mobileLabel: 'ID'
    },
    {
      id: 'name',
      label: '患者名',
      minWidth: 150,
      mobileLabel: '名前'
    },
    {
      id: 'phone',
      label: '電話番号',
      minWidth: 120,
      hideOnMobile: true,
      format: (value: string) => value || '-'
    },
    {
      id: 'email',
      label: 'メールアドレス',
      minWidth: 200,
      hideOnMobile: true,
      format: (value: string) => value || '-'
    },
    {
      id: 'address',
      label: '住所',
      minWidth: 200,
      hideOnMobile: true,
      format: (value: string) => value || '-'
    },
    {
      id: 'actions',
      label: '操作',
      minWidth: 120,
      align: 'center' as const,
      format: (value: any, row: Patient) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="編集">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="削除">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  // テーブル用のデータを準備
  const tableRows = patients.map(patient => ({
    ...patient,
    actions: null // アクションは format 関数で処理
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={2}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography variant={isMobile ? "h6" : "h6"} component="h2">
          患者一覧 ({patients.length}件)
        </Typography>
        
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ minWidth: 140 }}
          >
            患者を追加
          </Button>
        )}
      </Box>

      <ResponsiveTable
        columns={columns}
        rows={tableRows}
        emptyMessage="登録されている患者がありません"
        onRowClick={isMobile ? onEdit : undefined}
      />
    </Box>
  );
};

export default PatientList;