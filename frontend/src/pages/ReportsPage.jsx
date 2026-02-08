import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as IncomeIcon,
  ShoppingCart as ExpenseIcon,
  Savings as SavingsIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

const monthlyData = [
  { month: 'Aug', income: 4200, expenses: 2800, savings: 1400 },
  { month: 'Sep', income: 4500, expenses: 3100, savings: 1400 },
  { month: 'Oct', income: 4100, expenses: 2900, savings: 1200 },
  { month: 'Nov', income: 4800, expenses: 3200, savings: 1600 },
  { month: 'Dec', income: 5200, expenses: 3800, savings: 1400 },
  { month: 'Jan', income: 4900, expenses: 3400, savings: 1500 },
];

const categoryBreakdown = [
  { name: 'Food & Dining', amount: 850, percentage: 25, color: '#22c55e' },
  { name: 'Housing', amount: 1200, percentage: 35, color: '#3b82f6' },
  { name: 'Transportation', amount: 400, percentage: 12, color: '#f59e0b' },
  { name: 'Utilities', amount: 250, percentage: 7, color: '#06b6d4' },
  { name: 'Entertainment', amount: 300, percentage: 9, color: '#a855f7' },
  { name: 'Shopping', amount: 350, percentage: 10, color: '#ec4899' },
  { name: 'Other', amount: 100, percentage: 3, color: '#64748b' },
];

const topExpenses = [
  { id: 1, name: 'Rent Payment', amount: 1200, category: 'Housing', date: 'Jan 1, 2024' },
  { id: 2, name: 'Grocery Shopping', amount: 450, category: 'Food & Dining', date: 'Jan 12, 2024' },
  { id: 3, name: 'Electric Bill', amount: 180, category: 'Utilities', date: 'Jan 10, 2024' },
  { id: 4, name: 'Internet Service', amount: 120, category: 'Utilities', date: 'Jan 5, 2024' },
  { id: 5, name: 'Gas Station', amount: 95, category: 'Transportation', date: 'Jan 14, 2024' },
];

function ReportsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('overview');

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalSavings = monthlyData.reduce((sum, m) => sum + m.savings, 0);
  const avgSavingsRate = ((totalSavings / totalIncome) * 100).toFixed(1);

  const maxIncome = Math.max(...monthlyData.map(m => m.income));
  const maxExpenses = Math.max(...monthlyData.map(m => m.expenses));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed financial insights and spending analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={timeRange}
              label="Period"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={reportType}
            exclusive
            onChange={(e, v) => v && setReportType(v)}
            size="small"
          >
            <ToggleButton value="overview">Overview</ToggleButton>
            <ToggleButton value="income">Income</ToggleButton>
            <ToggleButton value="expenses">Expenses</ToggleButton>
          </ToggleButtonGroup>
          <Chip
            icon={<DownloadIcon sx={{ fontSize: 16 }} />}
            label="Export"
            clickable
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: 'success.main' }}>
                  <IncomeIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Income</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ${totalIncome.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                  +12.5%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: 'error.main' }}>
                  <ExpenseIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                    ${totalExpenses.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingDownIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                  -5.2%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(71, 85, 105, 0.1)', color: 'primary.main' }}>
                  <SavingsIcon />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Net Savings</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ${totalSavings.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                  +8.3%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Savings Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {avgSavingsRate}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={parseFloat(avgSavingsRate)}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Target: 20%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Monthly Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Monthly Trends
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Income vs Expenses (Last 6 Months)
                </Typography>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  {monthlyData.map((data, index) => (
                    <Box key={data.month} sx={{ flex: 1, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', justifyContent: 'center', height: 120 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: `${(data.income / maxIncome) * 100}%`,
                            bgcolor: 'success.main',
                            borderRadius: 1,
                            minHeight: 20,
                            transition: 'all 0.3s ease',
                          }}
                        />
                        <Box
                          sx={{
                            width: 28,
                            height: `${(data.expenses / maxExpenses) * 100}%`,
                            bgcolor: 'error.main',
                            borderRadius: 1,
                            minHeight: 20,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {data.month}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 0.5 }} />
                  <Typography variant="caption">Income</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: 0.5 }} />
                  <Typography variant="caption">Expenses</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Spending by Category
              </Typography>
              {categoryBreakdown.map((category) => (
                <Box key={category.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, bgcolor: category.color, borderRadius: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {category.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ${category.amount}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={category.percentage}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: `${category.color}15`,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: category.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Expenses Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Top Expenses This Month
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topExpenses.map((expense) => (
                      <TableRow
                        key={expense.id}
                        sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {expense.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={expense.category} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {expense.date}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                            ${expense.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'rgba(71, 85, 105, 0.04)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                💡 Insights & Recommendations
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                      ✓ Great Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your savings rate increased by 3% compared to last month. Keep up the good work!
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'warning.main', mb: 1 }}>
                      ⚠ Watch Out
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Food & Dining expenses are 15% higher than your monthly average.
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.main', mb: 1 }}>
                      💡 Suggestion
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Consider setting up automatic transfers to your savings goals on payday.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ReportsPage;

