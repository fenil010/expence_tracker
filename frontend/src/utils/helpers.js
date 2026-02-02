// Category icon mapping with modern SVG icons
export const getCategoryIcon = (category) => {
  const icons = {
    // Expense categories
    Food: '🍽️',
    Transport: '🚗',
    Shopping: '🛍️',
    Entertainment: '🎬',
    Bills: '📄',
    Health: '💪',
    Other: '💰',
    // Income categories
    Salary: '💼',
    Freelance: '💻',
    Investment: '📈',
    Gift: '🎁',
  };
  return icons[category] || '💰';
};

// Format currency with proper styling
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date in a readable way
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  // Check if yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Format as "Jan 15"
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get month name
export const getMonthName = (date = new Date()) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Calculate percentage
export const calculatePercentage = (current, total) => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};
