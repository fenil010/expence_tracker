import { useState } from 'react';
import {
  Box, Typography, Avatar, Tabs, Tab, TextField, Grid,
  Divider,
} from '@mui/material';
import { tokens, glassCardStatic } from '../theme';
import { useExpenseData } from '../hooks/useExpenseData';
import { formatCurrency } from '../utils/helpers';

export default function ProfilePage() {
  const { data } = useExpenseData();
  const transactions = data?.transactions || [];
  const [tab, setTab] = useState(0);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 4 }}>Profile</Typography>

      {/* Header card */}
      <Box sx={{ ...glassCardStatic, p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: '#222222', color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 700 }}>JD</Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>John Doe</Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}>john@example.com</Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            { label: 'Transactions', value: transactions.length },
            { label: 'Total Income', value: formatCurrency(totalIncome) },
            { label: 'Total Spent', value: formatCurrency(totalExpenses) },
            { label: 'Member Since', value: 'Jan 2026' },
          ].map((s, i) => (
            <Grid size={{ xs: 6, md: 3 }} key={i}>
              <Box sx={{ py: 1 }}>
                <Typography variant="caption" sx={{ color: '#666666' }}>{s.label}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#FFFFFF' }}>{s.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ ...glassCardStatic }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: `1px solid ${tokens.borderDark}`, px: 2 }}>
          <Tab label="Personal Info" />
          <Tab label="Activity" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField fullWidth label="Full Name" defaultValue="John Doe" />
              <TextField fullWidth label="Email" defaultValue="john@example.com" />
              <TextField fullWidth label="Phone" defaultValue="+1 (555) 123-4567" />
              <TextField fullWidth label="Location" defaultValue="San Francisco, CA" />
            </Box>
          )}

          {tab === 1 && (
            <Box>
              {transactions.slice(0, 8).map((t, i) => (
                <Box key={i} sx={{ py: 1.5, borderBottom: `1px solid ${tokens.borderDark}`, display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 500 }}>{t.description}</Typography>
                    <Typography variant="caption" sx={{ color: '#666666' }}>
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: t.type === 'income' ? '#FFFFFF' : '#FF4444', fontWeight: 600 }}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
