import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import AddTransactionModal from '../AddTransactionModal';
import CommandPalette from '../CommandPalette';
import { ToastContainer } from '../ui/Toast';

export default function AppLayout() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Listen for openAddTransaction event from quick actions
  useEffect(() => {
    const handleOpenAddTransaction = () => {
      setShowAddTransaction(true);
    };

    window.addEventListener('openAddTransaction', handleOpenAddTransaction);
    return () => window.removeEventListener('openAddTransaction', handleOpenAddTransaction);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    } catch {
      // Ignore persistence errors.
    }
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen app-shell transition-colors duration-300">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className={`${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} min-h-screen flex flex-col transition-all duration-300`}>
        <TopNavbar
          onAddTransaction={() => setShowAddTransaction(true)}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6">
          <div className="max-w-350 mx-auto">
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
      />

      {/* Global Command Palette */}
      <CommandPalette />

      {/* Global mobile/tablet floating action button */}
      <button
        onClick={() => setShowAddTransaction(true)}
        className="fixed right-5 bottom-5 lg:hidden z-30 h-13 w-13 rounded-full bg-linear-to-br from-(--color-accent-secondary) to-(--color-accent) text-white shadow-elevated flex items-center justify-center neon-ring"
        aria-label="Add expense"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
