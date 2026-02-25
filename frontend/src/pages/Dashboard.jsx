import { useState, useEffect } from 'react';
import { PageWrapper, CardSkeleton, ChartSkeleton } from '../components/ui';
import BalanceCards from '../components/dashboard/BalanceCards';
import SpendingChart from '../components/dashboard/SpendingChart';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { reportApi, transactionApi } from '../services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
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
    fetchData();
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
  const monthlyData = dashboard?.recentTransactions?.map(tx => ({
    name: new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: tx.amount || 0,
  })) || [];
  const categoryData = (dashboard?.categoryBreakdown || []).map(c => ({
    name: c.categoryName || c.name || 'Other',
    value: c.total || c.value || 0,
  }));

  return (
    <PageWrapper title="Dashboard" subtitle="Your financial overview">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <SpendingChart data={monthlyData} className="lg:col-span-3" />
        <CategoryBreakdown data={categoryData} className="lg:col-span-2" />
      </div>

      <RecentTransactions transactions={transactions} />
    </PageWrapper>
  );
}
