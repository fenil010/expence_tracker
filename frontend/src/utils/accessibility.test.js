/**
 * Unit Tests for Accessibility Utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  getContrastRatio,
  meetsContrastRequirement,
  adjustColorForContrast,
  useFocusTrap,
  announce,
  announceLoading,
  announceError,
  announceSuccess,
  isFocusable,
  getFocusableElements,
  useEscapeKey,
  generateAriaId,
  useAriaId
} from './accessibility.js';

// ============================================================================
// CONTRAST RATIO TESTS
// ============================================================================

describe('Contrast Ratio Utilities', () => {
  describe('getContrastRatio', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should calculate correct contrast ratio for same colors', () => {
      const ratio = getContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should handle colors without # prefix', () => {
      const ratio = getContrastRatio('000000', 'FFFFFF');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should be symmetric (order should not matter)', () => {
      const ratio1 = getContrastRatio('#FF0000', '#00FF00');
      const ratio2 = getContrastRatio('#00FF00', '#FF0000');
      expect(ratio1).toBeCloseTo(ratio2, 2);
    });
  });

  describe('meetsContrastRequirement', () => {
    it('should return true for black text on white background', () => {
      expect(meetsContrastRequirement('#000000', '#FFFFFF')).toBe(true);
    });

    it('should return false for light gray on white', () => {
      expect(meetsContrastRequirement('#CCCCCC', '#FFFFFF')).toBe(false);
    });

    it('should use 3:1 ratio for large text', () => {
      // A combination that meets 3:1 but not 4.5:1
      const result = meetsContrastRequirement('#767676', '#FFFFFF', true);
      expect(result).toBe(true);
    });

    it('should use 4.5:1 ratio for normal text', () => {
      const result = meetsContrastRequirement('#767676', '#FFFFFF', false);
      expect(result).toBe(false);
    });
  });

  describe('adjustColorForContrast', () => {
    it('should return original color if already meets requirement', () => {
      const color = '#000000';
      const background = '#FFFFFF';
      const adjusted = adjustColorForContrast(color, background, 4.5);
      expect(adjusted).toBe(color);
    });

    it('should adjust color to meet minimum contrast', () => {
      const color = '#CCCCCC';
      const background = '#FFFFFF';
      const adjusted = adjustColorForContrast(color, background, 4.5);
      const ratio = getContrastRatio(adjusted, background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should handle invalid hex colors gracefully', () => {
      const color = 'invalid';
      const background = '#FFFFFF';
      const adjusted = adjustColorForContrast(color, background, 4.5);
      expect(adjusted).toBe(color);
    });

    it('should lighten colors on dark backgrounds', () => {
      const color = '#333333';
      const background = '#000000';
      const adjusted = adjustColorForContrast(color, background, 4.5);
      const ratio = getContrastRatio(adjusted, background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should darken colors on light backgrounds', () => {
      const color = '#CCCCCC';
      const background = '#FFFFFF';
      const adjusted = adjustColorForContrast(color, background, 4.5);
      const ratio = getContrastRatio(adjusted, background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});

// ============================================================================
// FOCUS TRAP TESTS
// ============================================================================

describe('Focus Management', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <a id="link1" href="#">Link 1</a>
      <button id="btn2">Button 2</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('useFocusTrap', () => {
    it('should focus first element when activated', () => {
      const ref = { current: container };
      renderHook(() => useFocusTrap(ref, true));
      
      expect(document.activeElement).toBe(document.getElementById('btn1'));
    });

    it('should trap focus within container on Tab', () => {
      const ref = { current: container };
      renderHook(() => useFocusTrap(ref, true));
      
      const lastButton = document.getElementById('btn2');
      lastButton.focus();
      
      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      container.dispatchEvent(tabEvent);
      
      // Should wrap to first element
      expect(document.activeElement).toBe(document.getElementById('btn1'));
    });

    it('should trap focus on Shift+Tab', () => {
      const ref = { current: container };
      renderHook(() => useFocusTrap(ref, true));
      
      const firstButton = document.getElementById('btn1');
      firstButton.focus();
      
      // Simulate Shift+Tab
      const shiftTabEvent = new KeyboardEvent('keydown', { 
        key: 'Tab', 
        shiftKey: true, 
        bubbles: true 
      });
      container.dispatchEvent(shiftTabEvent);
      
      // Should wrap to last element
      expect(document.activeElement).toBe(document.getElementById('btn2'));
    });

    it('should not activate when isActive is false', () => {
      const ref = { current: container };
      const previousActive = document.activeElement;
      
      renderHook(() => useFocusTrap(ref, false));
      
      expect(document.activeElement).toBe(previousActive);
    });

    it('should skip autoFocus when option is false', () => {
      const ref = { current: container };
      const previousActive = document.activeElement;
      
      renderHook(() => useFocusTrap(ref, true, { autoFocus: false }));
      
      expect(document.activeElement).toBe(previousActive);
    });
  });

  describe('isFocusable', () => {
    it('should return true for focusable elements', () => {
      const button = document.getElementById('btn1');
      expect(isFocusable(button)).toBe(true);
    });

    it('should return false for disabled elements', () => {
      const button = document.createElement('button');
      button.disabled = true;
      document.body.appendChild(button);
      
      expect(isFocusable(button)).toBe(false);
      
      document.body.removeChild(button);
    });

    it('should return false for null', () => {
      expect(isFocusable(null)).toBe(false);
    });
  });

  describe('getFocusableElements', () => {
    it('should return all focusable elements in container', () => {
      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(4);
    });

    it('should return empty array for null container', () => {
      const elements = getFocusableElements(null);
      expect(elements).toEqual([]);
    });

    it('should exclude disabled elements', () => {
      const disabledBtn = document.createElement('button');
      disabledBtn.disabled = true;
      container.appendChild(disabledBtn);
      
      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(4); // Should still be 4, not 5
    });
  });

  describe('useEscapeKey', () => {
    it('should call callback when Escape is pressed', () => {
      const callback = vi.fn();
      renderHook(() => useEscapeKey(callback, true));
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not call callback when inactive', () => {
      const callback = vi.fn();
      renderHook(() => useEscapeKey(callback, false));
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should not call callback for other keys', () => {
      const callback = vi.fn();
      renderHook(() => useEscapeKey(callback, true));
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
});

// ============================================================================
// SCREEN READER ANNOUNCEMENT TESTS
// ============================================================================

describe('Screen Reader Announcements', () => {
  afterEach(() => {
    // Clean up any announcement elements
    const announcements = document.querySelectorAll('[role="status"]');
    announcements.forEach(el => el.remove());
  });

  describe('announce', () => {
    it('should create announcement element with correct attributes', () => {
      announce('Test message');
      
      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();
      expect(announcement.getAttribute('aria-live')).toBe('polite');
      expect(announcement.getAttribute('aria-atomic')).toBe('true');
      expect(announcement.textContent).toBe('Test message');
    });

    it('should use assertive priority when specified', () => {
      announce('Urgent message', { priority: 'assertive' });
      
      const announcement = document.querySelector('[role="status"]');
      expect(announcement.getAttribute('aria-live')).toBe('assertive');
    });

    it('should remove announcement after timeout', async () => {
      announce('Test message', { timeout: 100 });
      
      expect(document.querySelector('[role="status"]')).toBeTruthy();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(document.querySelector('[role="status"]')).toBeFalsy();
    });

    it('should handle empty message gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      announce('');
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(document.querySelector('[role="status"]')).toBeFalsy();
      
      consoleSpy.mockRestore();
    });

    it('should handle non-string message gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      announce(null);
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should apply sr-only styling', () => {
      announce('Test message');
      
      const announcement = document.querySelector('[role="status"]');
      expect(announcement.className).toBe('sr-only');
      expect(announcement.style.position).toBe('absolute');
    });
  });

  describe('announceLoading', () => {
    it('should announce loading message', () => {
      announceLoading('Loading data');
      
      const announcement = document.querySelector('[role="status"]');
      expect(announcement.textContent).toBe('Loading data');
    });

    it('should return completion function', () => {
      const complete = announceLoading('Loading');
      expect(typeof complete).toBe('function');
    });

    it('should announce completion when completion function is called', async () => {
      const complete = announceLoading('Loading');
      
      // Wait for loading announcement to be removed
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      complete('Done loading');
      
      const announcement = document.querySelector('[role="status"]');
      expect(announcement.textContent).toBe('Done loading');
    });

    it('should use default messages', () => {
      const complete = announceLoading();
      
      let announcement = document.querySelector('[role="status"]');
      expect(announcement.textContent).toBe('Loading');
    });
  });

  describe('announceError', () => {
    it('should announce error with assertive priority', () => {
      announceError('Error occurred');
      
      const announcement = document.querySelector('[role="status"]');
      expect(announcement.textContent).toBe('Error occurred');
      expect(announcement.getAttribute('aria-live')).toBe('assertive');
    });
  });

  describe('announceSuccess', () => {
    it('should announce success with polite priority', () => {
      announceSuccess('Operation successful');
      
      const announcement = document.querySelector('[role="status"]');
      expect(announcement.textContent).toBe('Operation successful');
      expect(announcement.getAttribute('aria-live')).toBe('polite');
    });
  });
});

// ============================================================================
// ARIA UTILITIES TESTS
// ============================================================================

describe('ARIA Utilities', () => {
  describe('generateAriaId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateAriaId();
      const id2 = generateAriaId();
      
      expect(id1).not.toBe(id2);
    });

    it('should use custom prefix', () => {
      const id = generateAriaId('custom');
      expect(id).toMatch(/^custom-/);
    });

    it('should use default prefix', () => {
      const id = generateAriaId();
      expect(id).toMatch(/^aria-/);
    });
  });

  describe('useAriaId', () => {
    it('should generate stable ID across renders', () => {
      const { result, rerender } = renderHook(() => useAriaId());
      
      const firstId = result.current;
      rerender();
      const secondId = result.current;
      
      expect(firstId).toBe(secondId);
    });

    it('should use custom prefix', () => {
      const { result } = renderHook(() => useAriaId('label'));
      expect(result.current).toMatch(/^label-/);
    });

    it('should generate different IDs for different hook instances', () => {
      const { result: result1 } = renderHook(() => useAriaId());
      const { result: result2 } = renderHook(() => useAriaId());
      
      expect(result1.current).not.toBe(result2.current);
    });
  });
});
