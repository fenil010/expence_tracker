import { getMonthName } from '../utils/helpers';

export default function Navbar({ user, onAddExpense }) {
  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-xl">💎</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
                Expense Tracker
              </h1>
              <p className="text-sm text-neutral-500">{getMonthName()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onAddExpense}
              className="btn-primary flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>Add Expense</span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-500">{user.tier} Plan</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium shadow-sm">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
