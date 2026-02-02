import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/helpers';

export default function SpendingChart({ data }) {
  // Mock data for monthly spending (last 6 months)
  const chartData = [
    { month: 'Aug', amount: 3200 },
    { month: 'Sep', amount: 2800 },
    { month: 'Oct', amount: 3500 },
    { month: 'Nov', amount: 2900 },
    { month: 'Dec', amount: 3100 },
    { month: 'Jan', amount: 3453 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl px-4 py-2 shadow-md">
          <p className="text-sm font-semibold text-neutral-900">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-neutral-500">{payload[0].payload.month}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">
          Monthly Spending
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-sm bg-accent-500"></div>
          <span className="text-neutral-600">Expenses</span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#737373', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#737373', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5' }} />
            <Bar
              dataKey="amount"
              fill="#5c7cfa"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
