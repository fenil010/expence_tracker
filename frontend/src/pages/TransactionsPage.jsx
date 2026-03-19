import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownRight, Trash2, Filter, Search, Plus, X,
} from 'lucide-react';
import { PageWrapper, Card, Button, Input, Select, Badge, ConfirmDialog } from '../components/ui';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { transactionApi, categoryApi } from '../services/api';
import AddTransactionModal from '../components/AddTransactionModal';
import EditTransactionModal from '../components/EditTransactionModal';
import SwipeableTransactionRow from '../components/SwipeableTransactionRow';
import { formatCurrency, getDefaultCurrency } from '../utils/currencies';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '', search: '', startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editingTx, setEditingTx] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const LIMIT = 20;
  const currency = getDefaultCurrency();

  const fetchTransactions = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = { sort: '-date', limit: LIMIT, skip: (pageNum - 1) * LIMIT };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await transactionApi.getAll(params);
      const newTransactions = res.data?.transactions || res.data || [];

      if (append) {
        setTransactions(prev => [...prev, ...newTransactions]);
      } else {
        setTransactions(newTransactions);
      }

      setHasMore(newTransactions.length === LIMIT);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage, true);
    }
  };

  // Infinite scroll
  useInfiniteScroll(loadMore, hasMore, loadingMore);

  useEffect(() => {
    fetchTransactions();
    categoryApi.getAll().then((res) => {
      setCategories(Array.isArray(res.data) ? res.data : []);
    }).catch(() => { });

    // Listen for transaction added events from global modal
    const handleTransactionAdded = () => {
      fetchTransactions();
    };

    window.addEventListener('transactionAdded', handleTransactionAdded);
    return () => window.removeEventListener('transactionAdded', handleTransactionAdded);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    if (!loading) {
      setPage(1);
      setHasMore(true);
      fetchTransactions(1, false);
    }
  }, [filters.type, filters.category, filters.startDate, filters.endDate, filters.search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await transactionApi.delete(deleteTarget);
      setTransactions((prev) => prev.filter((t) => (t._id || t.id) !== deleteTarget));
      toast('Transaction deleted', 'success');
    } catch {
      toast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (tx) => {
    setEditingTx(tx);
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

  // Summary stats
  const summary = useMemo(() => {
    const income = filtered.reduce((sum, tx) => tx.type === 'income' ? sum + (tx.amount || 0) : sum, 0);
    const expense = filtered.reduce((sum, tx) => tx.type === 'expense' ? sum + (tx.amount || 0) : sum, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const topCategory = useMemo(() => {
    const totals = new Map();
    filtered.filter((tx) => tx.type === 'expense').forEach((tx) => {
      const name = tx.category?.name || tx.category || 'Uncategorized';
      totals.set(name, (totals.get(name) || 0) + (tx.amount || 0));
    });

    let top = null;
    totals.forEach((total, name) => {
      if (!top || total > top.total) top = { name, total };
    });

    return top;
  }, [filtered]);

  const hasActiveFilters = filters.type || filters.category || filters.search || filters.startDate || filters.endDate;

  const clearFilters = () => {
    setFilters({ type: '', category: '', search: '', startDate: '', endDate: '' });
  };

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
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-(--color-accent) ml-1" />
            )}
          </Button>
          <Button icon={Plus} onClick={() => setShowModal(true)}>
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      }
    >
      {/* Summary Banner */}
      {!loading && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="glass" className="flex flex-wrap items-center justify-between gap-4" padding="p-4 px-6">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-drift dark:text-zinc-500 text-xs">Income</span>
                <p className="font-semibold text-emerald-700/70 dark:text-emerald-400 tabular-nums">
                  +{formatCurrency(summary.income, currency)}
                </p>
              </div>
              <div>
                <span className="text-drift dark:text-zinc-500 text-xs">Expenses</span>
                <p className="font-semibold text-obsidian dark:text-zinc-200 tabular-nums">
                  -{formatCurrency(summary.expense, currency)}
                </p>
              </div>
              <div>
                <span className="text-drift dark:text-zinc-500 text-xs">Net</span>
                <p className={`font-semibold tabular-nums ${summary.net >= 0 ? 'text-emerald-700/70 dark:text-emerald-400' : 'text-red-600/70 dark:text-red-400'}`}>
                  {formatCurrency(summary.net, currency)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {topCategory && (
                <div className="flex items-center gap-2 text-xs">
                  <Badge size="sm" className="bg-(--color-accent)/15 text-(--color-accent)">
                    Top Category
                  </Badge>
                  <span className="text-char dark:text-zinc-200 font-medium">
                    {topCategory.name}
                  </span>
                  <span className="text-drift dark:text-zinc-500">
                    {formatCurrency(topCategory.total, currency)}
                  </span>
                </div>
              )}
              <span className="text-xs text-drift dark:text-zinc-500">
                {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          </Card>
        </motion.div>
      )}

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
              <div className="flex-1 min-w-45">
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
              <div className="w-40">
                <Input
                  label="From"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))}
                />
              </div>
              <div className="w-40">
                <Input
                  label="To"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))}
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-drift dark:text-zinc-500 hover:text-char dark:hover:text-zinc-300 transition-colors cursor-pointer pb-2"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <Card padding="p-0">
        {/* Header — hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-stone/20 dark:border-zinc-800 bg-sand/20 dark:bg-zinc-800/30">
          <span className="col-span-5 text-xs font-medium text-drift dark:text-zinc-500 uppercase tracking-wider">Description</span>
          <span className="col-span-2 text-xs font-medium text-drift dark:text-zinc-500 uppercase tracking-wider">Category</span>
          <span className="col-span-2 text-xs font-medium text-drift dark:text-zinc-500 uppercase tracking-wider">Date</span>
          <span className="col-span-2 text-xs font-medium text-drift dark:text-zinc-500 uppercase tracking-wider text-right">Amount</span>
          <span className="col-span-1 text-xs font-medium text-drift dark:text-zinc-500 uppercase tracking-wider text-right">Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sand/60 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <ArrowDownRight className="w-6 h-6 text-drift dark:text-zinc-400" />
            </div>
            <p className="text-drift dark:text-zinc-400 text-sm mb-1 font-medium">No transactions found</p>
            <p className="text-xs text-drift/70 dark:text-zinc-500 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Start by adding your first transaction'}
            </p>
            {!hasActiveFilters && (
              <Button size="sm" onClick={() => setShowModal(true)} icon={Plus}>Add Transaction</Button>
            )}
            {hasActiveFilters && (
              <Button size="sm" variant="ghost" onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence>
              {filtered.map((tx, index) => (
                <SwipeableTransactionRow
                  key={tx._id || tx.id}
                  tx={tx}
                  index={index}
                  onDelete={(id) => setDeleteTarget(id)}
                  onEdit={handleEdit}
                />
              ))}
            </AnimatePresence>

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="px-6 py-4">
                <TableRowSkeleton columns={5} />
              </div>
            )}

            {/* End of list indicator */}
            {!hasMore && filtered.length > 0 && (
              <div className="px-6 py-4 text-center text-xs text-drift dark:text-zinc-500">
                All transactions loaded
              </div>
            )}
          </>
        )}
      </Card>

      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchTransactions}
      />

      <EditTransactionModal
        isOpen={!!editingTx}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSuccess={() => { fetchTransactions(); setEditingTx(null); }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Transaction?"
        message="This will permanently remove this transaction from your records."
        confirmText="Delete"
        loading={deleting}
      />
    </PageWrapper>
  );
}
