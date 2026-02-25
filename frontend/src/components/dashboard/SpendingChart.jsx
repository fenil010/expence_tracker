import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '../ui';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-linen dark:bg-zinc-900 border border-stone/20 dark:border-zinc-700 rounded-xl px-4 py-2.5 shadow-elevated">
      <p className="text-xs text-drift dark:text-zinc-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-obsidian dark:text-white">
          ${Number(entry.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
};

export default function SpendingChart({ data = [], className = '' }) {
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
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-sand/50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-drift dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-char dark:text-zinc-300">No spending data yet</p>
                <p className="text-xs text-drift dark:text-zinc-500 mt-1">Add transactions to see your trend</p>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D3830" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3D3830" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#C4BDB0"
                strokeOpacity={0.25}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8A8275', fontSize: 11 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8A8275', fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
                dx={-4}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#C4BDB0', strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3D3830"
                strokeWidth={2.5}
                fill="url(#spendingGradient)"
                animationDuration={1000}
                dot={false}
                activeDot={{ r: 5, fill: '#1A1714', stroke: '#F7F5F0', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
