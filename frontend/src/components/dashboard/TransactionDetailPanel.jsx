import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign } from 'lucide-react';
import { Card, Badge } from '../ui';
import { formatCurrency } from '../../utils/currencies';

function TransactionItem({ transaction }) {
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-obsidian dark:text-white truncate">
              {transaction.description || 'No description'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-3 h-3 text-drift dark:text-zinc-500" />
              <p className="text-xs text-drift dark:text-zinc-500">
                {formattedDate}
              </p>
            </div>
            {Array.isArray(transaction.tags) && transaction.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {transaction.tags.map((tag) => (
                  <Badge key={tag} size="sm" className="bg-sand/60 dark:bg-zinc-800 text-drift dark:text-zinc-400">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="ml-3 shrink-0">
            <p className={`text-sm font-semibold tabular-nums ${transaction.type === 'income'
                ? 'text-green-600 dark:text-green-400'
                : 'text-obsidian dark:text-white'
              }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), transaction.currency || 'USD')}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function TransactionDetailPanel({
  isOpen,
  onClose,
  category,
  transactions = [],
  loading = false
}) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Focus close button when panel opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else if (previousFocusRef.current) {
      // Return focus to triggering element
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        const focusableElements = panelRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed right-0 top-0 h-full w-full md:w-[400px] lg:w-[480px]
                       bg-linen dark:bg-zinc-900 shadow-elevated z-50
                       overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
          >
            {/* Header */}
            <div className="sticky top-0 bg-linen dark:bg-zinc-900 
                            border-b border-stone/20 dark:border-zinc-800 
                            px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2
                  id="panel-title"
                  className="text-lg font-semibold text-obsidian dark:text-white"
                >
                  {category}
                </h2>
                <p className="text-xs text-drift dark:text-zinc-500 mt-0.5">
                  {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2 rounded-lg text-drift dark:text-zinc-400 
                           hover:text-obsidian dark:hover:text-white
                           hover:bg-sand/50 dark:hover:bg-zinc-800 
                           transition-colors duration-200"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-sand/50 dark:bg-zinc-800 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-sand/50 dark:bg-zinc-800 
                                  flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-7 h-7 text-drift dark:text-zinc-400" />
                  </div>
                  <p className="text-sm font-medium text-char dark:text-zinc-300 mb-1">
                    No transactions yet
                  </p>
                  <p className="text-xs text-drift dark:text-zinc-500">
                    Transactions in this category will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction._id || transaction.id || index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <TransactionItem transaction={transaction} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
