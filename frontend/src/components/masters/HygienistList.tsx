import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Hygienist } from '../../types/Hygienist';
import { HygienistService } from '../../services/hygienistService';

interface HygienistListProps {
  onEdit: (hygienist: Hygienist) => void;
  onDelete: (hygienist: Hygienist) => void;
  onAdd: () => void;
  refreshTrigger?: number;
}

const HygienistList: React.FC<HygienistListProps> = ({
  onEdit,
  onDelete,
  onAdd,
  refreshTrigger
}) => {
  const [hygienists, setHygienists] = useState<Hygienist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHygienists = async () => {
    try {
      setLoading(true);
      setError(null);
      const hygienistsData = await HygienistService.getHygienists();
      setHygienists(hygienistsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHygienists();
  }, [refreshTrigger]);

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          歯科衛生士一覧
        </Typography>
        <Tooltip title="新しい歯科衛生士を追加">
          <IconButton
            color="primary"
            onClick={onAdd}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>スタッフID</TableCell>
              <TableCell>歯科衛生士名</TableCell>
              <TableCell>免許番号</TableCell>
              <TableCell>電話番号</TableCell>
              <TableCell>メールアドレス</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hygienists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    登録されている歯科衛生士がありません
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              hygienists.map((hygienist) => (
                <TableRow key={hygienist.id} hover>
                  <TableCell>{hygienist.staffId}</TableCell>
                  <TableCell>{hygienist.name}</TableCell>
                  <TableCell>{hygienist.licenseNumber || '-'}</TableCell>
                  <TableCell>{hygienist.phone || '-'}</TableCell>
                  <TableCell>{hygienist.email || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="編集">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(hygienist)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="削除">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(hygienist)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HygienistList;