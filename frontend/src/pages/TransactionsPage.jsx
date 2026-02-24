import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownRight, Trash2, Filter, Search,
} from 'lucide-react';
import { PageWrapper, Card, Button, Input, Select, Badge } from '../components/ui';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { transactionApi, categoryApi } from '../services/api';
import AddTransactionModal from '../components/AddTransactionModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = async () => {
    try {
      const params = { sort: '-date', limit: 50 };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      const res = await transactionApi.getAll(params);
      setTransactions(res.data?.transactions || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    categoryApi.getAll().then((res) => {
      setCategories(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading) fetchTransactions();
  }, [filters.type, filters.category]);

  const handleDelete = async (id) => {
    try {
      await transactionApi.delete(id);
      setTransactions((prev) => prev.filter((t) => (t._id || t.id) !== id));
      toast('Transaction deleted', 'success');
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  const filtered = transactions.filter((tx) => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const desc = (tx.description || '').toLowerCase();
      const cat = (tx.category?.name || tx.category || '').toLowerCase();
      if (!desc.includes(s) && !cat.includes(s)) return false;
    }
    return true;
  });

  return (
    <PageWrapper
      title="Transactions"
      subtitle="All your financial activity"
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </Button>
          <Button icon={() => <span>+</span>} onClick={() => setShowModal(true)}>
            Add Transaction
          </Button>
        </div>
      }
    >
      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <Input
                  icon={Search}
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                />
              </div>
              <div className="w-40">
                <Select
                  placeholder="All types"
                  value={filters.type}
                  onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
                  options={[
                    { value: '', label: 'All types' },
                    { value: 'income', label: 'Income' },
                    { value: 'expense', label: 'Expense' },
                  ]}
                />
              </div>
              <div className="w-44">
                <Select
                  placeholder="All categories"
                  value={filters.category}
                  onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                  options={[
                    { value: '', label: 'All categories' },
                    ...categories.map((c) => ({ value: c._id || c.name, label: c.name })),
                  ]}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <Card padding="p-0">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-stone/20 bg-sand/20">
          <span className="col-span-5 text-xs font-medium text-drift uppercase tracking-wider">Description</span>
          <span className="col-span-2 text-xs font-medium text-drift uppercase tracking-wider">Category</span>
          <span className="col-span-2 text-xs font-medium text-drift uppercase tracking-wider">Date</span>
          <span className="col-span-2 text-xs font-medium text-drift uppercase tracking-wider text-right">Amount</span>
          <span className="col-span-1 text-xs font-medium text-drift uppercase tracking-wider text-right">Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-drift">
            No transactions found
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((tx, index) => {
              const isIncome = tx.type === 'income';
              return (
                <motion.div
                  key={tx._id || tx.id}
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-sand/20 transition-colors duration-200 border-b border-stone/10 last:border-0"
                >
                  {/* Description */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`
                      w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                      ${isIncome ? 'bg-emerald-50/60' : 'bg-sand/60'}
                    `}>
                      {isIncome ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-700/60" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-char" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-obsidian truncate">
                      {tx.description || 'Transaction'}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <Badge>{tx.category?.name || tx.category || '—'}</Badge>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-sm text-drift tabular-nums">
                    {new Date(tx.date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </div>

                  {/* Amount */}
                  <div className={`col-span-2 text-sm font-semibold text-right tabular-nums ${isIncome ? 'text-emerald-700/70' : 'text-obsidian'}`}>
                    {isIncome ? '+' : '-'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleDelete(tx._id || tx.id)}
                      className="p-1.5 rounded-lg text-drift hover:text-red-700/60 hover:bg-red-50/30 transition-all duration-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </Card>

      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchTransactions}
      />
    </PageWrapper>
  );
}
