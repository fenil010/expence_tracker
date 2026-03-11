import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { PageWrapper, Card, Button, Modal, Input, Select, Badge, ConfirmDialog } from '../components/ui';
import SpendingMeter from '../components/ui/SpendingMeter';
import ConfettiTrigger from '../components/ui/ConfettiTrigger';
import MultiStepBudgetForm from '../components/budgets/MultiStepBudgetForm';
import { CardSkeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { budgetApi, categoryApi } from '../services/api';
import { formatCurrency, getDefaultCurrency } from '../utils/currencies';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [form, setForm] = useState({ category: '', amount: '', period: 'monthly' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const currency = getDefaultCurrency();

  const [confettiEnabled, setConfettiEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('confettiEnabled');
      return stored !== 'false';
    } catch {
      return true;
    }
  });

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
    }).catch(() => { });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    setSaving(true);
    try {
      const now = new Date();
      let startDate, endDate;
      if (form.period === 'weekly') {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else if (form.period === 'yearly') {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      }

      const selectedCat = categories.find(c => (c._id || c.name) === form.category);
      const budgetName = selectedCat ? `${selectedCat.name} Budget` : `${form.period.charAt(0).toUpperCase() + form.period.slice(1)} Budget`;

      if (editingBudget) {
        await budgetApi.update(editingBudget._id || editingBudget.id, {
          name: budgetName,
          amount: parseFloat(form.amount),
          category: form.category || undefined,
        });
        toast('Budget updated', 'success');
      } else {
        await budgetApi.create({
          name: budgetName,
          type: form.period === 'yearly' ? 'yearly' : form.period === 'weekly' ? 'custom' : 'monthly',
          category: form.category || undefined,
          amount: parseFloat(form.amount),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        toast('Budget created', 'success');
      }
      setShowModal(false);
      setEditingBudget(null);
      setForm({ category: '', amount: '', period: 'monthly' });
      fetchBudgets();
    } catch (err) {
      toast(err.message || 'Failed to save budget', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setForm({
      category: budget.category?._id || budget.category || '',
      amount: String(budget.amount || budget.limit || ''),
      period: budget.type === 'yearly' ? 'yearly' : budget.type === 'custom' ? 'weekly' : 'monthly',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await budgetApi.delete(deleteTarget);
      setBudgets((prev) => prev.filter((b) => (b._id || b.id) !== deleteTarget));
      toast('Budget deleted', 'success');
    } catch {
      toast('Failed to delete budget', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getRemainingDays = (budget) => {
    if (!budget.endDate) return null;
    const end = new Date(budget.endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <PageWrapper
      title="Budgets"
      subtitle="Set spending limits by category"
      action={
        <Button icon={Plus} onClick={() => { setEditingBudget(null); setForm({ category: '', amount: '', period: 'monthly' }); setShowModal(true); }}>
          Add Budget
        </Button>
      }
    >
      <ConfettiTrigger budgets={budgets} enabled={confettiEnabled} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-sand/60 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-drift dark:text-zinc-400" />
          </div>
          <p className="text-drift dark:text-zinc-400 text-sm mb-1 font-medium">No budgets set yet</p>
          <p className="text-xs text-drift/70 dark:text-zinc-500 mb-4">Create budgets to track spending limits by category</p>
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
              const remainingDays = getRemainingDays(budget);

              return (
                <motion.div
                  key={budget._id || budget.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <Card className={`h-full ${isOver ? 'border-red-300/40 dark:border-red-800/40' : ''}`}>
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3 className="font-semibold text-obsidian dark:text-white">
                          {budget.category?.name || budget.category || 'General'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-drift dark:text-zinc-500 capitalize">{budget.period || 'Monthly'}</p>
                          {remainingDays !== null && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${remainingDays <= 3
                                ? 'bg-red-50/50 dark:bg-red-950/30 text-red-600/70 dark:text-red-400'
                                : 'bg-sand/50 dark:bg-zinc-800 text-drift dark:text-zinc-500'
                              }`}>
                              {remainingDays === 0 ? 'Ends today' : `${remainingDays}d left`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="p-1.5 rounded-lg text-drift dark:text-zinc-500 hover:text-[var(--color-accent)] hover:bg-sand/40 dark:hover:bg-zinc-800 transition-all duration-300 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(budget._id || budget.id)}
                          className="p-1.5 rounded-lg text-drift dark:text-zinc-500 hover:text-red-700/60 dark:hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/30 transition-all duration-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Over budget warning */}
                    {isOver && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-3 px-3 py-2 rounded-lg bg-red-50/40 dark:bg-red-950/20 border border-red-200/30 dark:border-red-800/30"
                      >
                        <p className="text-xs text-red-600/70 dark:text-red-400 font-medium">
                          ⚠️ Over budget by {formatCurrency(spent - limit, currency)}
                        </p>
                      </motion.div>
                    )}

                    <div className="space-y-3">
                      <SpendingMeter
                        spent={spent}
                        limit={limit}
                        category={null}
                        size="md"
                        showLabels={true}
                      />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Budget Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingBudget(null); setForm({ category: '', amount: '', period: 'monthly' }); }}
        title={editingBudget ? 'Edit Budget' : 'Create Budget'}
      >
        {editingBudget ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              label="Category"
              placeholder="Select category"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              options={[
                { value: '', label: 'General' },
                ...categories.map((c) => ({ value: c._id || c.name, label: c.name })),
              ]}
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
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => { setShowModal(false); setEditingBudget(null); }}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </form>
        ) : (
          <MultiStepBudgetForm
            categories={categories}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            saving={saving}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Budget?"
        message="This will remove the budget and its spending tracking. Your transactions will not be affected."
        confirmText="Delete"
        loading={deleting}
      />
    </PageWrapper>
  );
}
