/**
 * Currency formatting utilities for Tanzanian Shillings (TSh)
 */

/**
 * Format currency amount to Tanzanian Shillings
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the TSh symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  const numericAmount = parseFloat(amount) || 0;
  const formatted = numericAmount.toLocaleString('en-TZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return showSymbol ? `TSh ${formatted}` : formatted;
};

/**
 * Format currency amount without decimal places for whole numbers
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the TSh symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrencyWhole = (amount, showSymbol = true) => {
  const numericAmount = parseInt(amount) || 0;
  const formatted = numericAmount.toLocaleString('en-TZ');
  
  return showSymbol ? `TSh ${formatted}` : formatted;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - String containing currency amount
 * @returns {number} Parsed numeric value
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString === 'number') return currencyString;
  if (!currencyString) return 0;
  
  // Remove TSh symbol and any non-numeric characters except decimal point
  const cleanString = currencyString.toString().replace(/[^\d.-]/g, '');
  return parseFloat(cleanString) || 0;
};

/**
 * Currency symbol constant
 */
export const CURRENCY_SYMBOL = 'TSh';

/**
 * Currency code constant
 */
export const CURRENCY_CODE = 'TZS';
