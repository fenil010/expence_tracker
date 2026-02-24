import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/goals': 'Goals',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'Profile',
};

export default function TopNavbar({ onAddTransaction }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const title = pageTitles[pathname] || 'Dashboard';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-30 bg-parchment/80 backdrop-blur-xl border-b border-stone/15">
      <div className="flex items-center justify-between h-14 px-6 lg:px-10">
        {/* Breadcrumb-style page indicator */}
        <motion.div
          key={title}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center gap-2 text-sm"
        >
          <span className="text-drift">Ledger</span>
          <span className="text-stone">/</span>
          <span className="font-medium text-char">{title}</span>
        </motion.div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2.5 rounded-xl text-drift hover:text-char hover:bg-sand/50 transition-colors duration-300 cursor-pointer"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl text-drift hover:text-char hover:bg-sand/50 transition-colors duration-300 cursor-pointer relative"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-obsidian rounded-full" />
          </motion.button>

          {/* Add Transaction */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddTransaction}
            className="
              flex items-center gap-2 px-4 py-2
              bg-obsidian text-parchment text-sm font-medium
              rounded-xl hover:opacity-90
              transition-all duration-300 cursor-pointer
            "
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </motion.button>

          {/* Avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-sand/50 transition-colors duration-300 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-sand flex items-center justify-center">
                <span className="text-xs font-semibold text-obsidian">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5 text-drift" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute right-0 mt-2 w-52 bg-linen border border-stone/20 rounded-xl shadow-elevated overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-stone/15">
                    <p className="text-sm font-medium text-obsidian">{user?.name}</p>
                    <p className="text-xs text-drift truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-char hover:bg-sand/50 transition-colors duration-200"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-char hover:bg-sand/50 transition-colors duration-200"
                    >
                      Settings
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search bar (expandable) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden border-t border-stone/10"
          >
            <div className="px-6 lg:px-10 py-3">
              <div className="relative max-w-lg">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-drift" />
                <input
                  ref={searchRef}
                  placeholder="Search transactions, categories..."
                  className="w-full pl-10 pr-4 py-2.5 bg-parchment border border-stone/30 rounded-xl text-sm text-char placeholder:text-drift/50 focus:outline-none focus:border-char/50 transition-colors duration-300"
                  onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
