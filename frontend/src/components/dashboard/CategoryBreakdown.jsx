import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui';
import TransactionDetailPanel from './TransactionDetailPanel';
import { transactionApi } from '../../services/api';
import { toast } from '../ui/Toast';
import { formatCurrency, getDefaultCurrency } from '../../utils/currencies';

const COLORS = ['#1A1714', '#3D3830', '#8A8275', '#C4BDB0', '#E8E4DA', '#EFECE5'];

// Transaction cache with 5-minute expiration
const categoryCache = {};
const CACHE_DURATION = 5 * 60 * 1000;

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const currency = getDefaultCurrency();
  return (
    <div className="bg-linen dark:bg-zinc-900 border border-stone/20 dark:border-zinc-700 rounded-xl px-4 py-2.5 shadow-elevated">
      <p className="text-xs text-drift dark:text-zinc-400">{payload[0].name}</p>
      <p className="text-sm font-semibold text-obsidian dark:text-white">
        {formatCurrency(Number(payload[0].value), currency)}
      </p>
    </div>
  );
};

export default function CategoryBreakdown({ data = [], className = '' }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryTransactions, setCategoryTransactions] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currency = getDefaultCurrency();

  const hasData = data.length > 0;
  const chartData = hasData ? data : [
    { name: 'No data', value: 1 },
  ];

  // Check cache for transactions
  const getCachedTransactions = (category) => {
    const cached = categoryCache[category];
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      delete categoryCache[category];
      return null;
    }
    
    return cached.transactions;
  };

  // Set cache for transactions
  const setCachedTransactions = (category, transactions) => {
    categoryCache[category] = {
      transactions,
      fetchedAt: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION
    };
  };

  // Handle category click
  const handleCategoryClick = async (entry) => {
    if (!entry || entry.name === 'No data') return;
    
    setSelectedCategory(entry.name);
    setPanelOpen(true);
    setError(null);
    
    // Check cache first
    const cached = getCachedTransactions(entry.name);
    if (cached) {
      setCategoryTransactions(cached);
      return;
    }
    
    // Fetch from API
    setLoading(true);
    try {
      const res = await transactionApi.getAll({
        category: entry.name,
        sort: '-date',
        limit: 100
      });
      const transactions = res.data?.transactions || [];
      setCategoryTransactions(transactions);
      setCachedTransactions(entry.name, transactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Unable to load transactions. Please try again.');
      toast('Failed to load transactions', 'error');
      setCategoryTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle panel close
  const handlePanelClose = () => {
    setPanelOpen(false);
    setError(null);
  };

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

        <div className="flex-1 min-h-0 relative" style={{ minHeight: 240 }}>
          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sand/60 to-stone/30 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-7 h-7 text-char dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-obsidian dark:text-white mb-2">No Categories Yet</p>
                <p className="text-sm text-drift dark:text-zinc-400 mb-4">Add transactions with categories to see your spending breakdown</p>
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
          {hasData && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={800}
                  animationBegin={200}
                  onClick={handleCategoryClick}
                  cursor="pointer"
                >
                  {chartData.map((_, index) => (
                    <Cell 
                      key={index} 
                      fill={COLORS[index % COLORS.length]}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                      }}
                      className="hover:scale-105"
                    />
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
            <motion.button
              key={item.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
              onClick={() => handleCategoryClick(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCategoryClick(item);
                }
              }}
              className="w-full flex items-center justify-between p-2 -mx-2 rounded-lg
                         hover:bg-sand/50 dark:hover:bg-zinc-800/50
                         focus:outline-none focus:ring-2 focus:ring-obsidian/20 dark:focus:ring-zinc-700
                         transition-colors duration-200 cursor-pointer"
              tabIndex={0}
              aria-label={`View ${item.name} transactions, ${formatCurrency(Number(item.value), currency)} spent`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  aria-hidden="true"
                />
                <span className="text-sm text-char dark:text-zinc-300">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-obsidian dark:text-white tabular-nums">
                {formatCurrency(Number(item.value), currency)}
              </span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Transaction Detail Panel */}
      <TransactionDetailPanel
        isOpen={panelOpen}
        onClose={handlePanelClose}
        category={selectedCategory || ''}
        transactions={categoryTransactions}
        loading={loading}
      />
    </motion.div>
  );
}
