import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, ToggleButton, ToggleButtonGroup,
  MenuItem, Typography,
} from '@mui/material';
import { tokens } from '../theme';

const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Salary', 'Freelance', 'Other'];

export default function AddExpenseModal({ isOpen, onClose, onAdd }) {
  const [type, setType] = useState('expense');
  const [form, setForm] = useState({ description: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });

  const handleSubmit = () => {
    if (!form.description || !form.amount) return;
    onAdd?.({ ...form, amount: parseFloat(form.amount), type, id: Date.now() });
    setForm({ description: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, color: '#FFFFFF' }}>Add Transaction</DialogTitle>
      <DialogContent>
        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={(_, v) => v && setType(v)}
          fullWidth
          sx={{ mb: 2, mt: 1 }}
        >
          <ToggleButton value="expense" sx={{
            color: '#999999', border: `1px solid ${tokens.borderDark}`,
            '&.Mui-selected': { bgcolor: '#FFFFFF', color: '#000000', '&:hover': { bgcolor: '#E0E0E0' } },
          }}>
            Expense
          </ToggleButton>
          <ToggleButton value="income" sx={{
            color: '#999999', border: `1px solid ${tokens.borderDark}`,
            '&.Mui-selected': { bgcolor: '#FFFFFF', color: '#000000', '&:hover': { bgcolor: '#E0E0E0' } },
          }}>
            Income
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField fullWidth label="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />
        <TextField fullWidth label="Amount" type="number" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })} sx={{ mb: 2 }} />
        <TextField fullWidth select label="Category" value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })} sx={{ mb: 2 }}>
          {categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField fullWidth label="Date" type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#999999' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
}
