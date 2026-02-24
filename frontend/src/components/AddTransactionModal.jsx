import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Toggle } from './ui';
import { toast } from './ui/Toast';
import { transactionApi, categoryApi } from '../services/api';

const defaultForm = {
  type: 'expense',
  amount: '',
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  account: '',
};

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(defaultForm);
      categoryApi.getAll().then((res) => {
        const cats = res.data || res || [];
        setCategories(Array.isArray(cats) ? cats : []);
      }).catch(() => {});
    }
  }, [isOpen]);

  const isIncome = form.type === 'income';

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;

    setLoading(true);
    try {
      await transactionApi.create({
        ...form,
        amount: parseFloat(form.amount),
      });
      toast('Transaction added successfully', 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to add transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories
    .filter((c) => !c.type || c.type === form.type)
    .map((c) => ({ value: c._id || c.name, label: c.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-char">
            {isIncome ? 'Income' : 'Expense'}
          </span>
          <Toggle
            checked={isIncome}
            onChange={(checked) => handleChange('type', checked ? 'income' : 'expense')}
            label=""
          />
        </div>

        {/* Amount */}
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          required
        />

        {/* Description */}
        <Input
          label="Description"
          placeholder="What was this for?"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
        />

        {/* Category */}
        <Select
          label="Category"
          placeholder="Select category"
          value={form.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={categoryOptions}
        />

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
