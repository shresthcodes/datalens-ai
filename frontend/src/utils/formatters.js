/**
 * Formats a number cleanly with commas. Adds currency symbols if specified.
 */
export const formatNumber = (value, unit = '') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  const num = Number(value);
  
  // Format based on integer vs float
  let formatted = '';
  if (Number.isInteger(num)) {
    formatted = num.toLocaleString();
  } else {
    // If float, keep 2 decimal places
    formatted = num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  if (unit === '$') {
    return `$${formatted}`;
  } else if (unit) {
    return `${formatted} ${unit}`;
  }
  
  return formatted;
};

/**
 * Standardizes raw date strings into readable formats.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};
