import { useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { tokens, glassCardStatic } from '../theme';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#FFFFFF', '#CCCCCC', '#999999', '#777777', '#555555', '#333333'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: '#1A1A1A', border: `1px solid ${tokens.borderDark}`, p: 1.5 }}>
      <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{payload[0].name}</Typography>
      <Typography variant="caption" sx={{ display: 'block', color: '#999999' }}>
        {formatCurrency(payload[0].value)}
      </Typography>
    </Box>
  );
};

export default function CategoryChart({ transactions = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const categoryData = useMemo(() => {
    const cats = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  if (categoryData.length === 0) {
    return (
      <Box sx={{ ...glassCardStatic, p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: '#666666' }}>No expense data</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...glassCardStatic, p: 3, height: '100%' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>Spending by Category</Typography>
      <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>Where your money goes</Typography>
      <Box sx={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value"
              onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(0)}>
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none"
                  style={{ opacity: i === activeIndex ? 1 : 0.6, transition: 'opacity 0.15s', cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={({ payload }) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 2 }}>
                  {payload.map((e, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, bgcolor: e.color }} />
                      <Typography variant="caption" sx={{ color: '#999999' }}>{e.value}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
