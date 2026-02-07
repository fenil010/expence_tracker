import { getMonthName } from '../utils/helpers';

export default function Navbar({ user, onAddExpense }) {
  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-neutral-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                Expense Tracker
              </h1>
              <p className="text-xs text-neutral-400 font-medium">{getMonthName()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onAddExpense}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 active:scale-95"
            >
              <span className="text-base">+</span>
              <span>Add Expense</span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-500">{user.tier} Plan</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-shadow duration-300">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
