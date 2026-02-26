import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Toggle } from './ui';
import { toast } from './ui/Toast';
import { transactionApi, categoryApi } from '../services/api';
import { CURRENCIES } from '../utils/currencies';

export default function EditTransactionModal({ isOpen, onClose, transaction, onSuccess }) {
    const [form, setForm] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && transaction) {
            setForm({
                type: transaction.type || 'expense',
                amount: String(transaction.amount || ''),
                description: transaction.description || '',
                category: transaction.category?._id || transaction.category || '',
                date: transaction.date
                    ? new Date(transaction.date).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                currency: transaction.currency || 'USD',
            });

            categoryApi.getAll().then((res) => {
                const cats = res.data || res || [];
                setCategories(Array.isArray(cats) ? cats : []);
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
            await transactionApi.update(id, {
                type: form.type,
                amount: parseFloat(form.amount),
                description: form.description,
                category: form.category,
                date: form.date,
                currency: form.currency,
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
