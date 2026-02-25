import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../ui';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const row = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function RecentTransactions({ transactions = [], className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card padding="p-0" className={className}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h3 className="text-base font-semibold text-obsidian dark:text-white">Recent Transactions</h3>
            <p className="text-xs text-drift dark:text-zinc-400 mt-1">Your latest activity</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-xs font-medium text-drift dark:text-zinc-400 hover:text-char dark:hover:text-zinc-200 transition-colors duration-200"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <motion.div variants={container} initial="hidden" animate="show">
          {transactions.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-drift dark:text-zinc-500">No transactions yet</p>
          ) : (
            <div className="divide-y divide-stone/15 dark:divide-zinc-800">
              {transactions.slice(0, 6).map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <motion.div
                    key={tx._id || tx.id}
                    variants={row}
                    whileHover={{ backgroundColor: 'rgba(232, 228, 218, 0.25)' }}
                    className="flex items-center justify-between px-6 py-4 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                        ${isIncome ? 'bg-emerald-50/60 dark:bg-emerald-950/40' : 'bg-sand/60 dark:bg-zinc-800'}
                      `}>
                        {isIncome ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-700/60 dark:text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-char dark:text-zinc-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-obsidian dark:text-zinc-200">
                          {tx.description || tx.category?.name || 'Transaction'}
                        </p>
                        <p className="text-xs text-drift dark:text-zinc-500 mt-0.5">
                          {tx.category?.name || tx.category || ''} · {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-700/70 dark:text-emerald-400' : 'text-obsidian dark:text-zinc-200'}`}>
                      {isIncome ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
}
