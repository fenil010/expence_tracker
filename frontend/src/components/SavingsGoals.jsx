import { formatCurrency, calculatePercentage } from '../utils/helpers';

export default function SavingsGoals({ goals }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Savings Goals
        </h2>
        <button className="text-sm text-accent-600 font-medium hover:text-accent-700 transition-colors">
          + New Goal
        </button>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => {
          const percentage = calculatePercentage(goal.current, goal.target);
          
          return (
            <div key={goal.id} className="space-y-3">
              {/* Goal Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    {goal.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-accent-600">
                  {percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-neutral-500 text-sm">No savings goals yet</p>
          <button className="mt-4 text-sm text-accent-600 font-medium hover:text-accent-700">
            Create your first goal
          </button>
        </div>
      )}
    </div>
  );
}
