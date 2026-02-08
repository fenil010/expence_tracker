import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Flag as FlagIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';

const goals = [
  {
    id: 1,
    name: 'Emergency Fund',
    description: '6 months of expenses',
    current: 8500,
    target: 10000,
    icon: '🛡️',
    color: '#22c55e',
    deadline: '2024-06-30',
    status: 'on_track',
  },
  {
    id: 2,
    name: 'Vacation Fund',
    description: 'Trip to Japan',
    current: 3200,
    target: 5000,
    icon: '✈️',
    color: '#3b82f6',
    deadline: '2024-08-15',
    status: 'on_track',
  },
  {
    id: 3,
    name: 'New Car',
    description: 'Down payment',
    current: 4500,
    target: 15000,
    icon: '🚗',
    color: '#f59e0b',
    deadline: '2024-12-31',
    status: 'behind',
  },
  {
    id: 4,
    name: 'Home Renovation',
    description: 'Kitchen remodel',
    current: 12000,
    target: 20000,
    icon: '🏠',
    color: '#a855f7',
    deadline: '2024-10-01',
    status: 'on_track',
  },
  {
    id: 5,
    name: 'Investment Portfolio',
    description: 'Diversified stocks',
    current: 5500,
    target: 10000,
    icon: '📈',
    color: '#06b6d4',
    deadline: '2024-09-30',
    status: 'ahead',
  },
];

const recentContributions = [
  { id: 1, goal: 'Emergency Fund', amount: 500, date: 'Jan 14, 2024' },
  { id: 2, goal: 'Vacation Fund', amount: 300, date: 'Jan 13, 2024' },
  { id: 3, goal: 'New Car', amount: 200, date: 'Jan 12, 2024' },
];

function GoalsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);

  const getStatusChip = (status) => {
    switch (status) {
      case 'ahead':
        return <Chip label="Ahead" size="small" color="success" icon={<CelebrationIcon sx={{ fontSize: 14 }} />} />;
      case 'on_track':
        return <Chip label="On Track" size="small" color="info" variant="outlined" />;
      case 'behind':
        return <Chip label="Behind" size="small" color="warning" variant="outlined" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Savings Goals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your progress towards financial goals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          New Goal
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Saved
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                ${totalSaved.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                across all goals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Target
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                ${totalTarget.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {((totalSaved / totalTarget) * 100).toFixed(0)}% complete
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Goals Grid */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Active Goals
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {goals.map((goal) => {
          const percentage = (goal.current / goal.target) * 100;

          return (
            <Grid item xs={12} md={6} lg={4} key={goal.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => {
                  setSelectedGoal(goal);
                  setContributeDialogOpen(true);
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: `${goal.color}15`, fontSize: '1.5rem' }}>
                        {goal.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {goal.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {goal.description}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ${goal.current.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        of ${goal.target.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: `${goal.color}20`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: goal.color,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {getStatusChip(goal.status)}
                    <Chip
                      label={`${percentage.toFixed(0)}%`}
                      size="small"
                      sx={{
                        bgcolor: `${goal.color}15`,
                        color: goal.color,
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Due: {goal.deadline}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGoal(goal);
                        setContributeDialogOpen(true);
                      }}
                    >
                      Add Funds
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Recent Contributions */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Recent Contributions
      </Typography>
      <Card>
        {recentContributions.map((contribution, index) => (
          <Box key={contribution.id}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: 'success.main' }}>
                  <FlagIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {contribution.goal}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {contribution.date}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                +${contribution.amount.toLocaleString()}
              </Typography>
            </Box>
            {index < recentContributions.length - 1 && <Divider />}
          </Box>
        ))}
      </Card>

      {/* Add Goal Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Goal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Goal Name" placeholder="e.g., Emergency Fund" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" placeholder="e.g., 6 months of expenses" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Amount"
                type="number"
                InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Savings"
                type="number"
                defaultValue={0}
                InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Target Date" type="date" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select label="Icon" defaultValue="flag">
                  <MenuItem value="flag">🚩 Flag</MenuItem>
                  <MenuItem value="shield">🛡️ Shield</MenuItem>
                  <MenuItem value="plane">✈️ Plane</MenuItem>
                  <MenuItem value="car">🚗 Car</MenuItem>
                  <MenuItem value="home">🏠 Home</MenuItem>
                  <MenuItem value="chart">📈 Chart</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>Create Goal</Button>
        </DialogActions>
      </Dialog>

      {/* Contribute Dialog */}
      <Dialog open={contributeDialogOpen} onClose={() => setContributeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Funds to {selectedGoal?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                ${selectedGoal?.current.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / ${selectedGoal?.target.toLocaleString()}
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Amount to Add"
              type="number"
              placeholder="Enter amount"
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setContributeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setContributeDialogOpen(false)}>Add Funds</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GoalsPage;

