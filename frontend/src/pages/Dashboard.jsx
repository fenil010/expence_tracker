import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Plus } from 'lucide-react';
import { PageWrapper, Card, Button, CardSkeleton, ChartSkeleton } from '../components/ui';
import SpendingMeter from '../components/ui/SpendingMeter';
import BalanceCards from '../components/dashboard/BalanceCards';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import QuickActionButton from '../components/dashboard/QuickActionButton';
import { reportApi, transactionApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function getGreeting(name) {
  const hour = new Date().getHours();
  let part;
  if (hour >= 5 && hour < 12) part = 'Good morning';
  else if (hour >= 12 && hour < 17) part = 'Good afternoon';
  else if (hour >= 17 && hour < 21) part = 'Good evening';
  else part = 'Good night';
  const firstName = name?.split(' ')[0] || 'there';
  return `${part}, ${firstName} 👋`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, txRes] = await Promise.all([
        reportApi.getDashboard(),
        transactionApi.getAll({ limit: 6, sort: '-date' }),
      ]);
      setDashboard(dashRes.data);
      setTransactions(txRes.data?.transactions || txRes.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleTransactionAdded = () => fetchData();
    window.addEventListener('transactionAdded', handleTransactionAdded);
    return () => window.removeEventListener('transactionAdded', handleTransactionAdded);
  }, []);

  if (loading) {
    return (
      <PageWrapper title="Dashboard" subtitle="Welcome back">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Dashboard" subtitle={getGreeting(user?.name)}>
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-red-50/50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-6 h-6 text-red-600/60 dark:text-red-400" />
          </div>
          <p className="text-drift dark:text-zinc-400 text-sm mb-1 font-medium">{error}</p>
          <p className="text-xs text-drift/70 dark:text-zinc-500 mb-4">Check your connection and try again</p>
          <Button onClick={fetchData} icon={RefreshCw}>Retry</Button>
        </Card>
      </PageWrapper>
    );
  }

  const balance = dashboard?.totalBalance || 0;
  const income = dashboard?.currentMonth?.income || 0;
  const expenses = dashboard?.currentMonth?.expenses || 0;
  const budgetData = dashboard?.budget;
  const monthlyBudget = budgetData?.amount || income;

  const monthlyData = (dashboard?.recentTransactions || []).map(tx => ({
    name: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: tx.amount || 0,
  })).reverse();

  const categoryData = (dashboard?.categoryBreakdown || []).map(c => ({
    name: c.categoryName || c.name || 'Other',
    value: c.total || c.value || 0,
    id: c._id || null,
  }));

  const hasData = transactions.length > 0 || income > 0 || expenses > 0;

  return (
    <PageWrapper title="Dashboard" subtitle={getGreeting(user?.name)}>
      <BalanceCards
        balance={balance}
        income={income}
        expenses={expenses}
        changes={{
          balance: null,
          income: dashboard?.comparison?.incomeChange,
          expenses: dashboard?.comparison?.expenseChange,
        }}
      />

      {/* Date range display */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <p className="text-xs text-drift dark:text-zinc-500">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>
      )}

      {/* Monthly Budget Health */}
      {monthlyBudget > 0 && (
        <div className="mb-6">
          <SpendingMeter
            spent={expenses}
            limit={monthlyBudget}
            category="Monthly Budget"
            size="lg"
            showLabels={true}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <SpendingChart data={monthlyData} className="lg:col-span-3" />
        <CategoryBreakdown data={categoryData} className="lg:col-span-2" />
      </div>

      <RecentTransactions transactions={transactions} />

      <QuickActionButton
        onAddTransaction={() => {
          window.dispatchEvent(new CustomEvent('openAddTransaction'));
        }}
      />
    </PageWrapper>
  );
}
