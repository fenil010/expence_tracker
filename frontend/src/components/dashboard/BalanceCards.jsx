import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, DollarSign, CreditCard } from 'lucide-react';

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

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(26, 23, 20, 0.08)' }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-linen border border-stone/20 rounded-2xl p-5 shadow-soft overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-drift font-medium">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-sand/60 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-char" strokeWidth={1.8} />
        </div>
      </div>
      <div className="text-2xl font-semibold text-obsidian tracking-tight">
        ${typeof amount === 'number' ? amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
      </div>
      {change !== undefined && change !== null && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium ${
            isPositive ? 'bg-emerald-50/60 text-emerald-700/70' : 'bg-red-50/50 text-red-700/60'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </div>
          <span className="text-xs text-drift">vs last month</span>
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
