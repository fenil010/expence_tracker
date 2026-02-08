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
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const budgets = [
  { id: 1, category: 'Food & Dining', spent: 650, limit: 800, color: '#22c55e', icon: '🍔' },
  { id: 2, category: 'Transportation', spent: 320, limit: 400, color: '#3b82f6', icon: '🚗' },
  { id: 3, category: 'Entertainment', spent: 180, limit: 200, color: '#a855f7', icon: '🎬' },
  { id: 4, category: 'Shopping', spent: 450, limit: 500, color: '#f59e0b', icon: '🛍️' },
  { id: 5, category: 'Utilities', spent: 290, limit: 300, color: '#06b6d4', icon: '💡' },
  { id: 6, category: 'Healthcare', spent: 150, limit: 200, color: '#ec4899', icon: '💊' },
];

const recentTransactions = [
  { id: 1, description: 'Grocery Store', amount: 85.50, category: 'Food & Dining', date: 'Today' },
  { id: 2, description: 'Gas Station', amount: 45.00, category: 'Transportation', date: 'Today' },
  { id: 3, description: 'Netflix', amount: 15.99, category: 'Entertainment', date: 'Yesterday' },
  { id: 4, description: 'Electric Bill', amount: 125.00, category: 'Utilities', date: 'Yesterday' },
];

function BudgetsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Budgets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage your spending limits
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Create Budget
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Budget</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                ${totalBudget.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Monthly spending limit
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Spent</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                ${totalSpent.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {((totalSpent / totalBudget) * 100).toFixed(0)}% of budget used
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Remaining</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                ${(totalBudget - totalSpent).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Available to spend
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget Progress Cards */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Category Budgets
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = percentage > 100;
          const isNearLimit = percentage > 80 && percentage <= 100;

          return (
            <Grid item xs={12} sm={6} md={4} key={budget.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: `${budget.color}15`, fontSize: '1.5rem' }}>
                        {budget.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {budget.category}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${budget.spent} / ${budget.limit}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: `${budget.color}20`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: isOverBudget ? 'error.main' : isNearLimit ? 'warning.main' : budget.color,
                          borderRadius: 5,
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={`${percentage.toFixed(0)}%`}
                      size="small"
                      sx={{
                        bgcolor: isOverBudget ? 'error.main' : isNearLimit ? 'warning.main' : budget.color,
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    {isOverBudget ? (
                      <Chip
                        icon={<WarningIcon sx={{ fontSize: 14 }} />}
                        label="Over budget!"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    ) : isNearLimit ? (
                      <Chip
                        label="Near limit"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                        label="On track"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Recent Spending */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Recent Spending
      </Typography>
      <Card>
        {recentTransactions.map((transaction, index) => (
          <Box key={transaction.id}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(71, 85, 105, 0.1)', fontSize: '1rem' }}>
                  💳
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {transaction.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {transaction.category} • {transaction.date}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                -${transaction.amount.toFixed(2)}
              </Typography>
            </Box>
            {index < recentTransactions.length - 1 && <Divider />}
          </Box>
        ))}
      </Card>

      {/* Add Budget Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Budget</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select label="Category">
                  <MenuItem value="food">Food & Dining</MenuItem>
                  <MenuItem value="transport">Transportation</MenuItem>
                  <MenuItem value="entertainment">Entertainment</MenuItem>
                  <MenuItem value="shopping">Shopping</MenuItem>
                  <MenuItem value="utilities">Utilities</MenuItem>
                  <MenuItem value="healthcare">Healthcare</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Budget Limit"
                type="number"
                InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Period</InputLabel>
                <Select label="Period" defaultValue="monthly">
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>Create Budget</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BudgetsPage;

