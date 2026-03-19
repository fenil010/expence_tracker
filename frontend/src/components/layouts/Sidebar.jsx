import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/accounts', icon: CreditCard, label: 'Accounts' },
  { to: '/budgets', icon: Wallet, label: 'Budgets' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const navItemVariants = {
  hidden: { x: -12, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.35 } },
};

export default function Sidebar({ isOpen = false, onClose }) {
  const { logout, user } = useAuth();
  const { pathname } = useLocation();

  const handleNavClick = () => {
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <motion.aside
      initial="hidden"
      animate="show"
      variants={sidebarVariants}
      className="fixed left-0 top-0 bottom-0 w-64 bg-linen/80 dark:bg-zinc-900/70 backdrop-blur-xl border-r border-white/30 dark:border-zinc-800/80 flex flex-col z-40 transition-colors duration-300"
    >
      {/* Logo + mobile close */}
      <div className="px-6 py-7 flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-xl font-semibold text-obsidian dark:text-white tracking-tight"
        >
          Ledger<span className="text-drift dark:text-zinc-500">.</span>
        </motion.h1>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-drift dark:text-zinc-400 hover:text-char dark:hover:text-zinc-200 hover:bg-sand/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <motion.div key={to} variants={navItemVariants}>
              <NavLink
                to={to}
                end={to === '/'}
                className="relative block"
                onClick={handleNavClick}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className={`
                    flex items-center gap-3 px-3 py-2.5
                    rounded-xl text-sm font-medium
                    transition-colors duration-300 ease-smooth
                    ${isActive
                      ? 'bg-(--color-accent)/10 dark:bg-(--color-accent)/20 text-(--color-accent) shadow-soft dark:shadow-none'
                      : 'text-drift dark:text-zinc-400 hover:text-char dark:hover:text-zinc-200 hover:bg-sand/40 dark:hover:bg-zinc-800/60'
                    }
                  `}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-(--color-accent) rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 border-t border-stone/20 dark:border-zinc-800" />

      {/* User + Logout */}
      <motion.div
        variants={navItemVariants}
        className="p-4 space-y-3"
      >
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-sand dark:bg-zinc-800 flex items-center justify-center">
            <span className="text-xs font-semibold text-obsidian dark:text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-obsidian dark:text-zinc-100 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-drift dark:text-zinc-500 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5
            rounded-xl text-sm text-drift dark:text-zinc-400
            hover:bg-sand/40 dark:hover:bg-zinc-800/60 hover:text-char dark:hover:text-zinc-200
            transition-colors duration-300 cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" strokeWidth={1.8} />
          <span>Log out</span>
        </motion.button>
      </motion.div>
    </motion.aside>
  );

  return (
    <>
      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile sidebar - shown via overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={onClose}
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-y-0 left-0 z-40 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
