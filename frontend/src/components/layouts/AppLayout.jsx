import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import AddTransactionModal from '../AddTransactionModal';
import CommandPalette from '../CommandPalette';
import { ToastContainer } from '../ui/Toast';

export default function AppLayout() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  return (
    <div className="min-h-screen bg-parchment dark:bg-zinc-950 transition-colors duration-300">
      <Sidebar />

      <div className="pl-64 min-h-screen flex flex-col">
        <TopNavbar onAddTransaction={() => setShowAddTransaction(true)} />

        <main className="flex-1 px-6 lg:px-10 py-6">
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
