import { formatCurrency as formatCurrencyUtil, getDefaultCurrency } from './currencies';

/**
 * Calculate budget health status based on spending vs limit
 * @param {number} spent - Current spending amount
 * @param {number} limit - Budget limit
 * @returns {Object} Budget health information
 */
export function calculateBudgetHealth(spent, limit) {
  // Handle edge cases
  if (limit <= 0) {
    return {
      percentage: 0,
      status: 'healthy',
      color: '#10b981',
      colorDark: '#34d399',
      remaining: 0,
      isOverBudget: false
    };
  }

  const percentage = (spent / limit) * 100;
  const remaining = limit - spent;
  const isOverBudget = spent > limit;

  let status;
  let color;
  let colorDark;

  if (percentage < 70) {
    status = 'healthy';
    color = '#10b981'; // green-500
    colorDark = '#34d399'; // green-400
  } else if (percentage < 90) {
    status = 'warning';
    color = '#f59e0b'; // amber-500
    colorDark = '#fbbf24'; // amber-400
  } else if (percentage < 100) {
    status = 'critical';
    color = '#ef4444'; // red-500
    colorDark = '#f87171'; // red-400
  } else {
    status = 'over';
    color = '#ef4444'; // red-500
    colorDark = '#f87171'; // red-400
  }

  return {
    percentage: Math.min(percentage, 100), // Cap display at 100%
    actualPercentage: percentage, // Keep actual for calculations
    status,
    color,
    colorDark,
    remaining,
    isOverBudget
  };
}

/**
 * Get status label for budget health
 * @param {string} status - Budget status (healthy, warning, critical, over)
 * @returns {string} Human-readable status label
 */
export function getStatusLabel(status) {
  const labels = {
    healthy: 'On Track',
    warning: 'Approaching Limit',
    critical: 'Near Limit',
    over: 'Over Budget'
  };
  return labels[status] || 'Unknown';
}

/**
 * Format currency for display using default currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  const currency = getDefaultCurrency();
  return formatCurrencyUtil(amount, currency);
}
