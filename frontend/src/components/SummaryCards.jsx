import { formatCurrency } from '../utils/helpers';

export default function SummaryCards({ balance, income, expenses, savings }) {
  const cards = [
    {
      title: 'Total Balance',
      amount: balance,
      trend: '+12.5%',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #1D1D1F 0%, #424245 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(29, 29, 31, 0.08) 0%, rgba(66, 66, 69, 0.04) 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      title: 'Monthly Income',
      amount: income,
      trend: '+8.2%',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #30D158 0%, #63E375 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(48, 209, 88, 0.08) 0%, rgba(99, 227, 117, 0.04) 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      title: 'Monthly Expenses',
      amount: expenses,
      trend: '-3.1%',
      trendUp: false,
      gradient: 'linear-gradient(135deg, #FF375F 0%, #FF637D 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(255, 55, 95, 0.08) 0%, rgba(255, 99, 125, 0.04) 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      title: 'Savings',
      amount: savings,
      trend: '+15.3%',
      trendUp: true,
      gradient: 'linear-gradient(135deg, #0071E3 0%, #409CE5 100%)',
      bgGradient: 'linear-gradient(135deg, rgba(0, 113, 227, 0.08) 0%, rgba(64, 156, 229, 0.04) 100%)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-lg cursor-pointer flex flex-col h-full"
          style={{ 
            background: card.bgGradient,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            padding: '24px',
            animation: `slideInFromBottom 0.6s ease-out ${index * 100}ms both`,
          }}
        >
          {/* Gradient accent bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: card.gradient,
              opacity: 0.8,
            }}
          />
          
          {/* Floating particles effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 100,
              height: 100,
              background: `radial-gradient(circle, ${card.gradient.split('deg, ')[1]} 0%, transparent 70%)`,
              opacity: 0.1,
              borderRadius: '50%',
              filter: 'blur(40px)',
              transform: 'translate(30px, -30px)',
              transition: 'all 0.3s ease',
            }}
            className="group-hover:translate-x-2 group-hover:translate-y-0"
          />
          
          {/* Icon Badge */}
          <div 
            className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 shrink-0"
            style={{ 
              background: card.gradient,
              color: 'white',
              boxShadow: `0 4px 12px ${card.gradient.split(', ')[1].split(' ')[0]}30`,
            }}
          >
            {card.icon}
          </div>

          {/* Title */}
          <p 
            className="text-xs font-semibold mb-2 transition-colors duration-300"
            style={{ 
              color: '#86868B',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.65rem',
              lineHeight: '1.2',
            }}
          >
            {card.title}
          </p>

          {/* Amount & Trend Container */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Amount */}
            <h3 
              className="text-2xl font-bold tracking-tight transition-all duration-300"
              style={{ 
                color: '#1D1D1F',
                lineHeight: '1.2',
              }}
            >
              {formatCurrency(card.amount)}
            </h3>
            
            {/* Trend Badge */}
            <div className="mt-auto">
              <span 
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all duration-300 group-hover:scale-105"
                style={{ 
                  backgroundColor: card.trendUp 
                    ? 'rgba(48, 209, 88, 0.12)' 
                    : 'rgba(255, 55, 95, 0.12)',
                  color: card.trendUp 
                    ? '#22B14C' 
                    : '#E02A4D',
                }}
              >
                {card.trend}
                {card.trendUp ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-300">
                    <path d="M7 14l5-5 5 5z"/>
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-300">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                )}
              </span>
            </div>
          </div>

          {/* Shimmer effect on hover */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              transition: 'left 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              pointerEvents: 'none',
            }}
            className="group-hover:animate-slide-in-right"
          />
        </div>
      ))}
    </div>
  );
}

