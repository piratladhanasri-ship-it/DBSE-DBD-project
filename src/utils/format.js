export function formatCurrency(value, currency = 'INR') {
  const amount = Number(value || 0);
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function relativeTime(value) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

/** Breaks a remaining-millisecond value into padded countdown parts. */
export function countdownParts(ms) {
  const clamped = Math.max(0, ms);
  const total = Math.floor(clamped / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor(total % 86400 / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const seconds = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return {
    days,
    hours,
    minutes,
    seconds,
    ended: clamped <= 0,
    label: days > 0 ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    short: days > 0 ? `${days}d ${hours}h` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  };
}

export function initials(name = '') {
  return name.
  split(' ').
  filter(Boolean).
  slice(0, 2).
  map((p) => p[0].toUpperCase()).
  join('');
}

export function minimumNextBid(currentBid, increment = 500) {
  return Number(currentBid || 0) + increment;
}