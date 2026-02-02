import { formatCurrency } from '../utils/helpers';

export default function QuickInsights({ transactions }) {
  // Calculate this month's data
  const currentMonth = new Date().getMonth();
  const thisMonthTransactions = transactions.filter(t => {
    const transactionMonth = new Date(t.date).getMonth();
    return transactionMonth === currentMonth;
  });

  // Most spent category
  const categoryTotals = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  // Average transaction
  const avgTransaction = thisMonthTransactions.length > 0
    ? thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0) / thisMonthTransactions.length
    : 0;

  // Total transactions count
  const transactionCount = thisMonthTransactions.length;

  const insights = [
    {
      label: 'Top Category',
      value: topCategory ? topCategory[0] : 'None',
      sublabel: topCategory ? formatCurrency(topCategory[1]) : '',
      icon: '🏆',
    },
    {
      label: 'Avg. Transaction',
      value: formatCurrency(avgTransaction),
      sublabel: `${transactionCount} total`,
      icon: '📊',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {insights.map((insight, index) => (
        <div key={index} className="card">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{insight.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 mb-1">{insight.label}</p>
              <p className="text-base font-semibold text-neutral-900 truncate">
                {insight.value}
              </p>
              {insight.sublabel && (
                <p className="text-xs text-neutral-400 mt-0.5">{insight.sublabel}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
