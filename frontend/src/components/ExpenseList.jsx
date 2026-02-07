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
        <h2 className="text-xl font-bold text-neutral-900">
          Recent Transactions
        </h2>
        <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:scale-105">
          View All
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-neutral-50 to-transparent hover:from-neutral-100 hover:shadow-md transition-all duration-300 group border border-neutral-100/50"
          >
            {/* Left: Icon + Details */}
            <div className="flex items-center gap-4">
              {/* Category Icon */}
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-2xl group-hover:shadow-lg transition-shadow duration-300">
                {getCategoryIcon(transaction.category)}
              </div>

              {/* Details */}
              <div>
                <p className="font-semibold text-neutral-900 text-sm">
                  {transaction.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-neutral-500 font-medium">
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
              <p className={`font-bold text-base ${
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
          <p className="text-neutral-500 text-sm font-medium">No transactions yet</p>
        </div>
      )}
    </div>
  );
}
