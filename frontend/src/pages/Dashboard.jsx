import { useState, useEffect } from 'react';
import { PageWrapper, CardSkeleton, ChartSkeleton } from '../components/ui';
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
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchData = async () => {
    try {
      const [dashRes, txRes] = await Promise.all([
        reportApi.getDashboard(),
        transactionApi.getAll({ limit: 6, sort: '-date' }),
      ]);
      setDashboard(dashRes.data);
      setTransactions(txRes.data?.transactions || txRes.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for transaction added events
    const handleTransactionAdded = () => {
      fetchData();
    };

    window.addEventListener('transactionAdded', handleTransactionAdded);
    return () => window.removeEventListener('transactionAdded', handleTransactionAdded);
  }, []);

  if (loading) {
    return (
      <PageWrapper title="Dashboard" subtitle="Welcome back">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </PageWrapper>
    );
  }

  const balance = dashboard?.totalBalance || 0;
  const income = dashboard?.currentMonth?.income || 0;
  const expenses = dashboard?.currentMonth?.expenses || 0;
  const monthlyBudget = dashboard?.monthlyBudget || income; // Use income as default budget if not set
  const monthlyData = dashboard?.recentTransactions?.map(tx => ({
    name: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: tx.amount || 0,
  })) || [];
  const categoryData = (dashboard?.categoryBreakdown || []).map(c => ({
    name: c.categoryName || c.name || 'Other',
    value: c.total || c.value || 0,
  }));

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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <SpendingChart data={monthlyData} className="lg:col-span-3" />
        <CategoryBreakdown data={categoryData} className="lg:col-span-2" />
      </div>

      <RecentTransactions transactions={transactions} />

      {/* Quick Action Floating Button */}
      <QuickActionButton
        onAddTransaction={() => {
          // Trigger global add transaction modal
          window.dispatchEvent(new CustomEvent('openAddTransaction'));
        }}
      />
    </PageWrapper>
  );
}
