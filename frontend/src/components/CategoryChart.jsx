import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/helpers';

export default function CategoryChart({ transactions }) {
  // Calculate spending by category
  const categoryData = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, transaction) => {
      const existing = acc.find((item) => item.name === transaction.category);
      if (existing) {
        existing.value += transaction.amount;
      } else {
        acc.push({
          name: transaction.category,
          value: transaction.amount,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 categories

  // Color palette - soft, Apple-inspired colors
  const COLORS = [
    '#5c7cfa', // accent blue
    '#748ffc',
    '#91a7ff',
    '#a5b8ff',
    '#bac8ff',
    '#d0d9ff',
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-xl px-4 py-2 shadow-md">
          <p className="text-sm font-semibold text-neutral-900">
            {payload[0].name}
          </p>
          <p className="text-xs text-neutral-500">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-neutral-600">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (categoryData.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">
          Spending by Category
        </h2>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-neutral-500 text-sm">No expense data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">
        Spending by Category
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
