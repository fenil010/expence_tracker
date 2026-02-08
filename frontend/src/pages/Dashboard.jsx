import { useState } from 'react';
import { useExpenseData } from '../hooks/useExpenseData';
import SummaryCards from '../components/SummaryCards';
import ExpenseList from '../components/ExpenseList';
import SpendingChart from '../components/SpendingChart';
import CategoryChart from '../components/CategoryChart';
import SavingsGoals from '../components/SavingsGoals';
import BudgetOverview from '../components/BudgetOverview';
import QuickInsights from '../components/QuickInsights';
import AddExpenseModal from '../components/AddExpenseModal';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

export default function Dashboard() {
  const {
    data,
    loading,
    addTransaction,
  } = useExpenseData();

  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddTransaction = (transaction) => {
    addTransaction(transaction);
  };

  if (loading || !data) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  // Calculate monthly income
  const monthlyIncome = data.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate monthly expenses
  const monthlyExpenses = data.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate savings
  const savings = monthlyIncome - monthlyExpenses;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's your financial overview.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddModal(true)}
        >
          Add Expense
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ mb: 3 }}>
        <SummaryCards
          balance={data.balance}
          income={monthlyIncome}
          expenses={monthlyExpenses}
          savings={savings}
        />
      </Box>

      {/* Quick Insights */}
      <Box sx={{ mb: 3 }}>
        <QuickInsights transactions={data.transactions} />
      </Box>

      {/* Main Grid Layout */}
      <Grid container spacing={3}>
        {/* Left Column - 2/3 width */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <SpendingChart />
            <ExpenseList transactions={data.transactions} />
          </Box>
        </Grid>

        {/* Right Column - 1/3 width */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <BudgetOverview 
              monthlyBudget={data.monthlyBudget}
              totalExpenses={monthlyExpenses}
            />
            <CategoryChart transactions={data.transactions} />
            <SavingsGoals goals={data.goals} />
          </Box>
        </Grid>
      </Grid>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTransaction}
      />
    </Box>
  );
}
