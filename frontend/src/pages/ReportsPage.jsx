import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Calendar, Download } from 'lucide-react';
import { PageWrapper, Card, Button, Select } from '../components/ui';
import { ChartSkeleton } from '../components/ui/Skeleton';
import { reportApi } from '../services/api';

const MONO_COLORS = ['#1A1714', '#3D3830', '#8A8275', '#C4BDB0', '#E8E4DA', '#EFECE5'];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-linen border border-stone/30 rounded-xl px-3 py-2 shadow-elevated">
      <p className="text-xs text-drift mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium text-obsidian">
          <span className="text-xs text-drift mr-1">{entry.name}:</span>
          ${Number(entry.value).toLocaleString()}
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
  const [monthlyData, setMonthlyData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [monthly, trends] = await Promise.all([
          reportApi.getMonthly(),
          reportApi.getTrends(),
        ]);

        const mData = monthly.data || [];
        setMonthlyData(Array.isArray(mData) ? mData : []);

        const tData = trends.data || {};
        setTrendData(tData.monthly || tData.trends || []);
        setCategoryData(tData.categories || tData.categoryBreakdown || []);
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
        {/* Income vs Expense Trend */}
        <motion.div custom={0} variants={itemAnim} initial="hidden" animate="show">
          <Card className="h-full">
            <h3 className="text-base font-semibold text-obsidian mb-1">Income vs Expenses</h3>
            <p className="text-xs text-drift mb-5">Monthly comparison</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C4BDB0" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="income" fill="#3D3830" radius={[6, 6, 0, 0]} barSize={20} animationDuration={600} />
                  <Bar dataKey="expenses" fill="#C4BDB0" radius={[6, 6, 0, 0]} barSize={20} animationDuration={600} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Spending Trend */}
        <motion.div custom={1} variants={itemAnim} initial="hidden" animate="show">
          <Card className="h-full">
            <h3 className="text-base font-semibold text-obsidian mb-1">Spending Trend</h3>
            <p className="text-xs text-drift mb-5">Over time</p>
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8A8275', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
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
            <h3 className="text-base font-semibold text-obsidian mb-1">Category Distribution</h3>
            <p className="text-xs text-drift mb-5">Where your money goes</p>
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
                    <span className="text-char">{item.name}</span>
                  </div>
                  <span className="font-medium text-obsidian">${Number(item.value).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        <motion.div custom={3} variants={itemAnim} initial="hidden" animate="show">
          <Card className="flex flex-col justify-between h-full">
            <div>
              <h3 className="text-base font-semibold text-obsidian mb-1">Summary</h3>
              <p className="text-xs text-drift mb-8">Key financial metrics</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Income', value: trendData.reduce?.((s, d) => s + (d.income || 0), 0) || 0 },
                { label: 'Total Expenses', value: trendData.reduce?.((s, d) => s + (d.expenses || 0), 0) || 0 },
                { label: 'Net Savings', value: trendData.reduce?.((s, d) => s + (d.income || 0) - (d.expenses || 0), 0) || 0 },
                { label: 'Avg Monthly Spend', value: trendData.length > 0 ? trendData.reduce((s, d) => s + (d.expenses || 0), 0) / trendData.length : 0 },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between py-3.5 border-b border-stone/15 last:border-0">
                  <span className="text-sm text-drift">{stat.label}</span>
                  <span className="text-sm font-semibold text-obsidian tabular-nums">
                    ${Number(stat.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
