import { useState, useMemo } from 'react';
import {
  Box, Typography, ToggleButton, ToggleButtonGroup, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useExpenseData } from '../hooks/useExpenseData';
import { formatCurrency } from '../utils/helpers';
import { tokens, glassCardStatic } from '../theme';

const COLORS = ['#FFFFFF', '#CCCCCC', '#999999', '#777777', '#555555', '#333333'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#1A1A1A', border: `1px solid ${tokens.borderDark}`, p: 1.5 }}>
      <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="caption" sx={{ display: 'block', color: '#999999' }}>
          {p.name}: {formatCurrency(p.value)}
        </Typography>
      ))}
    </Box>
  );
};

export default function ReportsPage() {
  const { data } = useExpenseData();
  const transactions = data?.transactions || [];
  const [range, setRange] = useState('month');

  const monthlyData = useMemo(() => {
    const months = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      if (!months[key]) months[key] = { month: key, income: 0, expenses: 0 };
      if (t.type === 'income') months[key].income += t.amount;
      else months[key].expenses += t.amount;
    });
    return Object.values(months);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const cats = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const topExpenses = useMemo(() => {
    return [...transactions].filter((t) => t.type === 'expense').sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [transactions]);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>Reports</Typography>
          <Typography variant="body2" sx={{ color: '#666666' }}>Analyze your financial patterns</Typography>
        </Box>
        <ToggleButtonGroup value={range} exclusive onChange={(_, v) => v && setRange(v)} size="small">
          {['week', 'month', 'year'].map((r) => (
            <ToggleButton key={r} value={r} sx={{
              color: '#666666', border: `1px solid ${tokens.borderDark}`, textTransform: 'capitalize',
              '&.Mui-selected': { bgcolor: '#FFFFFF', color: '#000000', '&:hover': { bgcolor: '#E0E0E0' } },
            }}>
              {r}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Bar chart */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ ...glassCardStatic, p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 0.5 }}>Income vs Expenses</Typography>
            <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>Monthly comparison</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666666', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="income" name="Income" fill="#FFFFFF" radius={0} />
                  <Bar dataKey="expenses" name="Expenses" fill="#555555" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        {/* Pie chart */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ ...glassCardStatic, p: 3, height: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 0.5 }}>Category Breakdown</Typography>
            <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>Where your money goes</Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend content={({ payload }) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
                      {payload.map((e, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, bgcolor: e.color }} />
                          <Typography variant="caption" sx={{ color: '#999999' }}>{e.value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Top expenses */}
      <Box sx={{ ...glassCardStatic }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFFFFF', p: 3, pb: 0 }}>Top Expenses</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topExpenses.map((t, i) => (
                <TableRow key={i}>
                  <TableCell><Typography variant="body2" sx={{ color: '#FFFFFF' }}>{t.description}</Typography></TableCell>
                  <TableCell><Typography variant="body2" sx={{ color: '#666666' }}>{t.category}</Typography></TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ color: '#FF4444', fontWeight: 600 }}>{formatCurrency(t.amount)}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
