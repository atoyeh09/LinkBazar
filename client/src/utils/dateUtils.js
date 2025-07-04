/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 * @param {Date} date - The date to format
 * @returns {string} - Formatted relative time string
 */
export const formatDistanceToNow = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return formatDate(date);
};

/**
 * Format a date to a time string (e.g., "14:30")
 * @param {Date} date - The date to format
 * @returns {string} - Formatted time string
 */
export const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format a date to a date string (e.g., "Jan 1, 2023")
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};
