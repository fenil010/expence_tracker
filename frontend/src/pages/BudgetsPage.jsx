import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { PageWrapper, Card, Button, Modal, Input, Select, Badge } from '../components/ui';
import { CardSkeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { budgetApi, categoryApi } from '../services/api';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: '', amount: '', period: 'monthly' });
  const [saving, setSaving] = useState(false);

  const fetchBudgets = async () => {
    try {
      const res = await budgetApi.getAll();
      setBudgets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    categoryApi.getAll('expense').then((res) => {
      setCategories(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    setSaving(true);
    try {
      await budgetApi.create({
        category: form.category,
        amount: parseFloat(form.amount),
        period: form.period,
      });
      toast('Budget created', 'success');
      setShowModal(false);
      setForm({ category: '', amount: '', period: 'monthly' });
      fetchBudgets();
    } catch (err) {
      toast(err.message || 'Failed to create budget', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await budgetApi.delete(id);
      setBudgets((prev) => prev.filter((b) => (b._id || b.id) !== id));
      toast('Budget deleted', 'success');
    } catch {
      toast('Failed to delete budget', 'error');
    }
  };

  return (
    <PageWrapper
      title="Budgets"
      subtitle="Set spending limits by category"
      action={
        <Button icon={Plus} onClick={() => setShowModal(true)}>
          Add Budget
        </Button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-sand/60 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-drift dark:text-zinc-400" />
          </div>
          <p className="text-drift dark:text-zinc-400 text-sm mb-4">No budgets set yet</p>
          <Button onClick={() => setShowModal(true)} icon={Plus}>Create Budget</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {budgets.map((budget) => {
              const spent = budget.spent || 0;
              const limit = budget.amount || budget.limit || 0;
              const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
              const isOver = progress >= 100;

              return (
                <motion.div
                  key={budget._id || budget.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Card className="h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3 className="font-semibold text-obsidian dark:text-white">
                          {budget.category?.name || budget.category || 'General'}
                        </h3>
                        <p className="text-xs text-drift dark:text-zinc-500 mt-1 capitalize">{budget.period || 'Monthly'}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(budget._id || budget.id)}
                        className="p-1.5 rounded-lg text-drift dark:text-zinc-500 hover:text-red-700/60 dark:hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/30 transition-all duration-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-semibold text-obsidian dark:text-white tabular-nums">
                          ${spent.toLocaleString()}
                        </span>
                        <span className="text-sm text-drift dark:text-zinc-500 tabular-nums">
                          of ${limit.toLocaleString()}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2.5 bg-sand dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
                          className={`h-full rounded-full ${isOver ? 'bg-red-400/60' : 'bg-obsidian dark:bg-white'}`}
                        />
                      </div>

                      <p className="text-xs text-drift dark:text-zinc-400">
                        {isOver ? (
                          <span className="text-red-700/60 dark:text-red-400">Over budget by ${(spent - limit).toLocaleString()}</span>
                        ) : (
                          <span>${(limit - spent).toLocaleString()} remaining</span>
                        )}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Budget Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Budget">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Category"
            placeholder="Select category"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            options={categories.map((c) => ({ value: c._id || c.name, label: c.name }))}
          />
          <Input
            label="Budget Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            required
          />
          <Select
            label="Period"
            value={form.period}
            onChange={(e) => setForm((p) => ({ ...p, period: e.target.value }))}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Budget</Button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
