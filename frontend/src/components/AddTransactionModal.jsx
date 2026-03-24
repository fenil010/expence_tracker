import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Toggle } from './ui';
import { toast } from './ui/Toast';
import { transactionApi, categoryApi, accountApi } from '../services/api';
import { CURRENCIES, getDefaultCurrency } from '../utils/currencies';

const LAST_USED_KEY = 'lastUsedTransactionDefaults';
const QUICK_MEMORY_KEY = 'transactionQuickMemory';

const defaultForm = {
  type: 'expense',
  amount: '',
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  account: '',
  currency: '',
  tags: '',
};

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitMode, setSubmitMode] = useState('close');
  const [recentDescriptions, setRecentDescriptions] = useState([]);
  const [recentTags, setRecentTags] = useState([]);
  const [errors, setErrors] = useState({});

  const getLastUsedDefaults = () => {
    try {
      const raw = localStorage.getItem(LAST_USED_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  };

  const saveLastUsedDefaults = (payload) => {
    const data = {
      currency: payload.currency,
      account: payload.account || '',
      byType: {
        [payload.type]: {
          category: payload.category,
        },
      },
    };

    try {
      const existing = getLastUsedDefaults();
      if (existing?.byType && typeof existing.byType === 'object') {
        data.byType = {
          ...existing.byType,
          ...data.byType,
        };
      }
      localStorage.setItem(LAST_USED_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors and keep form flow uninterrupted.
    }
  };

  const getQuickMemory = () => {
    try {
      const raw = localStorage.getItem(QUICK_MEMORY_KEY);
      if (!raw) return { descriptions: [], tags: [] };
      const parsed = JSON.parse(raw);
      return {
        descriptions: Array.isArray(parsed?.descriptions) ? parsed.descriptions : [],
        tags: Array.isArray(parsed?.tags) ? parsed.tags : [],
      };
    } catch {
      return { descriptions: [], tags: [] };
    }
  };

  const saveQuickMemory = (description, tags) => {
    const existing = getQuickMemory();
    const nextDescriptions = [description, ...existing.descriptions]
      .map((item) => item?.trim())
      .filter(Boolean)
      .filter((item, idx, arr) => arr.findIndex((it) => it.toLowerCase() === item.toLowerCase()) === idx)
      .slice(0, 8);

    const nextTags = [...tags, ...existing.tags]
      .map((item) => item?.trim())
      .filter(Boolean)
      .filter((item, idx, arr) => arr.findIndex((it) => it.toLowerCase() === item.toLowerCase()) === idx)
      .slice(0, 12);

    const data = {
      descriptions: nextDescriptions,
      tags: nextTags,
    };

    try {
      localStorage.setItem(QUICK_MEMORY_KEY, JSON.stringify(data));
      setRecentDescriptions(nextDescriptions);
      setRecentTags(nextTags);
    } catch {
      // Ignore storage errors and keep form flow uninterrupted.
    }
  };

  useEffect(() => {
    if (isOpen) {
      const defaults = getLastUsedDefaults();
      const today = new Date().toISOString().split('T')[0];
      setForm({
        ...defaultForm,
        currency: defaults?.currency || getDefaultCurrency(),
        account: defaults?.account || '',
        category: defaults?.byType?.expense?.category || '',
        date: today,
      });
      const quickMemory = getQuickMemory();
      setRecentDescriptions(quickMemory.descriptions);
      setRecentTags(quickMemory.tags);
      setSubmitMode('close');
      setErrors({});
      categoryApi.getAll().then((res) => {
        const cats = res.data || res || [];
        setCategories(Array.isArray(cats) ? cats : []);
      }).catch(() => { });
      accountApi.getAll().then((res) => {
        const accts = res.data?.accounts || res.data || [];
        setAccounts(Array.isArray(accts) ? accts : []);
      }).catch(() => { });
    }
  }, [isOpen]);

  const isIncome = form.type === 'income';

  const handleChange = (field, value) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    if (field === 'type') {
      const defaults = getLastUsedDefaults();
      setForm((prev) => ({
        ...prev,
        type: value,
        category: defaults?.byType?.[value]?.category || '',
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.amount) nextErrors.amount = 'Amount is required';
    if (!form.description?.trim()) nextErrors.description = 'Description is required';
    if (!form.category) nextErrors.category = 'Category is required';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast('Please fill in all required fields', 'error');
      return;
    }

    const amount = parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setErrors((prev) => ({ ...prev, amount: 'Enter an amount greater than 0' }));
      toast('Amount must be greater than 0', 'error');
      return;
    }

    setLoading(true);
    try {
      const trimmedDescription = form.description.trim();
      const tags = form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 10);

      const possibleDuplicateResponse = await transactionApi.getAll({
        type: form.type,
        startDate: form.date,
        endDate: form.date,
        search: trimmedDescription,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 10,
      });

      const possibleDuplicates = possibleDuplicateResponse?.data?.transactions || [];
      const hasExactDuplicate = possibleDuplicates.some((tx) => {
        const txDescription = (tx.description || '').trim().toLowerCase();
        const txAmount = Number(tx.amount);
        const txCategoryId = tx.category?._id || tx.category;
        return txDescription === trimmedDescription.toLowerCase()
          && Math.abs(txAmount - amount) < 0.001
          && String(txCategoryId) === String(form.category);
      });

      if (hasExactDuplicate) {
        const shouldContinue = window.confirm('A similar transaction already exists for this day. Save anyway?');
        if (!shouldContinue) {
          setLoading(false);
          return;
        }
      }

      const payload = {
        type: form.type,
        amount,
        description: trimmedDescription,
        category: form.category,
        date: form.date,
        currency: form.currency,
        tags: tags.length > 0 ? tags : undefined,
      };

      // Only include account if it's not empty
      if (form.account) {
        payload.account = form.account;
      }

      await transactionApi.create(payload);
      saveLastUsedDefaults(payload);
      saveQuickMemory(trimmedDescription, tags);
      setErrors({});

      toast('Transaction added successfully', 'success');

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('transactionAdded'));

      onSuccess?.();

      if (submitMode === 'continue') {
        const defaults = getLastUsedDefaults();
        const nextType = form.type;
        setForm({
          ...defaultForm,
          type: nextType,
          currency: defaults?.currency || form.currency || getDefaultCurrency(),
          account: defaults?.account || form.account || '',
          category: defaults?.byType?.[nextType]?.category || '',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        onClose();
      }
    } catch (err) {
      toast(err.message || 'Failed to add transaction', 'error');
    } finally {
      setLoading(false);
      setSubmitMode('close');
    }
  };

  const categoryOptions = categories
    .filter((c) => !c.type || c.type === form.type)
    .map((c) => ({ value: c._id || c.name, label: c.name }));

  const accountOptions = accounts.map((a) => ({
    value: a._id || a.id,
    label: `${a.name} (${a.type})`,
  }));

  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.symbol} ${c.code} - ${c.name}`
  }));

  const amountNumber = Number(form.amount);
  const hasAmount = Number.isFinite(amountNumber) && amountNumber > 0;
  const todayIso = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = yesterday.toISOString().split('T')[0];

  const handleQuickDate = (offsetDays) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    handleChange('date', date.toISOString().split('T')[0]);
  };

  const handleAmountStep = (delta) => {
    const current = Number(form.amount) || 0;
    const next = Math.max(0, current + delta);
    handleChange('amount', next ? next.toFixed(2).replace(/\.00$/, '') : '');
  };

  const applyRecentTag = (tag) => {
    const existingTags = form.tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (existingTags.some((item) => item.toLowerCase() === tag.toLowerCase()) || existingTags.length >= 10) {
      return;
    }

    const nextTags = [...existingTags, tag];
    handleChange('tags', nextTags.join(', '));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-char dark:text-zinc-200">
            {isIncome ? 'Income' : 'Expense'}
          </span>
          <Toggle
            checked={isIncome}
            onChange={(checked) => handleChange('type', checked ? 'income' : 'expense')}
            label=""
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[10, 25, 50, 100].map((quickAmount) => (
            <Button
              key={quickAmount}
              type="button"
              variant={Number(form.amount) === quickAmount ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-full"
              onClick={() => handleChange('amount', String(quickAmount))}
            >
              {`${quickAmount}`}
            </Button>
          ))}
        </div>

        {/* Amount */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={errors.amount}
            required
          />
          <Select
            label="Currency"
            value={form.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            options={currencyOptions}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => handleAmountStep(-10)}>-10</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleAmountStep(-1)}>-1</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleAmountStep(1)}>+1</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => handleAmountStep(10)}>+10</Button>
        </div>

        {/* Description */}
        <Input
          label="Description"
          placeholder="What was this for?"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          required
        />

        {recentDescriptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recentDescriptions.map((item) => (
              <Button
                key={item}
                type="button"
                variant={form.description?.trim().toLowerCase() === item.toLowerCase() ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-full"
                onClick={() => handleChange('description', item)}
              >
                {item}
              </Button>
            ))}
          </div>
        )}

        {/* Category */}
        <Select
          label="Category"
          placeholder="Select category"
          value={form.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={categoryOptions}
          error={errors.category}
          required
        />

        {/* Date */}
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={form.date === todayIso ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-full"
            onClick={() => handleQuickDate(0)}
          >
            Today
          </Button>
          <Button
            type="button"
            variant={form.date === yesterdayIso ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-full"
            onClick={() => handleQuickDate(-1)}
          >
            Yesterday
          </Button>
        </div>

        {/* Tags */}
        <Input
          label="Tags"
          placeholder="e.g. groceries, lunch"
          value={form.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
        />

        {recentTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recentTags.map((tag) => (
              <Button
                key={tag}
                type="button"
                variant={form.tags.toLowerCase().split(',').map((item) => item.trim()).includes(tag.toLowerCase()) ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-full"
                onClick={() => applyRecentTag(tag)}
              >
                #{tag}
              </Button>
            ))}
          </div>
        )}

        {/* Account */}
        {accountOptions.length > 0 && (
          <Select
            label="Account (optional)"
            placeholder="Select account"
            value={form.account}
            onChange={(e) => handleChange('account', e.target.value)}
            options={[{ value: '', label: 'No account' }, ...accountOptions]}
          />
        )}

        <div className="rounded-xl border border-stone/50 dark:border-zinc-700 p-3 bg-linen/50 dark:bg-zinc-900/30">
          <p className="text-xs text-drift dark:text-zinc-400">Preview</p>
          <p className={`text-sm font-semibold ${isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {hasAmount ? `${isIncome ? '+' : '-'} ${amountNumber.toFixed(2)} ${form.currency}` : `0.00 ${form.currency}`}
          </p>
          <p className="text-xs text-char/80 dark:text-zinc-300 mt-1">
            {form.description?.trim() || 'No description yet'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            loading={loading && submitMode === 'continue'}
            onClick={() => setSubmitMode('continue')}
          >
            Save & Add Another
          </Button>
          <Button
            type="submit"
            loading={loading && submitMode === 'close'}
            onClick={() => setSubmitMode('close')}
          >
            Save Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
