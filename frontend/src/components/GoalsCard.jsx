/**
 * GoalsCard Component
 * Displays savings goals with progress bars.
 * 
 * @param {Object} props
 * @param {Array} props.goals - Array of goal objects
 */
export default function GoalsCard({ goals = [] }) {
    // Show first goal, or placeholder if none
    const primaryGoal = goals[0];

    if (!primaryGoal) {
        return (
            <div className="card">
                <p className="font-semibold text-slate-400">No goals set</p>
                <p className="text-sm text-slate-400 mt-2">Create a savings goal to track progress</p>
            </div>
        );
    }

    // Calculate progress percentage
    const progress = Math.round((primaryGoal.current / primaryGoal.target) * 100);

    // Format currency
    const formatCurrency = (amount) =>
        amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-1">
                <p className="font-semibold">{primaryGoal.name}</p>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    {progress}%
                </span>
            </div>
            <p className="text-sm text-gray-500">
                {formatCurrency(primaryGoal.current)} / {formatCurrency(primaryGoal.target)}
            </p>

            <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>

            {/* Show additional goals count if any */}
            {goals.length > 1 && (
                <p className="text-xs text-slate-400 mt-3">
                    +{goals.length - 1} more goal{goals.length > 2 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
