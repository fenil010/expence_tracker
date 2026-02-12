import { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../theme';
import Logo from '../components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      bgcolor: '#000000', p: 3,
    }}>
      <Box sx={{
        width: '100%', maxWidth: 360, p: 4,
        border: `1px solid ${tokens.borderDark}`, bgcolor: '#0A0A0A',
        borderRadius: tokens.radiusLg,
      }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Logo sx={{ width: 48, height: 48, color: '#FFFFFF' }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF', mb: 0.5 }}>Sign in</Typography>
        <Typography variant="body2" sx={{ color: '#666666', mb: 4 }}>Enter your credentials to continue</Typography>

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth label="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth label="Password" type="password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mb: 2 }}>
            Sign In
          </Button>
        </form>

        <Typography variant="caption" sx={{ color: '#666666', textAlign: 'center', display: 'block' }}>
          Don't have an account? <Box component="span" sx={{ color: '#FFFFFF', cursor: 'pointer' }}>Sign up</Box>
        </Typography>
      </Box>
    </Box>
  );
}
