import { Box, Typography, LinearProgress, Grid } from '@mui/material';
import { useExpenseData } from '../hooks/useExpenseData';
import { formatCurrency } from '../utils/helpers';
import { tokens, glassCardStatic } from '../theme';

export default function GoalsPage() {
  const { data } = useExpenseData();
  const goals = data?.goals || [];

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>Goals</Typography>
      <Typography variant="body2" sx={{ color: '#666666', mb: 4 }}>Track your savings progress</Typography>

      <Grid container spacing={2}>
        {goals.map((goal, i) => {
          const pct = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Box sx={{ ...glassCardStatic, p: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 0.5 }}>{goal.name}</Typography>
                <Typography variant="caption" sx={{ color: '#666666', mb: 2, display: 'block' }}>
                  {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                </Typography>
                <LinearProgress variant="determinate" value={Math.min(pct, 100)}
                  sx={{ height: 4, bgcolor: 'rgba(255,255,255,0.06)', mb: 1, '& .MuiLinearProgress-bar': { bgcolor: '#FFFFFF' } }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#999999' }}>{pct}% complete</Typography>
                  <Typography variant="caption" sx={{ color: '#666666' }}>
                    {formatCurrency(goal.target - goal.current)} to go
                  </Typography>
                </Box>
                {goal.deadline && (
                  <Typography variant="caption" sx={{ color: '#555555', mt: 1, display: 'block' }}>
                    Deadline: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {goals.length === 0 && (
        <Box sx={{ ...glassCardStatic, p: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666666' }}>No savings goals yet</Typography>
        </Box>
      )}
    </Box>
  );
}
