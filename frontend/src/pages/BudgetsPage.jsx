import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { PageWrapper, Card, Button, Modal, Input, Select, Badge } from '../components/ui';
import SpendingMeter from '../components/ui/SpendingMeter';
import ConfettiTrigger from '../components/ui/ConfettiTrigger';
import MultiStepBudgetForm from '../components/budgets/MultiStepBudgetForm';
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

  // Get confetti enabled preference
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
      // Compute date range based on period
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
        // monthly (default)
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      }

      // Find category name for the budget name
      const selectedCat = categories.find(c => (c._id || c.name) === form.category);
      const budgetName = selectedCat ? `${selectedCat.name} Budget` : `${form.period.charAt(0).toUpperCase() + form.period.slice(1)} Budget`;

      await budgetApi.create({
        name: budgetName,
        type: form.period === 'yearly' ? 'yearly' : form.period === 'weekly' ? 'custom' : 'monthly',
        category: form.category || undefined,
        amount: parseFloat(form.amount),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
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
      {/* Confetti Trigger */}
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
                  whileHover={{ y: -4, scale: 1.02 }}
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

      {/* Create Budget Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Budget">
        <MultiStepBudgetForm
          categories={categories}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </Modal>
    </PageWrapper>
  );
}
