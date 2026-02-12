import { useMemo } from 'react';
import { Box, Typography, LinearProgress, Grid } from '@mui/material';
import { Warning as WarnIcon } from '@mui/icons-material';
import { useExpenseData } from '../hooks/useExpenseData';
import { formatCurrency } from '../utils/helpers';
import { tokens, glassCardStatic } from '../theme';

export default function BudgetsPage() {
  const { data } = useExpenseData();
  const budgets = data?.budgets || [];
  const transactions = data?.transactions || [];

  const budgetData = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions.filter((t) => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0);
      const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      return { ...b, spent, pct };
    });
  }, [budgets, transactions]);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const totalPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>Budgets</Typography>
      <Typography variant="body2" sx={{ color: '#666666', mb: 4 }}>Manage your spending limits</Typography>

      {/* Overview */}
      <Box sx={{ ...glassCardStatic, p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFFFFF' }}>Overview</Typography>
          <Typography variant="caption" sx={{ color: totalPct > 100 ? '#FF4444' : '#999999', fontWeight: 600 }}>
            {totalPct}% used
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={Math.min(totalPct, 100)}
          sx={{ height: 4, bgcolor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { bgcolor: totalPct > 100 ? '#FF4444' : '#FFFFFF' } }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#999999' }}>{formatCurrency(totalSpent)} spent</Typography>
          <Typography variant="caption" sx={{ color: '#666666' }}>of {formatCurrency(totalBudget)}</Typography>
        </Box>
      </Box>

      {/* Category budgets */}
      <Grid container spacing={2}>
        {budgetData.map((b, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Box sx={{ ...glassCardStatic, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFF' }}>{b.category}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {b.pct > 100 && <WarnIcon sx={{ fontSize: 14, color: '#FF4444' }} />}
                  <Typography variant="caption" sx={{ color: b.pct > 100 ? '#FF4444' : '#999999', fontWeight: 600 }}>
                    {b.pct}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#666666', mb: 1.5, display: 'block' }}>
                {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
              </Typography>
              <LinearProgress variant="determinate" value={Math.min(b.pct, 100)}
                sx={{ height: 3, bgcolor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { bgcolor: b.pct > 100 ? '#FF4444' : '#FFFFFF' } }} />
              <Typography variant="caption" sx={{ color: '#666666', mt: 1, display: 'block' }}>
                {b.pct > 100 ? `Over budget by ${formatCurrency(b.spent - b.limit)}` : `${formatCurrency(b.limit - b.spent)} remaining`}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
