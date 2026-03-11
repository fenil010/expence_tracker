import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import AddTransactionModal from '../AddTransactionModal';
import CommandPalette from '../CommandPalette';
import { ToastContainer } from '../ui/Toast';

export default function AppLayout() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-parchment dark:bg-zinc-950 transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <TopNavbar
          onAddTransaction={() => setShowAddTransaction(true)}
          onMenuToggle={() => setSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6">
          <div className="max-w-[1400px] mx-auto">
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

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
