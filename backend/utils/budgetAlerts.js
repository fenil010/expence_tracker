/**
 * Budget alert checks
 * 
 * Creates in-app notifications when budget thresholds are reached.
 */

import Budget from '../models/Budget.js';
import Notification from '../models/Notification.js';

const SHOULD_ALERT_DELTA = 5; // percent increase to re-alert
const MIN_ALERT_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function checkBudgetAlerts({ userId, categoryId, date }) {
  const now = date ? new Date(date) : new Date();

  const budgets = await Budget.find({
    user: userId,
    status: 'active',
    alertEnabled: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { category: null },
      { category: categoryId }
    ]
  });

  if (!budgets.length) return [];

  const alerts = [];

  for (const budget of budgets) {
    const spent = await budget.calculateSpent();
    const totalBudget = budget.amount + (budget.carryOverAmount || 0);
    const usage = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;

    if (usage < budget.alertThreshold) continue;

    const lastUsage = budget.lastAlertUsage;
    const lastAt = budget.lastAlertAt ? new Date(budget.lastAlertAt).getTime() : 0;
    const nowTs = Date.now();

    const shouldAlert =
      lastUsage === null ||
      usage - lastUsage >= SHOULD_ALERT_DELTA ||
      nowTs - lastAt >= MIN_ALERT_INTERVAL_MS;

    if (!shouldAlert) continue;

    const budgetLabel = budget.category ? `${budget.name}` : 'Monthly Budget';
    const title = `Budget alert: ${budgetLabel}`;
    const message = `You have used ${usage}% of this budget.`;

    const notification = await Notification.create({
      user: userId,
      type: 'budget_alert',
      title,
      message,
      data: {
        budgetId: budget._id,
        usage,
        threshold: budget.alertThreshold
      }
    });

    budget.lastAlertAt = new Date();
    budget.lastAlertUsage = usage;
    await budget.save();

    alerts.push(notification);
  }

  return alerts;
}

export default checkBudgetAlerts;
