import { formatCurrency } from '../utils/helpers';

export default function SummaryCards({ balance, income, expenses, savings }) {
  const cards = [
    {
      title: 'Total Balance',
      amount: balance,
      icon: '💰',
      trend: '+12.5%',
      trendUp: true,
      bgGradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Monthly Income',
      amount: income,
      icon: '📈',
      trend: '+8.2%',
      trendUp: true,
      bgGradient: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Monthly Expenses',
      amount: expenses,
      icon: '📊',
      trend: '-3.1%',
      trendUp: false,
      bgGradient: 'from-rose-500 to-rose-600',
    },
    {
      title: 'Savings',
      amount: savings,
      icon: '🎯',
      trend: '+15.3%',
      trendUp: true,
      bgGradient: 'from-violet-500 to-violet-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="card group cursor-pointer"
        >
          {/* Icon Badge */}
          <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${card.bgGradient} flex items-center justify-center text-2xl shadow-sm mb-4`}>
            {card.icon}
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-neutral-500 mb-2">
            {card.title}
          </p>

          {/* Amount */}
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-semibold text-neutral-900 tracking-tight">
              {formatCurrency(card.amount)}
            </h3>
            
            {/* Trend */}
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${
              card.trendUp 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-rose-50 text-rose-600'
            }`}>
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
