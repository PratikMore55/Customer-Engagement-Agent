// Helper functions for the frontend

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get lead classification color
 */
export const getLeadColor = (classification) => {
  const colors = {
    hot: '#ef4444', // red
    normal: '#f59e0b', // orange
    cold: '#3b82f6', // blue
  };
  return colors[classification] || '#6b7280';
};

/**
 * Get lead classification background color (lighter)
 */
export const getLeadBgColor = (classification) => {
  const colors = {
    hot: '#fee2e2', // light red
    normal: '#fef3c7', // light orange
    cold: '#dbeafe', // light blue
  };
  return colors[classification] || '#f3f4f6';
};

/**
 * Get lead classification label
 */
export const getLeadLabel = (classification) => {
  const labels = {
    hot: '🔥 Hot Lead',
    normal: '⚡ Normal Lead',
    cold: '❄️ Cold Lead',
  };
  return labels[classification] || classification;
};

/**
 * Get confidence percentage
 */
export const getConfidencePercent = (score) => {
  return `${(score * 100).toFixed(0)}%`;
};

/**
 * Get follow-up status color
 */
export const getFollowUpColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    contacted: '#3b82f6',
    'in-progress': '#8b5cf6',
    converted: '#10b981',
    lost: '#6b7280',
  };
  return colors[status] || '#6b7280';
};

/**
 * Get follow-up status label
 */
export const getFollowUpLabel = (status) => {
  const labels = {
    pending: 'Pending',
    contacted: 'Contacted',
    'in-progress': 'In Progress',
    converted: 'Converted',
    lost: 'Lost',
  };
  return labels[status] || status;
};

/**
 * Truncate text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Format currency
 */
export const formatCurrency = (amount) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate days until date
 */
export const daysUntil = (date) => {
  if (!date) return null;
  const now = new Date();
  const target = new Date(date);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Get relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return 'Never';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

export default {
  formatDate,
  formatDateTime,
  getLeadColor,
  getLeadBgColor,
  getLeadLabel,
  getConfidencePercent,
  getFollowUpColor,
  getFollowUpLabel,
  truncate,
  getInitials,
  isValidEmail,
  formatCurrency,
  daysUntil,
  getRelativeTime,
};