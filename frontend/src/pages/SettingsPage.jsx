import { useState } from 'react';
import {
  Box, Typography, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, TextField, Switch, Select, MenuItem, FormControl, InputLabel, Grid,
} from '@mui/material';
import {
  Person as ProfileIcon, Notifications as NotifIcon,
  Security as SecurityIcon, Palette as ThemeIcon,
  CreditCard as PaymentIcon,
} from '@mui/icons-material';
import { tokens, glassCardStatic } from '../theme';

const sections = [
  { label: 'Profile', icon: <ProfileIcon /> },
  { label: 'Notifications', icon: <NotifIcon /> },
  { label: 'Security', icon: <SecurityIcon /> },
  { label: 'Appearance', icon: <ThemeIcon /> },
  { label: 'Billing', icon: <PaymentIcon /> },
];

export default function SettingsPage() {
  const [active, setActive] = useState(0);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>Settings</Typography>
      <Typography variant="body2" sx={{ color: '#666666', mb: 4 }}>Manage your preferences</Typography>

      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ ...glassCardStatic }}>
            <List disablePadding>
              {sections.map((s, i) => (
                <ListItemButton key={i} selected={active === i} onClick={() => setActive(i)}
                  sx={{ borderLeft: active === i ? '2px solid #FFFFFF' : '2px solid transparent' }}>
                  <ListItemIcon sx={{ minWidth: 36, color: active === i ? '#FFFFFF' : '#666666' }}>{s.icon}</ListItemIcon>
                  <ListItemText primary={s.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: active === i ? 600 : 400 }} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Grid>

        {/* Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Box sx={{ ...glassCardStatic, p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 3 }}>{sections[active].label}</Typography>

            {active === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField fullWidth label="Full Name" defaultValue="John Doe" />
                <TextField fullWidth label="Email" defaultValue="john@example.com" />
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select defaultValue="USD" label="Currency">
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            {active === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['Email notifications', 'Push notifications', 'Budget alerts', 'Weekly summary'].map((label, i) => (
                  <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: `1px solid ${tokens.borderDark}` }}>
                    <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{label}</Typography>
                    <Switch defaultChecked={i < 2} />
                  </Box>
                ))}
              </Box>
            )}

            {active === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField fullWidth label="Current Password" type="password" />
                <TextField fullWidth label="New Password" type="password" />
                <TextField fullWidth label="Confirm Password" type="password" />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                  <Typography variant="body2" sx={{ color: '#FFFFFF' }}>Two-factor authentication</Typography>
                  <Switch />
                </Box>
              </Box>
            )}

            {active === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: `1px solid ${tokens.borderDark}` }}>
                  <Typography variant="body2" sx={{ color: '#FFFFFF' }}>Dark mode</Typography>
                  <Switch defaultChecked />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: `1px solid ${tokens.borderDark}` }}>
                  <Typography variant="body2" sx={{ color: '#FFFFFF' }}>Compact view</Typography>
                  <Switch />
                </Box>
              </Box>
            )}

            {active === 4 && (
              <Box>
                <Typography variant="body2" sx={{ color: '#999999', mb: 2 }}>Manage your subscription and payment methods.</Typography>
                <Box sx={{ p: 2, border: `1px solid ${tokens.borderDark}`, mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>Free Plan</Typography>
                  <Typography variant="caption" sx={{ color: '#666666' }}>Basic features included</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
