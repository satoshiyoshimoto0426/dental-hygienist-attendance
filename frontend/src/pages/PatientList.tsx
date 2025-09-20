import React, { useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, IconButton
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

export default function PatientList() {
  const [patients] = useState([
    { id: 1, name: '田中太郎', kana: 'タナカタロウ', age: 75, phone: '090-1234-5678' },
    { id: 2, name: '佐藤花子', kana: 'サトウハナコ', age: 82, phone: '080-2345-6789' },
    { id: 3, name: '鈴木次郎', kana: 'スズキジロウ', age: 68, phone: '090-3456-7890' },
  ]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">患者一覧</Typography>
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
              <TableCell>年齢</TableCell>
              <TableCell>電話番号</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.id}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.kana}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.phone}</TableCell>
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