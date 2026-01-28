/**
 * Transactions Component
 * Displays recent transactions with Add Transaction button.
 * 
 * @param {Object} props
 * @param {Array} props.transactions - Array of transaction objects
 * @param {Function} props.onAddTransaction - Callback to trigger Add Transaction modal
 */
export default function Transactions({ transactions = [], onAddTransaction }) {
    // Format currency
    const formatCurrency = (amount, type) => {
        const prefix = type === 'income' ? '+' : '-';
        return `${prefix}$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    // Format date relative
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Category icons (emoji for simplicity)
    const categoryIcon = {
        Salary: '💼',
        Freelance: '💻',
        Investment: '📈',
        Gift: '🎁',
        Food: '🍔',
        Transport: '🚗',
        Shopping: '🛍️',
        Entertainment: '🎬',
        Bills: '📄',
        Health: '💊',
        Other: '📌',
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Recent Transactions</h3>
                <button
                    onClick={onAddTransaction}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 py-1 rounded-full transition"
                >
                    + Add
                </button>
            </div>

            {transactions.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">
                    No transactions yet
                </p>
            ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                                    {categoryIcon[tx.category] || '📌'}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{tx.description}</p>
                                    <p className="text-xs text-slate-400">
                                        {tx.category} • {formatDate(tx.date)}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-slate-700'
                                }`}>
                                {formatCurrency(tx.amount, tx.type)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
