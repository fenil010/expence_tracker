import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Toggle } from './ui';
import { toast } from './ui/Toast';
import { transactionApi, categoryApi, accountApi } from '../services/api';
import { CURRENCIES } from '../utils/currencies';

export default function EditTransactionModal({ isOpen, onClose, transaction, onSuccess }) {
    const [form, setForm] = useState(null);
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && transaction) {
            setForm({
                type: transaction.type || 'expense',
                amount: String(transaction.amount || ''),
                description: transaction.description || '',
                category: transaction.category?._id || transaction.category || '',
                account: transaction.account?._id || transaction.account || '',
                date: transaction.date
                    ? new Date(transaction.date).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                currency: transaction.currency || 'USD',
                tags: Array.isArray(transaction.tags) ? transaction.tags.join(', ') : '',
            });

            categoryApi.getAll().then((res) => {
                const cats = res.data || res || [];
                setCategories(Array.isArray(cats) ? cats : []);
            }).catch(() => { });
            accountApi.getAll().then((res) => {
                const accts = res.data?.accounts || res.data || [];
                setAccounts(Array.isArray(accts) ? accts : []);
            }).catch(() => { });
        }
    }, [isOpen, transaction]);

    if (!isOpen) return null;

    const isIncome = form?.type === 'income';

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.amount || !form.description || !form.category) {
            toast('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const id = transaction._id || transaction.id;
            const tags = form.tags
                ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 10)
                : [];
            await transactionApi.update(id, {
                type: form.type,
                amount: parseFloat(form.amount),
                description: form.description,
                category: form.category,
                account: form.account || undefined,
                date: form.date,
                currency: form.currency,
                tags: tags.length > 0 ? tags : undefined,
            });
            toast('Transaction updated', 'success');
            window.dispatchEvent(new CustomEvent('transactionAdded'));
            onSuccess?.();
            onClose();
        } catch (err) {
            toast(err.message || 'Failed to update transaction', 'error');
        } finally {
            setLoading(false);
        }
    };

    const categoryOptions = (categories || [])
        .filter((c) => !c.type || c.type === form?.type)
        .map((c) => ({ value: c._id || c.name, label: c.name }));

    const accountOptions = (accounts || []).map((a) => ({
        value: a._id || a.id,
        label: `${a.name} (${a.type})`,
    }));

    const currencyOptions = CURRENCIES.map((c) => ({
        value: c.code,
        label: `${c.symbol} ${c.code} - ${c.name}`,
    }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Transaction">
            {form ? (
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

                    {/* Amount + Currency */}
                    <div className="grid grid-cols-2 gap-4">
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
                        <Select
                            label="Currency"
                            value={form.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            options={currencyOptions}
                        />
                    </div>

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
                        required
                    />

                    {/* Date */}
                    <Input
                        label="Date"
                        type="date"
                        value={form.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                    />

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

                    {/* Tags */}
                    <Input
                        label="Tags"
                        placeholder="e.g. groceries, lunch"
                        value={form.tags}
                        onChange={(e) => handleChange('tags', e.target.value)}
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button variant="ghost" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="flex items-center justify-center py-10">
                    <div className="w-5 h-5 border-2 border-obsidian dark:border-white border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </Modal>
    );
}
