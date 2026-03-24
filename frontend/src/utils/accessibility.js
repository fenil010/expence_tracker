/**
 * Accessibility Utilities for UI Enhancement
 * 
 * This module provides utilities for ensuring WCAG 2.1 AA compliance,
 * including contrast checking, focus management, and screen reader support.
 */

import { useEffect, useRef } from 'react';
import { getContrastRatio as calculateContrastRatio, isValidHexColor } from './colorContrast.js';

// ============================================================================
// CONTRAST RATIO UTILITIES
// ============================================================================

/**
 * Re-export contrast ratio calculator from colorContrast module
 * Calculate contrast ratio between two colors
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @returns {number} Contrast ratio (1-21)
 */
export const getContrastRatio = calculateContrastRatio;

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {boolean} largeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns {boolean} True if meets WCAG AA (4.5:1 for normal, 3:1 for large)
 */
export function meetsContrastRequirement(foreground, background, largeText = false) {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = largeText ? 3 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Adjust color brightness to meet minimum contrast ratio
 * @param {string} color - Hex color to adjust
 * @param {string} background - Background hex color
 * @param {number} targetRatio - Target contrast ratio (default: 4.5)
 * @returns {string} Adjusted hex color
 */
export function adjustColorForContrast(color, background, targetRatio = 4.5) {
  if (!isValidHexColor(color) || !isValidHexColor(background)) {
    console.warn('Invalid hex color provided to adjustColorForContrast');
    return color;
  }

  let currentRatio = getContrastRatio(color, background);
  
  // If already meets requirement, return original
  if (currentRatio >= targetRatio) {
    return color;
  }

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  let rgb = hexToRgb(color);
  if (!rgb) return color;

  // Determine if we should lighten or darken
  const bgLuminance = getLuminance(background);
  const shouldLighten = bgLuminance < 0.5;

  // Adjust brightness iteratively
  let attempts = 0;
  const maxAttempts = 100;
  const step = shouldLighten ? 5 : -5;

  while (currentRatio < targetRatio && attempts < maxAttempts) {
    rgb.r = Math.max(0, Math.min(255, rgb.r + step));
    rgb.g = Math.max(0, Math.min(255, rgb.g + step));
    rgb.b = Math.max(0, Math.min(255, rgb.b + step));

    const newColor = rgbToHex(rgb.r, rgb.g, rgb.b);
    currentRatio = getContrastRatio(newColor, background);
    attempts++;

    if (currentRatio >= targetRatio) {
      return newColor;
    }
  }

  // If we couldn't meet the ratio, return black or white depending on background
  return shouldLighten ? '#FFFFFF' : '#000000';
}

/**
 * Get relative luminance of a color (helper function)
 * @param {string} hex - Hex color code
 * @returns {number} Relative luminance (0-1)
 */
function getLuminance(hex) {
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Custom hook for trapping focus within a container (e.g., modals)
 * Ensures keyboard navigation stays within the specified element
 * 
 * @param {React.RefObject} containerRef - Ref to the container element
 * @param {boolean} isActive - Whether focus trap is active
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFocus - Auto-focus first element on activation (default: true)
 * @param {boolean} options.returnFocus - Return focus to trigger element on deactivation (default: true)
 * @returns {void}
 * 
 * @example
 * const modalRef = useRef(null);
 * useFocusTrap(modalRef, isModalOpen);
 */
export function useFocusTrap(containerRef, isActive, options = {}) {
  const {
    autoFocus = true,
    returnFocus = true
  } = options;

  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Store the element that had focus before trap activation
    if (returnFocus) {
      previousActiveElement.current = document.activeElement;
    }

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(', ');

      return Array.from(container.querySelectorAll(selector)).filter(
        element => {
          // Filter out hidden elements
          return element.offsetParent !== null && 
                 window.getComputedStyle(element).visibility !== 'hidden';
        }
      );
    };

    const focusableElements = getFocusableElements();
    
    if (focusableElements.length === 0) {
      console.warn('No focusable elements found in focus trap container');
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Auto-focus first element if enabled
    if (autoFocus) {
      firstElement.focus();
    }

    // Handle Tab key navigation
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const currentFocusableElements = getFocusableElements();
      const currentFirstElement = currentFocusableElements[0];
      const currentLastElement = currentFocusableElements[currentFocusableElements.length - 1];

      // Shift + Tab: moving backwards
      if (e.shiftKey) {
        if (document.activeElement === currentFirstElement) {
          e.preventDefault();
          currentLastElement?.focus();
        }
      } 
      // Tab: moving forwards
      else {
        if (document.activeElement === currentLastElement) {
          e.preventDefault();
          currentFirstElement?.focus();
        }
      }
    };

    // Prevent focus from leaving the container
    const handleFocusOut = (e) => {
      if (!container.contains(e.relatedTarget)) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    // Add event listeners
    container.addEventListener('keydown', handleTab);
    container.addEventListener('focusout', handleFocusOut);

    // Cleanup function
    return () => {
      container.removeEventListener('keydown', handleTab);
      container.removeEventListener('focusout', handleFocusOut);

      // Return focus to previous element if enabled
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [containerRef, isActive, autoFocus, returnFocus]);
}

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

/**
 * Announce a message to screen readers using ARIA live regions
 * Creates a temporary live region to announce dynamic content changes
 * 
 * @param {string} message - Message to announce
 * @param {Object} options - Configuration options
 * @param {('polite'|'assertive')} options.priority - Announcement priority (default: 'polite')
 * @param {number} options.timeout - Time to keep announcement in DOM (default: 1000ms)
 * @returns {void}
 * 
 * @example
 * // Polite announcement (waits for screen reader to finish current speech)
 * announce('Item added to cart');
 * 
 * // Assertive announcement (interrupts current speech)
 * announce('Error: Form submission failed', { priority: 'assertive' });
 */
export function announce(message, options = {}) {
  const {
    priority = 'polite',
    timeout = 1000
  } = options;

  if (!message || typeof message !== 'string') {
    console.warn('announce() requires a valid message string');
    return;
  }

  // Create announcement container
  const announcement = document.createElement('div');
  
  // Set ARIA attributes
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  
  // Visually hide but keep accessible to screen readers
  announcement.className = 'sr-only';
  announcement.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  `;
  
  // Set the message
  announcement.textContent = message;
  
  // Add to DOM
  document.body.appendChild(announcement);
  
  // Remove after timeout
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, timeout);
}

/**
 * Announce a loading state to screen readers
 * @param {string} message - Loading message (default: 'Loading')
 * @returns {Function} Cleanup function to announce completion
 * 
 * @example
 * const announceComplete = announceLoading('Loading transactions');
 * // ... fetch data ...
 * announceComplete('Transactions loaded');
 */
export function announceLoading(message = 'Loading') {
  announce(message, { priority: 'polite' });
  
  return (completionMessage = 'Loading complete') => {
    announce(completionMessage, { priority: 'polite' });
  };
}

/**
 * Announce an error to screen readers
 * @param {string} message - Error message
 * @returns {void}
 * 
 * @example
 * announceError('Failed to save changes. Please try again.');
 */
export function announceError(message) {
  announce(message, { priority: 'assertive' });
}

/**
 * Announce a success message to screen readers
 * @param {string} message - Success message
 * @returns {void}
 * 
 * @example
 * announceSuccess('Transaction saved successfully');
 */
export function announceSuccess(message) {
  announce(message, { priority: 'polite' });
}

// ============================================================================
// KEYBOARD NAVIGATION UTILITIES
// ============================================================================

/**
 * Check if an element is focusable
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is focusable
 */
export function isFocusable(element) {
  if (!element || element.offsetParent === null) return false;
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];
  
  return focusableSelectors.some(selector => element.matches(selector));
}

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
export function getFocusableElements(container) {
  if (!container) return [];
  
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');
  
  return Array.from(container.querySelectorAll(selector)).filter(
    element => element.offsetParent !== null
  );
}

/**
 * Custom hook to handle Escape key press
 * @param {Function} callback - Function to call when Escape is pressed
 * @param {boolean} isActive - Whether the handler is active
 * 
 * @example
 * useEscapeKey(() => closeModal(), isModalOpen);
 */
export function useEscapeKey(callback, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback, isActive]);
}

// ============================================================================
// ARIA UTILITIES
// ============================================================================

/**
 * Generate a unique ID for ARIA attributes
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
let idCounter = 0;
export function generateAriaId(prefix = 'aria') {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Custom hook to generate stable ARIA IDs
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Stable unique ID
 * 
 * @example
 * const labelId = useAriaId('label');
 * const descId = useAriaId('description');
 */
export function useAriaId(prefix = 'aria') {
  const idRef = useRef(null);
  
  if (!idRef.current) {
    idRef.current = generateAriaId(prefix);
  }
  
  return idRef.current;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Contrast utilities
  getContrastRatio,
  meetsContrastRequirement,
  adjustColorForContrast,
  
  // Focus management
  useFocusTrap,
  isFocusable,
  getFocusableElements,
  useEscapeKey,
  
  // Screen reader announcements
  announce,
  announceLoading,
  announceError,
  announceSuccess,
  
  // ARIA utilities
  generateAriaId,
  useAriaId
};
