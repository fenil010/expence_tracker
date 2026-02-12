import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/helpers';

export default function SpendingChart({ data }) {
  const [activeDot, setActiveDot] = useState(null);

  // Mock data for monthly spending (last 6 months)
  const chartData = [
    { month: 'Aug', amount: 3200 },
    { month: 'Sep', amount: 2800 },
    { month: 'Oct', amount: 3500 },
    { month: 'Nov', amount: 2900 },
    { month: 'Dec', amount: 3100 },
    { month: 'Jan', amount: 3453 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 113, 227, 0.2)',
            borderRadius: 16,
            padding: '16px 20px',
            boxShadow: '0 16px 48px rgba(0, 113, 227, 0.2)',
            animation: 'slideInFromBottom 0.3s ease-out',
          }}
        >
          <p 
            style={{ 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: '#1D1D1F',
              marginBottom: 4,
            }}
          >
            {label}
          </p>
          <p 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #0071E3 0%, #409CE5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="glass-card"
      style={{ 
        position: 'relative',
        borderRadius: '24px',
        padding: '28px',
        animation: 'slideInFromLeft 0.7s ease-out 0.3s both',
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
          background: 'linear-gradient(90deg, #0071E3 0%, #409CE5 100%)',
          opacity: 0.8,
        }}
      />
      
      {/* Header */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 32,
          marginTop: 6,
          gap: '16px',
        }}
      >
        <div>
          <h2 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#1D1D1F',
              letterSpacing: '-0.015em',
              marginBottom: 6,
            }}
          >
            Monthly Spending
          </h2>
          <p 
            style={{ 
              fontSize: '0.875rem', 
              color: '#86868B',
              fontWeight: 500,
            }}
          >
            Track your spending trends over time
          </p>
        </div>
        
        {/* Legend with enhanced styling */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            background: 'rgba(0, 113, 227, 0.08)',
            padding: '8px 16px',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
            }}
          >
            <div 
              style={{ 
                width: 12, 
                height: 12, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #0071E3 0%, #409CE5 100%)',
                boxShadow: '0 4px 8px rgba(0, 113, 227, 0.3)',
              }} 
            />
            <span 
              style={{ 
                fontSize: '0.875rem', 
                color: '#0071E3',
                fontWeight: 600,
              }}
            >
              Expenses
            </span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div style={{ height: 280, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onMouseEnter={(e) => setActiveDot(e.activeLabel)}
            onMouseLeave={() => setActiveDot(null)}
          >
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0071E3" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="0" 
              stroke="rgba(0, 0, 0, 0.04)"
              vertical={false}
            />
            
            <XAxis
              dataKey="month"
              tick={{ 
                fill: '#86868B', 
                fontSize: 12,
                fontWeight: 500,
              }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            
            <YAxis
              tick={{ 
                fill: '#86868B', 
                fontSize: 12,
                fontWeight: 500,
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
              dx={-10}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#0071E3"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAmount)"
              dot={{ 
                fill: '#0071E3',
                strokeWidth: 3,
                stroke: '#FFFFFF',
                r: 5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              activeDot={{ 
                r: 8,
                fill: '#0071E3',
                strokeWidth: 4,
                stroke: '#FFFFFF',
                cursor: 'pointer',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div 
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 24,
          paddingTop: 24,
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p 
            style={{ 
              fontSize: '0.75rem', 
              color: '#86868B',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            Total
          </p>
          <p 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#1D1D1F',
            }}
          >
            {formatCurrency(chartData.reduce((sum, d) => sum + d.amount, 0))}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p 
            style={{ 
              fontSize: '0.75rem', 
              color: '#86868B',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            Average
          </p>
          <p 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#1D1D1F',
            }}
          >
            {formatCurrency(Math.round(chartData.reduce((sum, d) => sum + d.amount, 0) / chartData.length))}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p 
            style={{ 
              fontSize: '0.75rem', 
              color: '#86868B',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            Highest
          </p>
          <p 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#FF375F',
            }}
          >
            {formatCurrency(Math.max(...chartData.map(d => d.amount)))}
          </p>
        </div>
      </div>
    </div>
  );
}

