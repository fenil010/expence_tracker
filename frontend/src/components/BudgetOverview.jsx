import { Box, Typography, LinearProgress } from '@mui/material';
import { tokens, glassCardStatic } from '../theme';
import { formatCurrency } from '../utils/helpers';

export default function BudgetOverview({ budgets = [], transactions = [] }) {
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <Box sx={{ ...glassCardStatic, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFFFFF' }}>Budget</Typography>
        <Typography variant="caption" sx={{ color: pct > 100 ? '#FF4444' : '#999999', fontWeight: 600 }}>
          {pct}% used
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(pct, 100)}
        sx={{
          height: 4, bgcolor: 'rgba(255,255,255,0.06)',
          '& .MuiLinearProgress-bar': { bgcolor: pct > 100 ? '#FF4444' : '#FFFFFF' },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
        <Typography variant="caption" sx={{ color: '#999999' }}>{formatCurrency(totalSpent)} spent</Typography>
        <Typography variant="caption" sx={{ color: '#666666' }}>of {formatCurrency(totalBudget)}</Typography>
      </Box>
    </Box>
  );
}
