import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, DollarSign, CreditCard } from 'lucide-react';
import { formatCurrency, getDefaultCurrency } from '../../utils/currencies';
import { useCountUp } from '../../hooks/useCountUp';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const iconMap = {
  balance: Wallet,
  income: DollarSign,
  expense: CreditCard,
};

function StatCard({ label, amount, change, type }) {
  const isPositive = type === 'income' || (change && change > 0);
  const Icon = iconMap[type] || Wallet;
  const currency = getDefaultCurrency();
  
  // Count-up animation for the amount
  const animatedAmount = useCountUp(typeof amount === 'number' ? amount : 0, 1200);

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(26, 23, 20, 0.08)' }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-linen dark:bg-zinc-900 border border-stone/20 dark:border-zinc-800 rounded-2xl p-5 shadow-soft overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-drift dark:text-zinc-400 font-medium">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-sand/60 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-char dark:text-zinc-300" strokeWidth={1.8} />
        </div>
      </div>
      <div className="text-2xl font-semibold text-obsidian dark:text-white tracking-tight tabular-nums">
        {formatCurrency(animatedAmount, currency)}
      </div>
      {change !== undefined && change !== null && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium ${
            isPositive ? 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700/70 dark:text-emerald-400' : 'bg-red-50/50 dark:bg-red-950/40 text-red-700/60 dark:text-red-400'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </div>
          <span className="text-xs text-drift dark:text-zinc-500">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}

export default function BalanceCards({ balance = 0, income = 0, expenses = 0, changes = {} }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-5"
    >
      <StatCard
        label="Total Balance"
        amount={balance}
        change={changes.balance}
        type="balance"
      />
      <StatCard
        label="Income"
        amount={income}
        change={changes.income}
        type="income"
      />
      <StatCard
        label="Expenses"
        amount={expenses}
        change={changes.expenses}
        type="expense"
      />
    </motion.div>
  );
}
