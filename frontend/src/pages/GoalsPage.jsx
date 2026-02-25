import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Trash2, Award } from 'lucide-react';
import { PageWrapper, Card, Button, Modal, Input } from '../components/ui';
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
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [contributeAmount, setContributeAmount] = useState('');
  const [saving, setSaving] = useState(false);

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
      await goalApi.create({
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        targetDate: form.deadline || undefined,
      });
      toast('Goal created', 'success');
      setShowCreateModal(false);
      setForm({ name: '', targetAmount: '', deadline: '' });
      fetchGoals();
    } catch (err) {
      toast(err.message || 'Failed to create goal', 'error');
    } finally {
      setSaving(false);
    }
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

  const handleDelete = async (id) => {
    try {
      await goalApi.delete(id);
      setGoals((prev) => prev.filter((g) => (g._id || g.id) !== id));
      toast('Goal deleted', 'success');
    } catch {
      toast('Failed to delete goal', 'error');
    }
  };

  return (
    <PageWrapper
      title="Goals"
      subtitle="Track your savings goals"
      action={
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
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
          <p className="text-drift dark:text-zinc-400 text-sm mb-4">No savings goals yet</p>
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
              
              // Calculate milestones (25%, 50%, 75%, 100%)
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
                          {goal.deadline && (
                            <p className="text-xs text-drift dark:text-zinc-500">
                              Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(goal._id || goal.id)}
                        className="p-1.5 rounded-lg text-drift dark:text-zinc-500 hover:text-red-700/60 dark:hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/30 transition-all duration-300 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Goal">
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
            <Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Goal</Button>
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
    </PageWrapper>
  );
}
