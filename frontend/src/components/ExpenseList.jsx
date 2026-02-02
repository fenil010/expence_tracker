import { formatCurrency, formatDate, getCategoryIcon } from '../utils/helpers';

export default function ExpenseList({ transactions }) {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Show only recent 8 transactions
  const recentTransactions = sortedTransactions.slice(0, 8);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Recent Transactions
        </h2>
        <button className="text-sm text-accent-600 font-medium hover:text-accent-700 transition-colors">
          View All
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-xl bg-neutral-50/50 hover:bg-neutral-100/50 transition-colors group"
          >
            {/* Left: Icon + Details */}
            <div className="flex items-center gap-4">
              {/* Category Icon */}
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">
                {getCategoryIcon(transaction.category)}
              </div>

              {/* Details */}
              <div>
                <p className="font-medium text-neutral-900 text-sm">
                  {transaction.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-neutral-500">
                    {transaction.category}
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-xs text-neutral-500">
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Amount */}
            <div className="text-right">
              <p className={`font-semibold text-base ${
                transaction.type === 'income'
                  ? 'text-emerald-600'
                  : 'text-neutral-900'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {recentTransactions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-neutral-500 text-sm">No transactions yet</p>
        </div>
      )}
    </div>
  );
}
