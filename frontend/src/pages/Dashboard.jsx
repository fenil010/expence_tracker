import { useState } from 'react';
import { useExpenseData } from '../hooks/useExpenseData';
import SummaryCards from '../components/SummaryCards';
import SpendingChart from '../components/SpendingChart';
import CategoryChart from '../components/CategoryChart';
import SavingsGoals from '../components/SavingsGoals';
import BudgetOverview from '../components/BudgetOverview';
import AddExpenseModal from '../components/AddExpenseModal';
import {
  Box,
  Typography,
  Button,
  Grid,
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1D1D1F 0%, #424245 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              boxShadow: '0 8px 24px rgba(29, 29, 31, 0.3)',
              animation: 'pulse 2s infinite',
            }}
          >
            💎
          </Box>
          <Typography
            sx={{
              fontSize: '0.9375rem',
              color: '#86868B',
              fontWeight: 500,
            }}
          >
            Loading your financial data...
          </Typography>
        </Box>
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

  // Get recent transactions for the list
  const recentTransactions = [...data.transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <Box sx={{ paddingBottom: 40 }}>
      {/* Header with animation */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 48,
          animation: 'slideInFromLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: '#1D1D1F',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 10,
              fontSize: { xs: '1.875rem', md: '2.25rem' },
            }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#86868B',
              fontWeight: 500,
              fontSize: '1rem',
            }}
          >
            Welcome back! Here's your financial overview.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddModal(true)}
          sx={{
            background: 'linear-gradient(135deg, #1D1D1F 0%, #424245 100%)',
            boxShadow: '0 8px 24px rgba(29, 29, 31, 0.25)',
            padding: '12px 28px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            borderRadius: '12px',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '&:hover': {
              boxShadow: '0 12px 32px rgba(29, 29, 31, 0.35)',
              transform: 'translateY(-3px)',
            },
            '&:active': {
              transform: 'scale(0.96)',
            },
          }}
        >
          Add Expense
        </Button>
      </Box>

      {/* Summary Cards with staggered animation */}
      <Box sx={{ marginBottom: 40 }}>
        <SummaryCards
          balance={data.balance}
          income={monthlyIncome}
          expenses={monthlyExpenses}
          savings={savings}
        />
      </Box>

      {/* Main Grid Layout with animation */}
      <Grid container spacing={40} sx={{ mt: 2 }}>
        {/* Left Column - 2/3 width */}
        <Grid item xs={12} lg={8}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
              animation: 'slideInFromLeft 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
            }}
          >
            <SpendingChart />
            
            {/* Recent Transactions */}
            <Box
              className="glass-card"
              sx={{
                borderRadius: '24px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Gradient accent bar */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, #1D1D1F 0%, #424245 100%)',
                  opacity: 0.8,
                }}
              />
              
              {/* Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 28,
                  marginTop: 4,
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#1D1D1F',
                    letterSpacing: '-0.015em',
                  }}
                >
                  Recent Transactions
                </Typography>
                <Button
                  variant="text"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#0071E3',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 113, 227, 0.08)',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  View All
                </Button>
              </Box>

              {/* Transactions List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentTransactions.map((transaction, index) => {
                  const isIncome = transaction.type === 'income';
                  const Icon = transaction.icon || '💰';
                  
                  return (
                    <Box
                      key={transaction.id || index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '14px',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        cursor: 'pointer',
                        animation: `slideInFromLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.3 + index * 0.1}s both`,
                        '&:hover': {
                          backgroundColor: isIncome
                            ? 'rgba(48, 209, 88, 0.08)'
                            : 'rgba(255, 55, 95, 0.08)',
                          transform: 'translateX(8px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '14px',
                            backgroundColor: isIncome
                              ? 'rgba(48, 209, 88, 0.15)'
                              : 'rgba(255, 55, 95, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 4px 12px ${isIncome ? 'rgba(48, 209, 88, 0.2)' : 'rgba(255, 55, 95, 0.2)'}`,
                          }}
                        >
                          {Icon}
                        </Box>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: '0.9375rem',
                              fontWeight: 600,
                              color: '#1D1D1F',
                              marginBottom: 4,
                            }}
                          >
                            {transaction.description}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              color: '#86868B',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            {transaction.category}
                            <span>•</span>
                            {transaction.date}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: isIncome ? '#22B14C' : '#E02A4D',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Column - 1/3 width */}
        <Grid item xs={12} lg={4}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
              animation: 'slideInFromRight 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both',
            }}
          >
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

// Helper function for currency formatting
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

