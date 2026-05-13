export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));

export const formatDateTime = (date) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'], [60, 'minute'], [1, 'second']
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export const truncate = (str, n = 80) => str?.length > n ? str.slice(0, n) + '…' : str;

export const getImageUrl = (url) => {
  const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
  if (!url || typeof url !== 'string') return FALLBACK;
  return url;
};

export const getOrderStatusColor = (status) => {
  const map = {
    placed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    confirmed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    out_for_delivery: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

export const getOrderStatusLabel = (status) => {
  const map = {
    placed: 'Order Placed',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
};

export const spicyLabel = (level) => ['Not Spicy', 'Mild', 'Medium', 'Hot'][level] || 'Not Spicy';

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
