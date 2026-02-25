import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui';

const COLORS = ['#1A1714', '#3D3830', '#8A8275', '#C4BDB0', '#E8E4DA', '#EFECE5'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-linen dark:bg-zinc-900 border border-stone/20 dark:border-zinc-700 rounded-xl px-4 py-2.5 shadow-elevated">
      <p className="text-xs text-drift dark:text-zinc-400">{payload[0].name}</p>
      <p className="text-sm font-semibold text-obsidian dark:text-white">
        ${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default function CategoryBreakdown({ data = [], className = '' }) {
  const hasData = data.length > 0;
  const chartData = hasData ? data : [
    { name: 'No data', value: 1 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      <Card className="h-full flex flex-col" hover={false}>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-obsidian dark:text-white">By Category</h3>
          <p className="text-xs text-drift dark:text-zinc-400 mt-1">Expense distribution</p>
        </div>

        <div className="flex-1 min-h-0 relative" style={{ height: 200 }}>
          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-sand/50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-drift dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-char dark:text-zinc-300">No categories yet</p>
                <p className="text-xs text-drift dark:text-zinc-500 mt-1">Start spending to see breakdown</p>
              </div>
            </div>
          )}
          {hasData && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  animationBegin={200}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="mt-auto pt-4 space-y-2.5 border-t border-stone/15 dark:border-zinc-800">
          {data.slice(0, 5).map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-sm text-char dark:text-zinc-300">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-obsidian dark:text-white tabular-nums">
                ${Number(item.value).toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
