import { Box, Typography, LinearProgress } from '@mui/material';
import { tokens, glassCardStatic } from '../theme';
import { formatCurrency } from '../utils/helpers';

export default function SavingsGoals({ goals = [] }) {
  if (goals.length === 0) {
    return (
      <Box sx={{ ...glassCardStatic, p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 1 }}>Goals</Typography>
        <Typography variant="body2" sx={{ color: '#666666' }}>No savings goals yet</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...glassCardStatic, p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 2 }}>Goals</Typography>
      {goals.map((goal, i) => {
        const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
        return (
          <Box key={i} sx={{ mb: i < goals.length - 1 ? 2.5 : 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFFFFF' }}>{goal.name}</Typography>
              <Typography variant="caption" sx={{ color: '#999999' }}>{pct}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(pct, 100)}
              sx={{
                height: 4, bgcolor: 'rgba(255,255,255,0.06)',
                '& .MuiLinearProgress-bar': { bgcolor: '#FFFFFF' },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#666666' }}>{formatCurrency(goal.current)}</Typography>
              <Typography variant="caption" sx={{ color: '#666666' }}>{formatCurrency(goal.target)}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
