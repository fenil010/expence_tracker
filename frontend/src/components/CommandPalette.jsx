import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, ArrowLeftRight, Wallet, Target,
  BarChart3, Settings, User, Sun, Moon, Monitor, LogOut,
  Command,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const paletteVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0, scale: 0.95, y: -10,
    transition: { duration: 0.15 },
  },
};

const navCommands = [
  { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, path: '/', section: 'Navigation' },
  { id: 'nav-transactions', label: 'Go to Transactions', icon: ArrowLeftRight, path: '/transactions', section: 'Navigation' },
  { id: 'nav-budgets', label: 'Go to Budgets', icon: Wallet, path: '/budgets', section: 'Navigation' },
  { id: 'nav-goals', label: 'Go to Goals', icon: Target, path: '/goals', section: 'Navigation' },
  { id: 'nav-reports', label: 'Go to Reports', icon: BarChart3, path: '/reports', section: 'Navigation' },
  { id: 'nav-settings', label: 'Go to Settings', icon: Settings, path: '/settings', section: 'Navigation' },
  { id: 'nav-profile', label: 'Go to Profile', icon: User, path: '/profile', section: 'Navigation' },
];

const themeCommands = [
  { id: 'theme-light', label: 'Switch to Light Mode', icon: Sun, action: 'theme-light', section: 'Theme' },
  { id: 'theme-dark', label: 'Switch to Dark Mode', icon: Moon, action: 'theme-dark', section: 'Theme' },
  { id: 'theme-system', label: 'Use System Theme', icon: Monitor, action: 'theme-system', section: 'Theme' },
];

const actionCommands = [
  { id: 'action-logout', label: 'Log Out', icon: LogOut, action: 'logout', section: 'Actions' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { logout } = useAuth();

  const allCommands = useMemo(() => [
    ...navCommands,
    ...themeCommands,
    ...actionCommands,
  ], []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter((cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.section.toLowerCase().includes(q)
    );
  }, [query, allCommands]);

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((cmd) => {
      if (!map.has(cmd.section)) map.set(cmd.section, []);
      map.get(cmd.section).push(cmd);
    });
    return map;
  }, [filtered]);

  // Open/close with Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset active index on filter change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const executeCommand = (cmd) => {
    setOpen(false);
    if (cmd.path) {
      navigate(cmd.path);
    } else if (cmd.action === 'theme-light') {
      setTheme('light');
    } else if (cmd.action === 'theme-dark') {
      setTheme('dark');
    } else if (cmd.action === 'theme-system') {
      setTheme('system');
    } else if (cmd.action === 'logout') {
      logout();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        executeCommand(filtered[activeIndex]);
      }
    }
  };

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-obsidian/30 dark:bg-obsidian/60 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            variants={paletteVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-linen dark:bg-zinc-900 border border-stone/30 dark:border-zinc-700 rounded-2xl shadow-elevated overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone/20 dark:border-zinc-700">
              <Search className="w-4.5 h-4.5 text-drift dark:text-zinc-400 shrink-0" strokeWidth={1.8} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-sm text-char dark:text-zinc-100 placeholder:text-drift/60 dark:placeholder:text-zinc-500 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-drift dark:text-zinc-500 bg-sand/60 dark:bg-zinc-800 border border-stone/30 dark:border-zinc-600 rounded-md">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-72 overflow-y-auto py-2 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-drift dark:text-zinc-500">No results found</p>
                </div>
              ) : (
                Array.from(grouped.entries()).map(([section, cmds]) => (
                  <div key={section}>
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-drift/70 dark:text-zinc-500 uppercase tracking-wider">
                      {section}
                    </p>
                    {cmds.map((cmd) => {
                      flatIndex++;
                      const idx = flatIndex;
                      const isActive = idx === activeIndex;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          data-index={idx}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-2.5
                            text-sm text-left transition-colors duration-100
                            cursor-pointer
                            ${isActive
                              ? 'bg-sand/60 dark:bg-zinc-800 text-obsidian dark:text-white'
                              : 'text-char dark:text-zinc-300 hover:bg-sand/40 dark:hover:bg-zinc-800/60'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4 shrink-0 opacity-60" strokeWidth={1.8} />
                          <span className="flex-1 truncate">{cmd.label}</span>
                          {cmd.path && (
                            <span className="text-[10px] text-drift/50 dark:text-zinc-600">{cmd.path}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-stone/15 dark:border-zinc-700 text-[10px] text-drift/60 dark:text-zinc-600">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-sand/50 dark:bg-zinc-800 border border-stone/20 dark:border-zinc-700 rounded text-[9px]">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-sand/50 dark:bg-zinc-800 border border-stone/20 dark:border-zinc-700 rounded text-[9px]">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-sand/50 dark:bg-zinc-800 border border-stone/20 dark:border-zinc-700 rounded text-[9px]">esc</kbd>
                Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
