import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CreditCard, Wallet, Landmark, DollarSign, Pencil } from 'lucide-react';
import { PageWrapper, Card, Button, Modal, Input, Select, Badge, ConfirmDialog } from '../components/ui';
import { CardSkeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { accountApi } from '../services/api';
import { formatCurrency, getDefaultCurrency } from '../utils/currencies';

const ACCOUNT_TYPES = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Account' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'savings', label: 'Savings' },
    { value: 'digital_wallet', label: 'Digital Wallet' },
    { value: 'investment', label: 'Investment' },
    { value: 'other', label: 'Other' },
];

const TYPE_ICONS = {
    cash: DollarSign,
    bank: Landmark,
    credit_card: CreditCard,
    savings: Wallet,
    digital_wallet: CreditCard,
    investment: CreditCard,
    other: Wallet,
};

const defaultForm = { name: '', type: 'bank', balance: '', currency: 'USD' };

export default function AccountsPage() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const currency = getDefaultCurrency();

    const fetchAccounts = async () => {
        try {
            const res = await accountApi.getAll();
            setAccounts(res.data?.accounts || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) return;
        setSaving(true);
        try {
            if (editingAccount) {
                await accountApi.update(editingAccount._id || editingAccount.id, {
                    name: form.name,
                    type: form.type,
                    balance: parseFloat(form.balance) || 0,
                });
                toast('Account updated', 'success');
            } else {
                await accountApi.create({
                    name: form.name,
                    type: form.type,
                    balance: parseFloat(form.balance) || 0,
                    currency: form.currency || currency,
                });
                toast('Account created', 'success');
            }
            setShowModal(false);
            setEditingAccount(null);
            setForm(defaultForm);
            fetchAccounts();
        } catch (err) {
            toast(err.message || 'Failed to save account', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setForm({
            name: account.name || '',
            type: account.type || 'bank',
            balance: String(account.balance || ''),
            currency: account.currency || currency,
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await accountApi.delete(deleteTarget);
            setAccounts((prev) => prev.filter((a) => (a._id || a.id) !== deleteTarget));
            toast('Account deleted', 'success');
        } catch {
            toast('Failed to delete account', 'error');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    return (
        <PageWrapper
            title="Accounts"
            subtitle="Manage your financial accounts"
            action={
                <Button icon={Plus} onClick={() => { setEditingAccount(null); setForm(defaultForm); setShowModal(true); }}>
                    Add Account
                </Button>
            }
        >
            {/* Summary Banner */}
            {!loading && accounts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="mb-2 flex items-center justify-between bg-gradient-to-r from-sand/40 to-linen dark:from-zinc-800/60 dark:to-zinc-900">
                        <div>
                            <p className="text-xs text-drift dark:text-zinc-400 mb-1">Total Net Worth</p>
                            <p className={`text-2xl font-semibold tabular-nums ${totalBalance < 0 ? 'text-red-600/70 dark:text-red-400' : 'text-obsidian dark:text-white'}`}>
                                {formatCurrency(totalBalance, currency)}
                            </p>
                        </div>
                        <div className="text-xs text-drift dark:text-zinc-500">
                            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                        </div>
                    </Card>
                </motion.div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : accounts.length === 0 ? (
                <Card className="text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-sand/60 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-6 h-6 text-drift dark:text-zinc-400" />
                    </div>
                    <p className="text-drift dark:text-zinc-400 text-sm mb-1 font-medium">No accounts added yet</p>
                    <p className="text-xs text-drift/70 dark:text-zinc-500 mb-4">Add your bank accounts, wallets, and cards to track balances</p>
                    <Button onClick={() => setShowModal(true)} icon={Plus}>Add Account</Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {accounts.map((account) => {
                            const Icon = TYPE_ICONS[account.type] || Wallet;
                            const isNegative = (account.balance || 0) < 0;
                            return (
                                <motion.div
                                    key={account._id || account.id}
                                    layout
                                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                >
                                    <Card className="h-full flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-sand/60 dark:bg-zinc-800 flex items-center justify-center">
                                                    <Icon className="w-5 h-5 text-char dark:text-zinc-300" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-obsidian dark:text-white text-sm">
                                                        {account.name}
                                                    </h3>
                                                    <Badge className="mt-1">
                                                        {ACCOUNT_TYPES.find(t => t.value === account.type)?.label || account.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(account)}
                                                    className="p-1.5 rounded-lg text-drift dark:text-zinc-500 hover:text-[var(--color-accent)] hover:bg-sand/40 dark:hover:bg-zinc-800 transition-all duration-300 cursor-pointer"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(account._id || account.id)}
                                                    className="p-1.5 rounded-lg text-drift dark:text-zinc-500 hover:text-red-700/60 dark:hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/30 transition-all duration-300 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-stone/15 dark:border-zinc-800">
                                            <p className="text-xs text-drift dark:text-zinc-500 mb-1">Balance</p>
                                            <p className={`text-2xl font-semibold tabular-nums ${isNegative
                                                ? 'text-red-600/70 dark:text-red-400'
                                                : 'text-obsidian dark:text-white'
                                                }`}>
                                                {formatCurrency(account.balance || 0, account.currency || currency)}
                                            </p>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Create/Edit Account Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingAccount(null); setForm(defaultForm); }}
                title={editingAccount ? 'Edit Account' : 'Add Account'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Account Name"
                        placeholder="e.g., Main Checking"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        required
                    />
                    <Select
                        label="Account Type"
                        value={form.type}
                        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                        options={ACCOUNT_TYPES}
                    />
                    <Input
                        label={editingAccount ? 'Current Balance' : 'Opening Balance'}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form.balance}
                        onChange={(e) => setForm((p) => ({ ...p, balance: e.target.value }))}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" type="button" onClick={() => { setShowModal(false); setEditingAccount(null); setForm(defaultForm); }}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving}>
                            {editingAccount ? 'Save Changes' : 'Create Account'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Account?"
                message="This will permanently remove this account. Transactions linked to this account will not be deleted."
                confirmText="Delete"
                loading={deleting}
            />
        </PageWrapper>
    );
}
