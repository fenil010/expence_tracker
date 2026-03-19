import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Plus } from 'lucide-react';
import { PageWrapper, Card, Button, Badge, CardSkeleton, ChartSkeleton } from '../components/ui';
import SpendingMeter from '../components/ui/SpendingMeter';
import BalanceCards from '../components/dashboard/BalanceCards';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import QuickActionButton from '../components/dashboard/QuickActionButton';
import { reportApi, transactionApi, notificationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getDefaultCurrency } from '../utils/currencies';
import InsightsPanel from '../components/dashboard/InsightsPanel';
import AlertsPanel from '../components/dashboard/AlertsPanel';

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
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const handleMarkAllAlertsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })));
    } catch (err) {
      console.error('Failed to mark alerts read:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, txRes, insightsRes, alertsRes] = await Promise.all([
        reportApi.getDashboard(),
        transactionApi.getAll({ limit: 6, sort: '-date' }),
        reportApi.getInsights(),
        notificationApi.getAll({ limit: 6, type: 'budget_alert' })
      ]);
      setDashboard(dashRes.data);
      setTransactions(txRes.data?.transactions || txRes.data || []);
      setInsights(insightsRes.data?.insights || []);
      setAlerts(alertsRes.data || []);
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
  const currency = getDefaultCurrency();
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

  const topCategory = categoryData.reduce((top, current) => {
    if (!top || current.value > top.value) return current;
    return top;
  }, null);
  const topShare = expenses > 0 && topCategory ? Math.round((topCategory.value / expenses) * 100) : 0;

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
        <CategoryBreakdown
          data={categoryData}
          className="lg:col-span-2"
          highlightName={topCategory?.name}
        />
      </div>

      {topCategory && (
        <Card variant="glass" className="relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-drift/80 dark:text-zinc-500">
                Top Category Highlight
              </p>
              <h3 className="text-xl font-semibold text-obsidian dark:text-white mt-2">
                {topCategory.name}
              </h3>
              <p className="text-sm text-drift dark:text-zinc-400 mt-1">
                {formatCurrency(topCategory.value, currency)} spent this month
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-(--color-accent)/15 text-(--color-accent)">
                {topShare}% of expenses
              </Badge>
              <span className="text-xs text-drift dark:text-zinc-500">Based on category totals</span>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-(--color-accent)/15 blur-3xl" />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <InsightsPanel insights={insights} />
        <AlertsPanel alerts={alerts} onMarkAllRead={handleMarkAllAlertsRead} />
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
