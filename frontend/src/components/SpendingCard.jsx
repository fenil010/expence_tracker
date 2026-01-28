/**
 * SpendingCard Component
 * Displays monthly spending with budget progress bar.
 * 
 * @param {Object} props
 * @param {number} props.spending - Total spending this month
 * @param {number} props.remaining - Remaining budget
 * @param {number} props.budget - Monthly budget limit
 * @param {number} props.usagePercent - Budget usage percentage (0-100)
 */
export default function SpendingCard({ spending = 0, remaining = 0, budget = 0, usagePercent = 0 }) {
    // Format currency
    const formatCurrency = (amount) =>
        amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    // Determine progress bar color based on usage
    const progressColor = usagePercent > 90
        ? 'bg-red-500'
        : usagePercent > 75
            ? 'bg-orange-500'
            : 'bg-blue-500';

    // Calculate comparison to average (simplified demo)
    const avgComparison = usagePercent < 80 ? `${100 - usagePercent}% under budget` : 'On target';

    return (
        <div className="card">
            <p className="font-semibold">Spending</p>
            <h2 className="text-2xl font-semibold mt-1">{formatCurrency(spending)}</h2>
            <p className={`text-sm mt-1 ${usagePercent > 90 ? 'text-red-500' : 'text-green-600'}`}>
                {avgComparison}
            </p>

            <div className="mt-6">
                <p className="text-xs text-slate-500 mb-1">
                    Budget Used ({usagePercent}%)
                </p>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                        className={`${progressColor} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                </div>
                <p className="text-xs text-right text-slate-400 mt-1">
                    {formatCurrency(remaining)} remaining
                </p>
            </div>
        </div>
    );
}
