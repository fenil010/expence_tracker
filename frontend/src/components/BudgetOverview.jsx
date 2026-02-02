import { formatCurrency } from '../utils/helpers';

export default function BudgetOverview({ monthlyBudget, totalExpenses }) {
  const remaining = monthlyBudget - totalExpenses;
  const percentageUsed = Math.round((totalExpenses / monthlyBudget) * 100);
  const isOverBudget = percentageUsed > 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">
          Budget Overview
        </h2>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
          isOverBudget 
            ? 'bg-rose-50 text-rose-600' 
            : percentageUsed > 80
            ? 'bg-amber-50 text-amber-600'
            : 'bg-emerald-50 text-emerald-600'
        }`}>
          {percentageUsed}% Used
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-linear-to-r from-rose-500 to-rose-600'
                : percentageUsed > 80
                ? 'bg-linear-to-r from-amber-500 to-amber-600'
                : 'bg-linear-to-r from-emerald-500 to-emerald-600'
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-neutral-500 mb-1">Budget</p>
          <p className="text-base font-semibold text-neutral-900">
            {formatCurrency(monthlyBudget)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-1">Spent</p>
          <p className="text-base font-semibold text-neutral-900">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-1">Remaining</p>
          <p className={`text-base font-semibold ${
            remaining < 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      </div>
    </div>
  );
}
