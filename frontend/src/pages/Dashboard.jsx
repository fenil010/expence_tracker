import { useState } from 'react';
import { useExpenseData } from '../hooks/useExpenseData';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import ExpenseList from '../components/ExpenseList';
import SpendingChart from '../components/SpendingChart';
import CategoryChart from '../components/CategoryChart';
import SavingsGoals from '../components/SavingsGoals';
import BudgetOverview from '../components/BudgetOverview';
import QuickInsights from '../components/QuickInsights';
import AddExpenseModal from '../components/AddExpenseModal';

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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-500 text-lg">Loading...</div>
      </div>
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
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <Navbar
        user={data.user}
        onAddExpense={() => setShowAddModal(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards - Bento Style */}
        <div className="mb-8">
          <SummaryCards
            balance={data.balance}
            income={monthlyIncome}
            expenses={monthlyExpenses}
            savings={savings}
          />
        </div>

        {/* Quick Insights */}
        <div className="mb-8">
          <QuickInsights transactions={data.transactions} />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <SpendingChart />
            <ExpenseList transactions={data.transactions} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <BudgetOverview 
              monthlyBudget={data.monthlyBudget}
              totalExpenses={monthlyExpenses}
            />
            <CategoryChart transactions={data.transactions} />
            <SavingsGoals goals={data.goals} />
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
}
