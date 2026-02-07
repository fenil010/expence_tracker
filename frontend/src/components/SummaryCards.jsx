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
          className="card group cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border border-neutral-100/50"
        >
          {/* Icon Badge */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.bgGradient} flex items-center justify-center text-3xl shadow-md group-hover:shadow-lg transition-shadow duration-300 mb-4`}>
            {card.icon}
          </div>

          {/* Title */}
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
            {card.title}
          </p>

          {/* Amount */}
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-neutral-900 tracking-tight">
              {formatCurrency(card.amount)}
            </h3>
            
            {/* Trend */}
            <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${
              card.trendUp 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-rose-100 text-rose-700'
            }`}>
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
