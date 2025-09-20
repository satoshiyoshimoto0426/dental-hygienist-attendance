import React, { useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton, Chip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

export default function HygienistList() {
  const [hygienists] = useState([
    { id: 1, name: '山田美咲', kana: 'ヤマダミサキ', license: 'DH-12345', status: '勤務中' },
    { id: 2, name: '高橋恵子', kana: 'タカハシケイコ', license: 'DH-23456', status: '勤務中' },
    { id: 3, name: '伊藤さやか', kana: 'イトウサヤカ', license: 'DH-34567', status: '休暇中' },
  ]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">歯科衛生士一覧</Typography>
        <Button variant="contained" startIcon={<Add />}>
          新規登録
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>氏名</TableCell>
              <TableCell>カナ</TableCell>
              <TableCell>免許番号</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hygienists.map((hygienist) => (
              <TableRow key={hygienist.id}>
                <TableCell>{hygienist.id}</TableCell>
                <TableCell>{hygienist.name}</TableCell>
                <TableCell>{hygienist.kana}</TableCell>
                <TableCell>{hygienist.license}</TableCell>
                <TableCell>
                  <Chip
                    label={hygienist.status}
                    color={hygienist.status === '勤務中' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}