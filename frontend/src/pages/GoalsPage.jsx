import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Trash2, Award, Pencil, Minus } from 'lucide-react';
import { PageWrapper, Card, Button, Modal, Input, ConfirmDialog } from '../components/ui';
import { CardSkeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { goalApi } from '../services/api';
import { formatCurrency, getDefaultCurrency } from '../utils/currencies';
import CircularProgress from '../components/goals/CircularProgress';
import NumberInput from '../components/goals/NumberInput';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [contributeAmount, setContributeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await goalApi.getAll();
      setGoals(res.data?.goals || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currency = getDefaultCurrency();

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount) return;
    setSaving(true);
    try {
      if (editingGoal) {
        await goalApi.update(editingGoal._id || editingGoal.id, {
          name: form.name,
          targetAmount: parseFloat(form.targetAmount),
          targetDate: form.deadline || undefined,
        });
        toast('Goal updated', 'success');
      } else {
        await goalApi.create({
          name: form.name,
          targetAmount: parseFloat(form.targetAmount),
          targetDate: form.deadline || undefined,
        });
        toast('Goal created', 'success');
      }
      setShowCreateModal(false);
      setEditingGoal(null);
      setForm({ name: '', targetAmount: '', deadline: '' });
      fetchGoals();
    } catch (err) {
      toast(err.message || 'Failed to save goal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      name: goal.name || '',
      targetAmount: String(goal.targetAmount || goal.target || ''),
      deadline: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
    });
    setShowCreateModal(true);
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!contributeAmount || !showContributeModal) return;
    setSaving(true);
    try {
      await goalApi.contribute(showContributeModal._id || showContributeModal.id, {
        amount: parseFloat(contributeAmount),
      });
      toast('Contribution added', 'success');
      setShowContributeModal(null);
      setContributeAmount('');
      fetchGoals();
    } catch (err) {
      toast(err.message || 'Failed to contribute', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || !showWithdrawModal) return;
    setSaving(true);
    try {
      await goalApi.withdraw(showWithdrawModal._id || showWithdrawModal.id, {
        amount: parseFloat(withdrawAmount),
      });
      toast('Withdrawal successful', 'success');
      setShowWithdrawModal(null);
      setWithdrawAmount('');
      fetchGoals();
    } catch (err) {
      toast(err.message || 'Failed to withdraw', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await goalApi.delete(deleteTarget);
      setGoals((prev) => prev.filter((g) => (g._id || g.id) !== deleteTarget));
      toast('Goal deleted', 'success');
    } catch {
      toast('Failed to delete goal', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getTimeRemaining = (targetDate) => {
    if (!targetDate) return null;
    const end = new Date(targetDate);
    const now = new Date();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: 'Overdue', urgent: true };
    if (diffDays === 0) return { text: 'Due today', urgent: true };
    if (diffDays <= 7) return { text: `${diffDays}d left`, urgent: true };
    if (diffDays <= 30) return { text: `${diffDays}d left`, urgent: false };
    const months = Math.floor(diffDays / 30);
    return { text: `${months}mo left`, urgent: false };
  };

  return (
    <PageWrapper
      title="Goals"
      subtitle="Track your savings goals"
      action={
        <Button icon={Plus} onClick={() => { setEditingGoal(null); setForm({ name: '', targetAmount: '', deadline: '' }); setShowCreateModal(true); }}>
          New Goal
        </Button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : goals.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-sand/60 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-drift dark:text-zinc-400" />
          </div>
          <p className="text-drift dark:text-zinc-400 text-sm mb-1 font-medium">No savings goals yet</p>
          <p className="text-xs text-drift/70 dark:text-zinc-500 mb-4">Set targets and track your progress towards financial goals</p>
          <Button onClick={() => setShowCreateModal(true)} icon={Plus}>Create Goal</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {goals.map((goal) => {
              const saved = goal.currentAmount || goal.saved || 0;
              const target = goal.targetAmount || goal.target || 0;
              const progress = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
              const isComplete = progress >= 100;
              const timeRemaining = getTimeRemaining(goal.targetDate);
              const milestones = [25, 50, 75, 100];

              return (
                <motion.div
                  key={goal._id || goal.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <Card className="h-full">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sand/60 dark:bg-zinc-800 flex items-center justify-center">
                          {isComplete ? (
                            <Award className="w-5 h-5 text-emerald-700/60 dark:text-emerald-400" />
                          ) : (
                            <Target className="w-5 h-5 text-char dark:text-zinc-300" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-obsidian dark:text-white text-sm">{goal.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            {goal.targetDate && (
                              <p className="text-xs text-drift dark:text-zinc-500">
                                Due {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                            {timeRemaining && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${timeRemaining.urgent
                                  ? 'bg-red-50/50 dark:bg-red-950/30 text-red-600/70 dark:text-red-400'
                                  : 'bg-sand/50 dark:bg-zinc-800 text-drift dark:text-zinc-500'
                                }`}>
                                {timeRemaining.text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-1.5 rounded-lg text-drift dark:text-zinc-500 hover:text-[var(--color-accent)] hover:bg-sand/40 dark:hover:bg-zinc-800 transition-all duration-300 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(goal._id || goal.id)}
                          className="p-1.5 rounded-lg text-drift dark:text-zinc-500 hover:text-red-700/60 dark:hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/30 transition-all duration-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Circular Progress */}
                    <div className="flex justify-center mb-5">
                      <CircularProgress
                        progress={progress}
                        size={100}
                        strokeWidth={8}
                        color={isComplete ? '#059669' : '#3D3830'}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <span className="text-xl font-semibold text-obsidian dark:text-white tabular-nums">
                          {formatCurrency(saved, currency)}
                        </span>
                        <span className="text-sm text-drift dark:text-zinc-500 tabular-nums">
                          of {formatCurrency(target, currency)}
                        </span>
                      </div>

                      {/* Progress bar with milestone markers */}
                      <div className="relative">
                        <div className="h-2.5 bg-sand dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
                            className={`h-full rounded-full ${isComplete ? 'bg-emerald-600/60' : 'bg-[var(--color-accent)]'}`}
                          />
                        </div>

                        {/* Milestone markers */}
                        <div className="absolute inset-0 flex justify-between px-1">
                          {milestones.slice(0, -1).map((milestone) => (
                            <motion.div
                              key={milestone}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                scale: progress >= milestone ? 1 : 0.6,
                                opacity: progress >= milestone ? 1 : 0.3
                              }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              className={`
                                w-1.5 h-1.5 rounded-full -mt-0.5
                                ${progress >= milestone
                                  ? 'bg-emerald-600 dark:bg-emerald-400'
                                  : 'bg-drift dark:bg-zinc-600'
                                }
                              `}
                              style={{ marginLeft: `${milestone}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-drift dark:text-zinc-400">
                          {isComplete ? '🎯 Goal reached!' : `${progress.toFixed(0)}% complete`}
                        </p>
                        <div className="flex items-center gap-1">
                          {!isComplete && saved > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowWithdrawModal(goal)}
                            >
                              <Minus className="w-3 h-3 mr-1" />
                              Withdraw
                            </Button>
                          )}
                          {!isComplete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowContributeModal(goal)}
                            >
                              + Add Funds
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Goal Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingGoal(null); }}
        title={editingGoal ? 'Edit Goal' : 'Create Goal'}
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Goal Name"
            placeholder="e.g., Emergency Fund"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <Input
            label="Target Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.targetAmount}
            onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))}
            required
          />
          <Input
            label="Deadline (optional)"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => { setShowCreateModal(false); setEditingGoal(null); }}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingGoal ? 'Save Changes' : 'Create Goal'}</Button>
          </div>
        </form>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        isOpen={!!showContributeModal}
        onClose={() => setShowContributeModal(null)}
        title={`Contribute to ${showContributeModal?.name || 'Goal'}`}
      >
        <form onSubmit={handleContribute} className="space-y-5">
          <NumberInput
            label="Amount"
            step={10}
            min={0}
            placeholder="0.00"
            value={contributeAmount}
            onChange={(e) => setContributeAmount(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowContributeModal(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Contribute</Button>
          </div>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={!!showWithdrawModal}
        onClose={() => setShowWithdrawModal(null)}
        title={`Withdraw from ${showWithdrawModal?.name || 'Goal'}`}
      >
        <form onSubmit={handleWithdraw} className="space-y-5">
          <div>
            <p className="text-xs text-drift dark:text-zinc-500 mb-3">
              Available: {formatCurrency(showWithdrawModal?.currentAmount || showWithdrawModal?.saved || 0, currency)}
            </p>
            <NumberInput
              label="Amount"
              step={10}
              min={0}
              max={showWithdrawModal?.currentAmount || showWithdrawModal?.saved || 0}
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowWithdrawModal(null)}>Cancel</Button>
            <Button type="submit" loading={saving} variant="danger">Withdraw</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Goal?"
        message="This will permanently remove this savings goal and all its contribution history."
        confirmText="Delete"
        loading={deleting}
      />
    </PageWrapper>
  );
}
