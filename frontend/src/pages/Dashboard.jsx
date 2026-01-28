import { useState } from 'react';
import ProfileCard from "../components/ProfileCard";
import BalanceCard from "../components/BalanceCard";
import SpendingCard from "../components/SpendingCard";
import GoalsCard from "../components/GoalsCard";
import Transactions from "../components/Transactions";
import NetWorthChart from "../components/NetWorthChart";
import TopSearch from "../components/TopSearch";
import CalendarCard from "../components/CalendarCard";
import QuickActions from "../components/QuickActions";
import { useExpenseData } from "../hooks/useExpenseData";
import { CATEGORIES } from "../data/schema";

export default function Dashboard() {
    const {
        data,
        loading,
        addFunds,
        addTransaction,
        totalSpending,
        remainingBudget,
        budgetUsagePercent,
        recentTransactions,
        netWorthChartData,
        resetData,
    } = useExpenseData();

    // Modal state
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [fundsAmount, setFundsAmount] = useState('');
    const [newTx, setNewTx] = useState({ type: 'expense', category: 'Food', amount: '', description: '' });

    // Handle Add Funds submit
    const handleAddFunds = (e) => {
        e.preventDefault();
        const amount = parseFloat(fundsAmount);
        if (amount > 0) {
            addFunds(amount);
            setFundsAmount('');
            setShowAddFunds(false);
        }
    };

    // Handle Add Transaction submit
    const handleAddTransaction = (e) => {
        e.preventDefault();
        const amount = parseFloat(newTx.amount);
        if (amount > 0) {
            addTransaction({
                type: newTx.type,
                category: newTx.category,
                amount,
                description: newTx.description,
            });
            setNewTx({ type: 'expense', category: 'Food', amount: '', description: '' });
            setShowAddTransaction(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f5f8ff] via-[#eef3ff] to-[#f8faff] flex items-center justify-center">
                <div className="text-slate-500 text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f8ff] via-[#eef3ff] to-[#f8faff] p-10">
            <div className="max-w-7xl mx-auto">

                {/* SEARCH BAR */}
                <TopSearch />

                <div className="grid grid-cols-12 gap-8">

                    {/* ROW 1 */}
                    <div className="col-span-3">
                        <ProfileCard user={data.user} />
                    </div>

                    <div className="col-span-6">
                        <BalanceCard
                            balance={data.balance}
                            onAddFunds={() => setShowAddFunds(true)}
                        />
                    </div>

                    <div className="col-span-3">
                        <CalendarCard />
                    </div>

                    {/* ROW 2 */}
                    <div className="col-span-9">
                        <NetWorthChart chartData={netWorthChartData} />
                    </div>

                    <div className="col-span-3 row-span-2 flex flex-col gap-6">
                        <SpendingCard
                            spending={totalSpending}
                            remaining={remainingBudget}
                            budget={data.monthlyBudget}
                            usagePercent={budgetUsagePercent}
                        />
                        <QuickActions onReset={resetData} />
                    </div>


                    {/* ROW 3 */}
                    <div className="col-span-3">
                        <GoalsCard goals={data.goals} />
                    </div>

                    <div className="col-span-6">
                        <Transactions
                            transactions={recentTransactions}
                            onAddTransaction={() => setShowAddTransaction(true)}
                        />
                    </div>

                </div>
            </div>

            {/* ADD FUNDS MODAL */}
            {showAddFunds && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-semibold mb-6">Add Funds</h3>
                        <form onSubmit={handleAddFunds}>
                            <input
                                type="number"
                                value={fundsAmount}
                                onChange={(e) => setFundsAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                                min="0"
                                step="0.01"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddFunds(false)}
                                    className="flex-1 px-6 py-3 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                                >
                                    Add Funds
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD TRANSACTION MODAL */}
            {showAddTransaction && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-semibold mb-6">Add Transaction</h3>
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            {/* Type selector */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNewTx(prev => ({ ...prev, type: 'expense', category: 'Food' }))}
                                    className={`flex-1 py-3 rounded-full transition ${newTx.type === 'expense'
                                            ? 'bg-red-500 text-white'
                                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewTx(prev => ({ ...prev, type: 'income', category: 'Salary' }))}
                                    className={`flex-1 py-3 rounded-full transition ${newTx.type === 'income'
                                            ? 'bg-green-500 text-white'
                                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    Income
                                </button>
                            </div>

                            {/* Category */}
                            <select
                                value={newTx.category}
                                onChange={(e) => setNewTx(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {CATEGORIES[newTx.type].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            {/* Amount */}
                            <input
                                type="number"
                                value={newTx.amount}
                                onChange={(e) => setNewTx(prev => ({ ...prev, amount: e.target.value }))}
                                placeholder="Amount"
                                className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                            />

                            {/* Description */}
                            <input
                                type="text"
                                value={newTx.description}
                                onChange={(e) => setNewTx(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Description (optional)"
                                className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddTransaction(false)}
                                    className="flex-1 px-6 py-3 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`flex-1 px-6 py-3 rounded-full text-white transition ${newTx.type === 'expense'
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                >
                                    Add {newTx.type === 'expense' ? 'Expense' : 'Income'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
