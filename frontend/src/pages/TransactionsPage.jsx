import { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreIcon } from '@mui/icons-material';
import { useExpenseData } from '../hooks/useExpenseData';
import { formatCurrency } from '../utils/helpers';
import { tokens } from '../theme';

export default function TransactionsPage() {
  const { data } = useExpenseData();
  const transactions = data?.transactions || [];
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0);

  const filtered = useMemo(() => {
    let list = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (tab === 1) list = list.filter((t) => t.type === 'income');
    if (tab === 2) list = list.filter((t) => t.type === 'expense');
    if (search) list = list.filter((t) => t.description.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [transactions, tab, search]);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>Transactions</Typography>
      <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>{transactions.length} total transactions</Typography>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Box sx={{ px: 2, py: 0.5, border: `1px solid ${tokens.borderDark}` }}>
          <Typography variant="caption" sx={{ color: '#999999' }}>Income: {formatCurrency(totalIncome)}</Typography>
        </Box>
        <Box sx={{ px: 2, py: 0.5, border: `1px solid ${tokens.borderDark}` }}>
          <Typography variant="caption" sx={{ color: '#999999' }}>Expenses: {formatCurrency(totalExpenses)}</Typography>
        </Box>
        <Box sx={{ px: 2, py: 0.5, border: `1px solid ${tokens.borderDark}` }}>
          <Typography variant="caption" sx={{ color: '#999999' }}>Net: {formatCurrency(totalIncome - totalExpenses)}</Typography>
        </Box>
      </Box>

      {/* Search & tabs */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder="Search transactions..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#666666', fontSize: 18 }} /></InputAdornment> }}
          sx={{ minWidth: 260 }}
        />
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="All" />
          <Tab label="Income" />
          <Tab label="Expenses" />
        </Tabs>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((t, i) => (
              <TableRow key={t.id || i} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#FFFFFF' }}>{t.description}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={t.category} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#999999' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600, color: t.type === 'income' ? '#FFFFFF' : '#FF4444' }}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton size="small"><MoreIcon sx={{ fontSize: 16 }} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
