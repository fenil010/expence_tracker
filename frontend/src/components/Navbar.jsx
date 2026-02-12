import { getMonthName } from '../utils/helpers';

export default function Navbar({ user, onAddExpense }) {
  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 group cursor-pointer transition-all duration-300 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden shrink-0">
              <span className="text-xl animate-float">💎</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"/>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-neutral-900 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-indigo-500 group-hover:to-blue-500 transition-all duration-300 leading-tight">
                Expense Tracker
              </h1>
              <p className="text-xs text-neutral-500 font-medium group-hover:text-neutral-400 transition-colors duration-300 leading-tight">{getMonthName()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onAddExpense}
              className="relative overflow-hidden bg-linear-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 group whitespace-nowrap"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 group-hover:translate-x-full transition-all duration-700 transform -translate-x-full"/>
              
              <span className="text-sm group-hover:scale-110 transition-transform duration-300">+</span>
              <span className="hidden sm:inline">Add</span>
            </button>

            {/* User Avatar with interactive effects */}
            <div className="flex items-center gap-3 pl-3 border-l border-white/10 hover:border-white/20 transition-colors duration-300 group cursor-pointer">
              <div className="text-right transition-all duration-300 hidden sm:block">
                <p className="text-sm font-semibold text-neutral-900 leading-tight">{user.name}</p>
                <p className="text-xs text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300 leading-tight">{user.tier}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-400 via-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group shrink-0">
                {user.name.charAt(0)}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-25 rounded-full transition-opacity duration-300"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
