import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Bot, Send, Sparkles, Wand2 } from 'lucide-react';
import { PageWrapper, Card, Button, Select, Input } from '../components/ui';
import { ChartSkeleton } from '../components/ui/Skeleton';
import { aiApi, reportApi, transactionApi } from '../services/api';
import { formatCurrency, getDefaultCurrency } from '../utils/currencies';
import { useTheme } from '../context/ThemeContext';

const MONO_COLORS = ['#1A1714', '#3D3830', '#8A8275', '#C4BDB0', '#E8E4DA', '#EFECE5'];
const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

const EmptyChartState = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
    <div className="w-12 h-12 rounded-2xl bg-sand/40 dark:bg-zinc-800 flex items-center justify-center mb-3">
      <BarChart3 className="w-5 h-5 text-drift dark:text-zinc-500" />
    </div>
    <p className="text-sm text-drift dark:text-zinc-500 font-medium">No data available</p>
    <p className="text-xs text-drift/60 dark:text-zinc-600 mt-1">Add transactions to see {title.toLowerCase()}</p>
  </div>
);

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ReportsPage() {
  const { resolved } = useTheme();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  const [monthlyData, setMonthlyData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Ask your expenses. Example: What category increased most this month?' },
  ]);
  const [prediction, setPrediction] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const currency = getDefaultCurrency();
  const isDark = resolved === 'dark';

  const chartPalette = useMemo(() => ({
    grid: isDark ? '#3B456D' : '#C4BDB0',
    axis: isDark ? '#A8B2D8' : '#8A8275',
    income: '#10b981',
    expense: isDark ? '#fb7185' : '#ef4444',
    spendingStroke: isDark ? '#7DD3FC' : '#3D3830',
    pie: isDark
      ? ['#E2E8FF', '#BDC9FF', '#9FADF8', '#7F8DE8', '#6172CC', '#4456A8']
      : MONO_COLORS,
  }), [isDark]);

  const formatAxisValue = (value) => {
    const num = Number(value) || 0;
    if (Math.abs(num) >= 1000) {
      return `${Math.round(num / 1000)}k`;
    }
    return `${Math.round(num)}`;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('authToken');
      const API_BASE = import.meta.env.VITE_API_URL || 'https://expence-tracker-zorf.onrender.com/api';
      const url = new URL(`${API_BASE}/reports/export/csv`);
      url.searchParams.set('period', period);

      const response = await fetch(url.toString(), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const csvContent = await response.text();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', `transactions_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const handlePdfExport = () => {
    const content = [
      'FinTrack AI Insights',
      `Period: ${period}`,
      ...summaryStats.map((item) => `${item.label}: ${formatCurrency(Number(item.value), currency)}`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `insights_${period}_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [primaryReport, trends, predictionRes, recentRes] = await Promise.all([
          period === 'yearly' ? reportApi.getYearly({}) : reportApi.getMonthly({}),
          reportApi.getTrends({ months: period === 'yearly' ? 24 : 6 }),
          aiApi.getPredictions({ months: 6 }),
          transactionApi.getAll({ limit: 5, sort: '-date', type: 'expense' }),
        ]);

        const reportData = primaryReport.data || {};

        if (period === 'yearly') {
          const yearlySpending = (reportData.monthlyBreakdown || []).map(m => ({
            name: MONTH_NAMES[m.month] || `M${m.month}`,
            amount: Number(m.expense || 0),
          }));
          setMonthlyData(yearlySpending);
        } else {
          const dailySpending = (reportData.dailyTrend || []).map(d => ({
            name: `Day ${d.day}`,
            amount: Number(d.expense || 0),
          }));
          setMonthlyData(dailySpending);
        }

        const tData = trends.data || {};
        const trendItems = (tData.trends || []).map(t => {
          return {
            name: `${MONTH_NAMES[t.month] || t.month} ${t.year}`,
            income: Number(t.income || 0),
            expenses: Number(t.expense || 0),
            expense: Number(t.expense || 0),
            net: Number(t.net || 0),
          };
        });
        setTrendData(trendItems);

        const catData = (reportData.categoryBreakdown || [])
          .filter((c) => (c.type ? c.type === 'expense' : true))
          .map(c => ({
          name: c.name || c.categoryName || 'Other',
          value: Number(c.total || 0),
        }))
          .filter((c) => c.value > 0);
        setCategoryData(catData);

        setPrediction(predictionRes.data || null);

        const recentExpenses = (recentRes.data?.transactions || recentRes.data || [])
          .filter((tx) => tx.type === 'expense')
          .slice(0, 3);

        if (recentExpenses.length > 0) {
          const categorized = await Promise.allSettled(
            recentExpenses.map((tx) => aiApi.categorize({
              description: tx.description || '',
              merchant: tx.merchant || '',
            }))
          );

          const normalized = categorized
            .map((result, index) => {
              if (result.status !== 'fulfilled') return null;
              const data = result.value?.data;
              if (!data) return null;
              return {
                merchant: recentExpenses[index]?.merchant || recentExpenses[index]?.description || 'Transaction',
                category: data.categoryName || 'Other',
                confidence: Math.round((data.confidence || 0) * 100),
              };
            })
            .filter(Boolean);

          setSuggestions(normalized);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [period]);

  // Summary stats computed from trend data
  const summaryStats = useMemo(() => [
    { label: 'Total Income', value: trendData.reduce?.((s, d) => s + (d.income || 0), 0) || 0 },
    { label: 'Total Expenses', value: trendData.reduce?.((s, d) => s + (d.expenses || 0), 0) || 0 },
    { label: 'Net Savings', value: trendData.reduce?.((s, d) => s + (d.income || 0) - (d.expenses || 0), 0) || 0 },
    { label: 'Avg Monthly Spend', value: trendData.length > 0 ? trendData.reduce((s, d) => s + (d.expenses || 0), 0) / trendData.length : 0 },
    {
      label: 'Predicted Next Month',
      value: prediction?.predictedNextMonthExpense || 0,
      isPrediction: true,
    },
  ], [trendData, prediction]);

  if (loading) {
    return (
      <PageWrapper title="AI Insights" subtitle="Advanced analytics and AI guidance">
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
      margin: { top: 8, right: 8, left: 8, bottom: 0 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartPalette.axis, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: chartPalette.axis, fontSize: 12 }} tickFormatter={formatAxisValue} width={44} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-char dark:text-zinc-300">{value === 'income' ? 'Income' : 'Expenses'}</span>}
            />
            <Line type="monotone" dataKey="income" stroke={chartPalette.income} strokeWidth={2.5} dot={{ r: 4 }} animationDuration={600} name="income" />
            <Line type="monotone" dataKey="expenses" stroke={chartPalette.expense} strokeWidth={2.5} dot={{ r: 4 }} animationDuration={600} name="expenses" />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartPalette.income} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartPalette.income} stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartPalette.expense} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartPalette.expense} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartPalette.axis, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: chartPalette.axis, fontSize: 12 }} tickFormatter={formatAxisValue} width={44} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-char dark:text-zinc-300">{value === 'income' ? 'Income' : 'Expenses'}</span>}
            />
            <Area type="monotone" dataKey="income" stroke={chartPalette.income} strokeWidth={2} fill="url(#incomeGradient)" animationDuration={800} name="income" />
            <Area type="monotone" dataKey="expenses" stroke={chartPalette.expense} strokeWidth={2} fill="url(#expenseGradient)" animationDuration={800} name="expenses" />
          </AreaChart>
        );
      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} strokeOpacity={0.3} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartPalette.axis, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: chartPalette.axis, fontSize: 12 }} tickFormatter={formatAxisValue} width={44} />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-char dark:text-zinc-300">{value === 'income' ? 'Income' : 'Expenses'}</span>}
            />
            <Bar dataKey="income" fill={chartPalette.income} radius={[6, 6, 0, 0]} barSize={20} animationDuration={600} name="income" />
            <Bar dataKey="expenses" fill={chartPalette.expense} radius={[6, 6, 0, 0]} barSize={20} animationDuration={600} name="expenses" />
          </BarChart>
        );
    }
  };

  const handleAsk = async () => {
    const question = chatInput.trim();
    if (!question) return;
    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);
    setAiBusy(true);

    try {
      const response = await aiApi.chat(question);
      const answer = response.data?.answer || 'I could not find enough data to answer that yet.';
      setChatMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', text: 'AI is temporarily unavailable. Please try again.' }]);
    } finally {
      setAiBusy(false);
    }

    setChatInput('');
  };

  return (
    <PageWrapper
      title="AI Insights"
      subtitle="Advanced analytics, auto-categorization, and ask-your-expenses assistant"
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
          <Button variant="secondary" icon={Download} size="sm" onClick={handleExport} loading={exporting}>
            CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePdfExport}>PDF</Button>
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
                <p className="text-xs text-drift dark:text-zinc-400">
                  {period === 'yearly' ? 'Yearly' : 'Monthly'} comparison
                </p>
              </div>

              {/* Chart type switcher */}
              <div className="flex items-center gap-1 bg-sand/50 dark:bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-1.5 rounded transition-colors duration-200 cursor-pointer ${chartType === 'bar'
                    ? 'bg-linen dark:bg-zinc-900 text-obsidian dark:text-white'
                    : 'text-drift dark:text-zinc-500 hover:text-char dark:hover:text-zinc-300'
                    }`}
                  title="Bar Chart"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`p-1.5 rounded transition-colors duration-200 cursor-pointer ${chartType === 'line'
                    ? 'bg-linen dark:bg-zinc-900 text-obsidian dark:text-white'
                    : 'text-drift dark:text-zinc-500 hover:text-char dark:hover:text-zinc-300'
                    }`}
                  title="Line Chart"
                >
                  <LineChartIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType('area')}
                  className={`p-1.5 rounded transition-colors duration-200 cursor-pointer ${chartType === 'area'
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
              {trendData.length === 0 ? (
                <EmptyChartState title="trends" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Spending Trend */}
        <motion.div custom={1} variants={itemAnim} initial="hidden" animate="show">
          <Card className="h-full">
            <h3 className="text-base font-semibold text-obsidian dark:text-white mb-1">Spending Trend</h3>
            <p className="text-xs text-drift dark:text-zinc-400 mb-5">Over time</p>
            <div className="h-72">
              {monthlyData.length === 0 ? (
                <EmptyChartState title="spending data" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartPalette.spendingStroke} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={chartPalette.spendingStroke} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.grid} strokeOpacity={0.3} vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartPalette.axis, fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartPalette.axis, fontSize: 12 }} tickFormatter={formatAxisValue} width={44} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="amount" stroke={chartPalette.spendingStroke} strokeWidth={2} fill="url(#reportGradient)" animationDuration={800} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div custom={2} variants={itemAnim} initial="hidden" animate="show">
          <Card className="h-full">
            <h3 className="text-base font-semibold text-obsidian dark:text-white mb-1">Category Distribution</h3>
            <p className="text-xs text-drift dark:text-zinc-400 mb-5">Where your money goes</p>
            <div className="h-72">
              {categoryData.length === 0 ? (
                <EmptyChartState title="categories" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={600}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={index} fill={chartPalette.pie[index % chartPalette.pie.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {categoryData.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {categoryData.slice(0, 5).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartPalette.pie[i % chartPalette.pie.length] }} />
                      <span className="text-char dark:text-zinc-300">{item.name}</span>
                    </div>
                    <span className="font-medium text-obsidian dark:text-white">{formatCurrency(Number(item.value), currency)}</span>
                  </div>
                ))}
              </div>
            )}
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
              {summaryStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-3.5 border-b border-stone/15 dark:border-zinc-800 last:border-0">
                  <span className="text-sm text-drift dark:text-zinc-400">{stat.label}</span>
                  <span className={`text-sm font-semibold tabular-nums ${stat.label === 'Net Savings' && stat.value < 0
                      ? 'text-red-600/70 dark:text-red-400'
                      : stat.isPrediction
                        ? 'text-cyan-600 dark:text-cyan-300'
                        : 'text-obsidian dark:text-white'
                    }`}>
                    {formatCurrency(Number(stat.value), currency)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-4 h-4 text-cyan-300" />
            <h3 className="text-base font-semibold text-obsidian dark:text-white">Auto-Categorization</h3>
          </div>
          <div className="space-y-2">
            {(suggestions.length ? suggestions : [
              { merchant: 'Swiggy Order', category: 'Food', confidence: 72 },
              { merchant: 'Uber Trip', category: 'Transport', confidence: 69 },
            ]).map((item) => (
              <div key={item.merchant} className="rounded-lg bg-sand/30 dark:bg-zinc-800/50 border border-stone/20 dark:border-zinc-700 px-3 py-2">
                <p className="text-sm text-char dark:text-zinc-200">{item.merchant}</p>
                <p className="text-xs text-drift dark:text-zinc-500">Suggest: {item.category}</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-300">Confidence: {item.confidence}%</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4 text-cyan-300" />
            <h3 className="text-base font-semibold text-obsidian dark:text-white">Ask Your Expenses</h3>
            <Sparkles className="w-4 h-4 text-cyan-300 ml-auto" />
          </div>

          <div className="rounded-xl bg-sand/30 dark:bg-zinc-800/50 border border-stone/20 dark:border-zinc-700 p-3 space-y-2 max-h-64 overflow-auto">
            {chatMessages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg px-3 py-2 text-xs ${message.role === 'assistant'
                  ? 'bg-accent/15 text-char dark:text-zinc-100'
                  : 'bg-zinc-900 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900 ml-8'
                }`}
              >
                {message.text}
              </motion.div>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Ask: Why did transport rise this month?"
            />
            <Button icon={Send} onClick={handleAsk}>Ask</Button>
          </div>
          {aiBusy && <p className="mt-2 text-xs text-drift dark:text-zinc-400">AI is thinking...</p>}
        </Card>
      </div>
    </PageWrapper>
  );
}
