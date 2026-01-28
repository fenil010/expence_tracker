/**
 * useExpenseData Hook
 * 
 * Single source of truth for expense data in the app.
 * Provides reactive state, mutation actions, and derived calculations.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { loadData, saveData, resetData as resetStorageData } from '../data/storage';
import { generateId } from '../data/schema';

/**
 * Main hook for expense data management.
 * Call this once at the top level (Dashboard) and pass data down via props.
 * 
 * @returns {Object} Data, loading state, actions, and derived values
 */
export function useExpenseData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    useEffect(() => {
        // Load data from LocalStorage on mount
        const storedData = loadData();
        setData(storedData);
        setLoading(false);
    }, []);

    // ========================================================================
    // PERSIST TO LOCALSTORAGE
    // ========================================================================

    useEffect(() => {
        // Save to LocalStorage whenever data changes (skip initial null)
        if (data !== null) {
            saveData(data);
        }
    }, [data]);

    // ========================================================================
    // ACTIONS (Mutations)
    // ========================================================================

    /**
     * Add funds to balance
     * @param {number} amount - Amount to add (positive number)
     */
    const addFunds = useCallback((amount) => {
        if (typeof amount !== 'number' || amount <= 0) return;

        setData((prev) => ({
            ...prev,
            balance: prev.balance + amount,
            transactions: [
                {
                    id: generateId(),
                    type: 'income',
                    category: 'Other',
                    amount,
                    description: 'Added funds',
                    date: new Date().toISOString(),
                },
                ...prev.transactions,
            ],
        }));
    }, []);

    /**
     * Add a new transaction
     * @param {Object} transaction - Transaction details
     * @param {'income' | 'expense'} transaction.type
     * @param {string} transaction.category
     * @param {number} transaction.amount - Positive number
     * @param {string} transaction.description
     */
    const addTransaction = useCallback((transaction) => {
        const { type, category, amount, description } = transaction;
        if (!type || !category || typeof amount !== 'number' || amount <= 0) return;

        setData((prev) => {
            const balanceChange = type === 'income' ? amount : -amount;

            return {
                ...prev,
                balance: prev.balance + balanceChange,
                transactions: [
                    {
                        id: generateId(),
                        type,
                        category,
                        amount,
                        description: description || category,
                        date: new Date().toISOString(),
                    },
                    ...prev.transactions,
                ],
            };
        });
    }, []);

    /**
     * Update a goal's current amount
     * @param {string} goalId - Goal ID
     * @param {number} amount - Amount to add (can be negative)
     */
    const updateGoal = useCallback((goalId, amount) => {
        if (!goalId || typeof amount !== 'number') return;

        setData((prev) => ({
            ...prev,
            goals: prev.goals.map((goal) =>
                goal.id === goalId
                    ? { ...goal, current: Math.max(0, Math.min(goal.target, goal.current + amount)) }
                    : goal
            ),
        }));
    }, []);

    /**
     * Update user profile
     * @param {Partial<import('../data/schema').User>} updates
     */
    const updateUser = useCallback((updates) => {
        setData((prev) => ({
            ...prev,
            user: { ...prev.user, ...updates },
        }));
    }, []);

    /**
     * Update monthly budget
     * @param {number} budget - New budget amount
     */
    const updateBudget = useCallback((budget) => {
        if (typeof budget !== 'number' || budget < 0) return;

        setData((prev) => ({
            ...prev,
            monthlyBudget: budget,
        }));
    }, []);

    /**
     * Reset all data to defaults
     */
    const resetData = useCallback(() => {
        const freshData = resetStorageData();
        setData(freshData);
    }, []);

    // ========================================================================
    // DERIVED VALUES (Computed from data)
    // ========================================================================

    /**
     * Total spending for current month (sum of expense transactions)
     */
    const totalSpending = useMemo(() => {
        if (!data) return 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return data.transactions
            .filter((tx) => {
                const txDate = new Date(tx.date);
                return (
                    tx.type === 'expense' &&
                    txDate.getMonth() === currentMonth &&
                    txDate.getFullYear() === currentYear
                );
            })
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [data]);

    /**
     * Remaining budget for current month
     */
    const remainingBudget = useMemo(() => {
        if (!data) return 0;
        return Math.max(0, data.monthlyBudget - totalSpending);
    }, [data, totalSpending]);

    /**
     * Budget usage percentage (0-100)
     */
    const budgetUsagePercent = useMemo(() => {
        if (!data || data.monthlyBudget === 0) return 0;
        return Math.min(100, Math.round((totalSpending / data.monthlyBudget) * 100));
    }, [data, totalSpending]);

    /**
     * Recent transactions (last 10)
     */
    const recentTransactions = useMemo(() => {
        if (!data) return [];
        return data.transactions.slice(0, 10);
    }, [data]);

    /**
     * Net worth chart data (monthly aggregated from transactions)
     */
    const netWorthChartData = useMemo(() => {
        if (!data) return [];

        // Generate last 6 months of data
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            // Calculate net change for this month
            const monthTransactions = data.transactions.filter((tx) => {
                const txDate = new Date(tx.date);
                return (
                    txDate.getMonth() === date.getMonth() &&
                    txDate.getFullYear() === date.getFullYear()
                );
            });

            const monthNet = monthTransactions.reduce((sum, tx) => {
                return sum + (tx.type === 'income' ? tx.amount : -tx.amount);
            }, 0);

            months.push({ month: monthName, value: monthNet });
        }

        // Convert to cumulative (for line chart)
        let cumulative = data.balance - months.reduce((sum, m) => sum + m.value, 0);
        return months.map((m) => {
            cumulative += m.value;
            return { month: m.month, value: Math.round(cumulative / 1000) }; // In thousands
        });
    }, [data]);

    // ========================================================================
    // RETURN VALUE
    // ========================================================================

    return {
        // State
        data,
        loading,

        // Actions
        addFunds,
        addTransaction,
        updateGoal,
        updateUser,
        updateBudget,
        resetData,

        // Derived values
        totalSpending,
        remainingBudget,
        budgetUsagePercent,
        recentTransactions,
        netWorthChartData,
    };
}
