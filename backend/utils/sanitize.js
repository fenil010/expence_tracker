/**
 * Sanitization Utilities
 * 
 * Helpers to prevent injection attacks, ReDoS, and XSS.
 */

/**
 * Escape special regex characters to prevent ReDoS attacks.
 * Use this whenever user input is placed inside a RegExp.
 * 
 * @param {string} str - User-supplied string
 * @returns {string} Escaped string safe for RegExp
 */
export function escapeRegex(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strip HTML tags from a string to prevent stored XSS.
 * 
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum allowed length (default 500)
 * @returns {string} Sanitized string
 */
export function sanitizeString(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<[^>]*>/g, '')       // Strip HTML tags
        .replace(/[<>]/g, '')           // Remove any remaining angle brackets
        .trim()
        .slice(0, maxLength);
}

/**
 * Validate that a value is a safe positive number within bounds.
 * 
 * @param {*} value - Value to check
 * @param {number} max - Maximum allowed value
 * @returns {number|null} Parsed number or null if invalid
 */
export function safeNumber(value, max = 999999999) {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num) || num < 0 || num > max) return null;
    return num;
}
