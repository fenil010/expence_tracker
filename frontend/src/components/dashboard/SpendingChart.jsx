import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '../ui';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, getDefaultCurrency } from '../../utils/currencies';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const currency = getDefaultCurrency();
  return (
    <div className="bg-linen dark:bg-zinc-900 border border-stone/20 dark:border-zinc-700 rounded-xl px-4 py-2.5 shadow-elevated">
      <p className="text-xs text-drift dark:text-zinc-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-obsidian dark:text-white">
          {formatCurrency(Number(entry.value), currency)}
        </p>
      ))}
    </div>
  );
};

export default function SpendingChart({ data = [], className = '' }) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';

  // Define color palettes for light and dark modes
  const colors = {
    gradient: {
      start: isDark ? '#71717a' : '#3D3830',  // zinc-500 : char
      stop: isDark ? '#71717a' : '#3D3830',
    },
    stroke: isDark ? '#a1a1aa' : '#3D3830',  // zinc-400 : char
    grid: isDark ? '#3f3f46' : '#C4BDB0',    // zinc-700 : stone
    tick: isDark ? '#a1a1aa' : '#8A8275',    // zinc-400 : drift
    cursor: isDark ? '#52525b' : '#C4BDB0',  // zinc-600 : stone
    activeDot: {
      fill: isDark ? '#fafafa' : '#1A1714',  // zinc-50 : obsidian
      stroke: isDark ? '#18181b' : '#F7F5F0', // zinc-900 : parchment
    },
  };

  const hasData = data.length > 0 && data.some(d => d.amount > 0);
  const chartData = data.length > 0 ? data : [
    { name: 'Jan', amount: 0 },
    { name: 'Feb', amount: 0 },
    { name: 'Mar', amount: 0 },
    { name: 'Apr', amount: 0 },
    { name: 'May', amount: 0 },
    { name: 'Jun', amount: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      <Card className="h-full" hover={false}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-obsidian dark:text-white">Spending Overview</h3>
            <p className="text-xs text-drift dark:text-zinc-400 mt-1">Monthly spending trend</p>
          </div>
        </div>

        <div className="relative" style={{ height: 280 }}>
          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sand/60 to-stone/30 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-7 h-7 text-char dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-obsidian dark:text-white mb-2">No Spending Data</p>
                <p className="text-sm text-drift dark:text-zinc-400 mb-4">Start tracking your expenses to see spending trends over time</p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openAddTransaction'))}
                  className="inline-flex items-center gap-2 px-4 py-2 whitespace-nowrap bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent)]/90 text-linen dark:text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all duration-300"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="flex-shrink-0">Add Transaction</span>
                </button>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.gradient.start} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={colors.gradient.stop} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grid}
                strokeOpacity={0.25}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.tick, fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.tick, fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.cursor, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={colors.stroke}
                strokeWidth={2.5}
                fill="url(#spendingGradient)"
                animationDuration={1000}
                dot={false}
                activeDot={{ r: 5, fill: colors.activeDot.fill, stroke: colors.activeDot.stroke, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
