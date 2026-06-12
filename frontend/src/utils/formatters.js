/**
 * Format price as INR currency string.
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format ISO date string to readable date.
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(isoString));
}

/**
 * Get category badge color classes.
 */
export function getCategoryColor(category) {
  const colors = {
    'Textbooks': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'Calculators': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    'Graphics Tools': 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20',
    'Engineering Instruments': 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    'Lab Equipment': 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    'Study Materials': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'Others': 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  };
  return colors[category] || colors.Others;
}
