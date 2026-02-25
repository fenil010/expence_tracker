import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Calendar, Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { PageWrapper, Card, Button, Select } from '../components/ui';
import { ChartSkeleton } from '../components/ui/Skeleton';
import { reportApi } from '../services/api';
import { formatCurrency, getDefaultCurrency } from '../utils/currencies';

const MONO_COLORS = ['#1A1714', '#3D3830', '#8A8275', '#C4BDB0', '#E8E4DA', '#EFECE5'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const currency = getDefaultCurrency();
  return (
    <div className="bg-linen dark:bg-zinc-900 border border-stone/30 dark:border-zinc-700 rounded-xl px-3 py-2 shadow-elevated">
      <p className="text-xs text-drift dark:text-zinc-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium text-obsidian dark:text-white">
          <span className="text-xs text-drift dark:text-zinc-500 mr-1">{entry.name}:</span>
          {formatCurrency(Number(entry.value), currency)}
        </p>
      ))}
    </div>
  );
};

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'area'
  const [monthlyData, setMonthlyData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const currency = getDefaultCurrency();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [monthly, trends] = await Promise.all([
          reportApi.getMonthly(),
          reportApi.getTrends(),
        ]);

        const mData = monthly.data || {};
        const dailyTrend = (mData.dailyTrend || []).map(d => ({
          name: `Day ${d.day}`,
          amount: (d.expense || 0) + (d.income || 0),
        }));
        setMonthlyData(dailyTrend);

        const tData = trends.data || {};
        const trendItems = (tData.trends || []).map(t => {
          const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            name: `${monthNames[t.month] || t.month} ${t.year}`,
            income: t.income || 0,
            expenses: t.expense || 0,
            expense: t.expense || 0,
            net: t.net || 0,
          };
        });
        setTrendData(trendItems);

        const catData = (mData.categoryBreakdown || []).map(c => ({
          name: c.name || c.categoryName || 'Other',
          value: c.total || 0,
        }));
        setCategoryData(catData);
      } catch (err) {
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [period]);

  if (loading) {
    return (
      <PageWrapper title="Reports" subtitle="Detailed financial analytics">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </PageWrapper>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: trendData,
      margin: { top: 4, right: 4, left: -20, bottom: 0 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#C4BDB0" strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} tickFormatter={(v) => `${v}`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-char dark:text-zinc-300">{value === 'income' ? 'Income' : 'Expenses'}</span>}
            />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} animationDuration={600} name="income" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} animationDuration={600} name="expenses" />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#C4BDB0" strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} tickFormatter={(v) => `${v}`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-char dark:text-zinc-300">{value === 'income' ? 'Income' : 'Expenses'}</span>}
            />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGradient)" animationDuration={800} name="income" />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGradient)" animationDuration={800} name="expenses" />
          </AreaChart>
        );
      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#C4BDB0" strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} tickFormatter={(v) => `${v}`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-char dark:text-zinc-300">{value === 'income' ? 'Income' : 'Expenses'}</span>}
            />
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} animationDuration={600} name="income" />
            <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20} animationDuration={600} name="expenses" />
          </BarChart>
        );
    }
  };

  return (
    <PageWrapper
      title="Reports"
      subtitle="Detailed financial analytics"
      action={
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
          <Button variant="secondary" icon={Download} size="sm">
            Export
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Trend with Chart Switcher */}
        <motion.div custom={0} variants={itemAnim} initial="hidden" animate="show">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-obsidian dark:text-white mb-1">Income vs Expenses</h3>
                <p className="text-xs text-drift dark:text-zinc-400">Monthly comparison</p>
              </div>
              
              {/* Chart type switcher */}
              <div className="flex items-center gap-1 bg-sand/50 dark:bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-1.5 rounded transition-colors duration-200 ${
                    chartType === 'bar' 
                      ? 'bg-linen dark:bg-zinc-900 text-obsidian dark:text-white' 
                      : 'text-drift dark:text-zinc-500 hover:text-char dark:hover:text-zinc-300'
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`p-1.5 rounded transition-colors duration-200 ${
                    chartType === 'line' 
                      ? 'bg-linen dark:bg-zinc-900 text-obsidian dark:text-white' 
                      : 'text-drift dark:text-zinc-500 hover:text-char dark:hover:text-zinc-300'
                  }`}
                  title="Line Chart"
                >
                  <LineChartIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`p-1.5 rounded transition-colors duration-200 ${
                    chartType === 'area' 
                      ? 'bg-linen dark:bg-zinc-900 text-obsidian dark:text-white' 
                      : 'text-drift dark:text-zinc-500 hover:text-char dark:hover:text-zinc-300'
                  }`}
                  title="Area Chart"
                >
                  <PieChartIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="h-72">
              <AnimatePresence mode="wait">
                <motion.div
                  key={chartType}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Spending Trend */}
        <motion.div custom={1} variants={itemAnim} initial="hidden" animate="show">
          <Card className="h-full">
            <h3 className="text-base font-semibold text-obsidian dark:text-white mb-1">Spending Trend</h3>
            <p className="text-xs text-drift dark:text-zinc-400 mb-5">Over time</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3D3830" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#3D3830" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C4BDB0" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="#3D3830" strokeWidth={2} fill="url(#reportGradient)" animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div custom={2} variants={itemAnim} initial="hidden" animate="show">
          <Card className="h-full">
            <h3 className="text-base font-semibold text-obsidian dark:text-white mb-1">Category Distribution</h3>
            <p className="text-xs text-drift dark:text-zinc-400 mb-5">Where your money goes</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.length > 0 ? categoryData : [{ name: 'No data', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {(categoryData.length > 0 ? categoryData : [{ name: 'No data', value: 1 }]).map((_, index) => (
                      <Cell key={index} fill={MONO_COLORS[index % MONO_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1.5">
              {categoryData.slice(0, 5).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: MONO_COLORS[i] }} />
                    <span className="text-char dark:text-zinc-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-obsidian dark:text-white">{formatCurrency(Number(item.value), currency)}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        <motion.div custom={3} variants={itemAnim} initial="hidden" animate="show">
          <Card className="flex flex-col justify-between h-full">
            <div>
              <h3 className="text-base font-semibold text-obsidian dark:text-white mb-1">Summary</h3>
              <p className="text-xs text-drift dark:text-zinc-400 mb-8">Key financial metrics</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Income', value: trendData.reduce?.((s, d) => s + (d.income || 0), 0) || 0 },
                { label: 'Total Expenses', value: trendData.reduce?.((s, d) => s + (d.expenses || 0), 0) || 0 },
                { label: 'Net Savings', value: trendData.reduce?.((s, d) => s + (d.income || 0) - (d.expenses || 0), 0) || 0 },
                { label: 'Avg Monthly Spend', value: trendData.length > 0 ? trendData.reduce((s, d) => s + (d.expenses || 0), 0) / trendData.length : 0 },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-3.5 border-b border-stone/15 dark:border-zinc-800 last:border-0">
                  <span className="text-sm text-drift dark:text-zinc-400">{stat.label}</span>
                  <span className="text-sm font-semibold text-obsidian dark:text-white tabular-nums">
                    {formatCurrency(Number(stat.value), currency)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
