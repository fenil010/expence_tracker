import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Bell, ChevronDown, Command } from 'lucide-react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <header className="sticky top-0 z-30 bg-parchment/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-stone/15 dark:border-zinc-800 transition-colors duration-300">
      <div className="flex items-center justify-between h-14 px-6 lg:px-10">
        {/* Breadcrumb-style page indicator */}
        <motion.div
          key={title}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center gap-2 text-sm"
        >
          <span className="text-drift dark:text-zinc-500">Ledger</span>
          <span className="text-stone dark:text-zinc-700">/</span>
          <span className="font-medium text-char dark:text-zinc-200">{title}</span>
        </motion.div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search shortcut button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-drift dark:text-zinc-400 bg-sand/40 dark:bg-zinc-800/60 border border-stone/20 dark:border-zinc-700 hover:bg-sand/60 dark:hover:bg-zinc-800 transition-colors duration-200 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span className="text-xs hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-medium text-drift/60 dark:text-zinc-500">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}K
            </kbd>
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl text-drift dark:text-zinc-400 hover:text-char dark:hover:text-zinc-200 hover:bg-sand/50 dark:hover:bg-zinc-800 transition-colors duration-300 cursor-pointer relative"
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-obsidian dark:bg-white rounded-full" />
          </motion.button>

          {/* Add Transaction */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddTransaction}
            className="
              flex items-center gap-2 px-4 py-2
              bg-obsidian dark:bg-white text-parchment dark:text-zinc-900 text-sm font-medium
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
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-sand/50 dark:hover:bg-zinc-800 transition-colors duration-300 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-sand dark:bg-zinc-800 flex items-center justify-center">
                <span className="text-xs font-semibold text-obsidian dark:text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5 text-drift dark:text-zinc-500" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute right-0 mt-2 w-52 bg-linen dark:bg-zinc-900 border border-stone/20 dark:border-zinc-700 rounded-xl shadow-elevated overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-stone/15 dark:border-zinc-800">
                    <p className="text-sm font-medium text-obsidian dark:text-white">{user?.name}</p>
                    <p className="text-xs text-drift dark:text-zinc-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-char dark:text-zinc-300 hover:bg-sand/50 dark:hover:bg-zinc-800 transition-colors duration-200"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-char dark:text-zinc-300 hover:bg-sand/50 dark:hover:bg-zinc-800 transition-colors duration-200"
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
    </header>
  );
}
