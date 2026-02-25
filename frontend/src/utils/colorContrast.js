/**
 * Calculate relative luminance of a color
 * @param {string} hex - Hex color code (e.g., '#FF0000')
 * @returns {number} Relative luminance value
 */
function getLuminance(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate luminance
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @returns {number} Contrast ratio
 */
export function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {boolean} largeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns {boolean} True if meets WCAG AA
 */
export function meetsWCAG_AA(foreground, background, largeText = false) {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = largeText ? 3 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Check if color combination meets WCAG AAA standards
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {boolean} largeText - Whether text is large
 * @returns {boolean} True if meets WCAG AAA
 */
export function meetsWCAG_AAA(foreground, background, largeText = false) {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = largeText ? 4.5 : 7;
  return ratio >= requiredRatio;
}

/**
 * Validate hex color format
 * @param {string} color - Color string to validate
 * @returns {boolean} True if valid hex color
 */
export function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}
