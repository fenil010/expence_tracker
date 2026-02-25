import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, DollarSign, TrendingDown, Target, PiggyBank } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { id: 'transaction', label: 'Add Transaction', icon: DollarSign, color: 'bg-char dark:bg-zinc-700' },
  { id: 'budget', label: 'Create Budget', icon: TrendingDown, color: 'bg-char dark:bg-zinc-700' },
  { id: 'goal', label: 'New Goal', icon: Target, color: 'bg-char dark:bg-zinc-700' },
];

export default function QuickActionButton({ onAddTransaction }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (actionId) => {
    setIsOpen(false);
    
    switch (actionId) {
      case 'transaction':
        if (onAddTransaction) {
          onAddTransaction();
        }
        break;
      case 'budget':
        navigate('/budgets');
        break;
      case 'goal':
        navigate('/goals');
        break;
      default:
        break;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { 
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 400,
                    damping: 25
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 10, 
                  scale: 0.8,
                  transition: { delay: (actions.length - index - 1) * 0.03 }
                }}
                onClick={() => handleAction(action.id)}
                className={`
                  ${action.color} text-linen dark:text-white
                  px-4 py-3 rounded-xl shadow-elevated
                  flex items-center gap-3 min-w-[180px]
                  hover:scale-105 active:scale-95
                  transition-transform duration-200
                  focus:outline-none focus:ring-2 focus:ring-obsidian/20 dark:focus:ring-zinc-600
                `}
                whileHover={{ x: -4 }}
              >
                <action.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-elevated
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-obsidian/20 dark:focus:ring-zinc-600
          transition-colors duration-200
          ${isOpen 
            ? 'bg-red-600/80 dark:bg-red-700/80 hover:bg-red-600 dark:hover:bg-red-700' 
            : 'bg-obsidian dark:bg-zinc-800 hover:bg-char dark:hover:bg-zinc-700'
          }
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
      >
        <Plus className="w-6 h-6 text-linen dark:text-white" />
      </motion.button>
    </div>
  );
}
