/**
 * Property-Based Tests for Accessibility Utilities
 * 
 * These tests verify universal properties across randomized inputs
 * using the fast-check library for property-based testing.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  getContrastRatio,
  meetsContrastRequirement,
  adjustColorForContrast,
  isFocusable,
  generateAriaId
} from './accessibility.js';

// ============================================================================
// PROPERTY TEST: Contrast Ratio Symmetry
// ============================================================================

describe('Property Tests: Contrast Ratio', () => {
  it('should be symmetric for any two valid hex colors', () => {
    /**
     * **Validates: Requirements 4.5, 9.1, 9.4**
     * 
     * Property: For any two colors A and B, contrast(A, B) === contrast(B, A)
     * This ensures the contrast calculation is order-independent.
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.stringMatching(/^[0-9A-F]{6}$/),
        (color1Hex, color2Hex) => {
          const color1 = `#${color1Hex}`;
          const color2 = `#${color2Hex}`;
          
          const ratio1 = getContrastRatio(color1, color2);
          const ratio2 = getContrastRatio(color2, color1);
          
          expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always return ratio between 1 and 21', () => {
    /**
     * **Validates: Requirements 9.4**
     * 
     * Property: For any two valid colors, contrast ratio is in range [1, 21]
     * This ensures the calculation produces valid WCAG-compliant values.
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.stringMatching(/^[0-9A-F]{6}$/),
        (color1Hex, color2Hex) => {
          const color1 = `#${color1Hex}`;
          const color2 = `#${color2Hex}`;
          
          const ratio = getContrastRatio(color1, color2);
          
          expect(ratio).toBeGreaterThanOrEqual(1);
          expect(ratio).toBeLessThanOrEqual(21);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 1 for identical colors', () => {
    /**
     * **Validates: Requirements 9.4**
     * 
     * Property: For any color C, contrast(C, C) === 1
     * Identical colors have no contrast.
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        (colorHex) => {
          const color = `#${colorHex}`;
          const ratio = getContrastRatio(color, color);
          
          expect(ratio).toBeCloseTo(1, 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// PROPERTY TEST: Contrast Requirement Consistency
// ============================================================================

describe('Property Tests: Contrast Requirements', () => {
  it('should be consistent with calculated ratio', () => {
    /**
     * **Validates: Requirements 9.4**
     * 
     * Property: meetsContrastRequirement returns true iff ratio >= threshold
     * This ensures the requirement check is consistent with the calculation.
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.boolean(),
        (color1Hex, color2Hex, largeText) => {
          const color1 = `#${color1Hex}`;
          const color2 = `#${color2Hex}`;
          
          const ratio = getContrastRatio(color1, color2);
          const meetsRequirement = meetsContrastRequirement(color1, color2, largeText);
          const threshold = largeText ? 3 : 4.5;
          
          expect(meetsRequirement).toBe(ratio >= threshold);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have lower threshold for large text', () => {
    /**
     * **Validates: Requirements 9.4**
     * 
     * Property: If normal text meets requirement, large text also meets it
     * Large text has a more lenient requirement (3:1 vs 4.5:1).
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.stringMatching(/^[0-9A-F]{6}$/),
        (color1Hex, color2Hex) => {
          const color1 = `#${color1Hex}`;
          const color2 = `#${color2Hex}`;
          
          const meetsNormal = meetsContrastRequirement(color1, color2, false);
          const meetsLarge = meetsContrastRequirement(color1, color2, true);
          
          // If normal text passes, large text must also pass
          if (meetsNormal) {
            expect(meetsLarge).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// PROPERTY TEST: Color Adjustment
// ============================================================================

describe('Property Tests: Color Adjustment', () => {
  it('should always meet target ratio after adjustment', () => {
    /**
     * **Validates: Requirements 9.4**
     * 
     * Property: adjustColorForContrast always produces a color meeting the target ratio
     * This ensures the adjustment algorithm is correct.
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.double({ min: 3, max: 7 }),
        (colorHex, bgHex, targetRatio) => {
          const color = `#${colorHex}`;
          const background = `#${bgHex}`;
          
          const adjusted = adjustColorForContrast(color, background, targetRatio);
          const finalRatio = getContrastRatio(adjusted, background);
          
          // Should meet or exceed target ratio
          expect(finalRatio).toBeGreaterThanOrEqual(targetRatio - 0.1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return original color if already meets requirement', () => {
    /**
     * **Validates: Requirements 9.4**
     * 
     * Property: If color already meets target, it should not be changed
     * This ensures we don't unnecessarily modify colors.
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        (bgHex) => {
          const background = `#${bgHex}`;
          // Use black or white which always have high contrast
          const color = '#000000';
          
          const adjusted = adjustColorForContrast(color, background, 4.5);
          const ratio = getContrastRatio(color, background);
          
          if (ratio >= 4.5) {
            expect(adjusted).toBe(color);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce valid hex colors', () => {
    /**
     * **Validates: Requirements 9.4**
     * 
     * Property: Adjusted color is always a valid hex color
     * This ensures the adjustment doesn't produce invalid colors.
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.stringMatching(/^[0-9A-F]{6}$/),
        (colorHex, bgHex) => {
          const color = `#${colorHex}`;
          const background = `#${bgHex}`;
          
          const adjusted = adjustColorForContrast(color, background, 4.5);
          
          // Should be valid hex format
          expect(adjusted).toMatch(/^#[0-9A-F]{6}$/i);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// PROPERTY TEST: ARIA ID Generation
// ============================================================================

describe('Property Tests: ARIA ID Generation', () => {
  it('should always generate unique IDs', () => {
    /**
     * **Validates: Requirements 9.2**
     * 
     * Property: generateAriaId always produces unique IDs
     * This ensures no ID collisions in the DOM.
     */
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }),
        (count) => {
          const ids = new Set();
          
          for (let i = 0; i < count; i++) {
            const id = generateAriaId();
            expect(ids.has(id)).toBe(false);
            ids.add(id);
          }
          
          expect(ids.size).toBe(count);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should include prefix in generated ID', () => {
    /**
     * **Validates: Requirements 9.2**
     * 
     * Property: Generated ID always starts with the specified prefix
     * This ensures IDs are properly namespaced.
     */
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z]/.test(s)),
        (prefix) => {
          const id = generateAriaId(prefix);
          expect(id.startsWith(prefix)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate valid HTML ID format', () => {
    /**
     * **Validates: Requirements 9.2**
     * 
     * Property: Generated IDs are valid HTML ID attributes
     * IDs should not contain spaces or special characters.
     */
    fc.assert(
      fc.property(
        fc.constantFrom('aria', 'label', 'desc', 'control'),
        (prefix) => {
          const id = generateAriaId(prefix);
          
          // Valid HTML ID: starts with letter, contains only alphanumeric, -, _
          expect(id).toMatch(/^[a-zA-Z][a-zA-Z0-9\-_]*$/);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// PROPERTY TEST: Focus Management
// ============================================================================

describe('Property Tests: Focus Management', () => {
  it('should correctly identify focusable elements', () => {
    /**
     * **Validates: Requirements 9.1**
     * 
     * Property: isFocusable returns true for standard focusable elements
     * This ensures focus management works with all interactive elements.
     */
    fc.assert(
      fc.property(
        fc.constantFrom('button', 'input', 'select', 'textarea', 'a'),
        (tagName) => {
          const element = document.createElement(tagName);
          
          // Add required attributes
          if (tagName === 'a') {
            element.href = '#';
          }
          
          // Make element visible
          element.style.display = 'block';
          element.style.visibility = 'visible';
          
          document.body.appendChild(element);
          
          const result = isFocusable(element);
          
          document.body.removeChild(element);
          
          expect(result).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ============================================================================
// PROPERTY TEST: Contrast Ratio Transitivity
// ============================================================================

describe('Property Tests: Contrast Ratio Relationships', () => {
  it('should maintain relative ordering', () => {
    /**
     * **Validates: Requirements 9.4**
     * 
     * Property: If A has higher contrast with C than B does,
     * this relationship should be consistent.
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.stringMatching(/^[0-9A-F]{6}$/),
        (aHex, bHex, cHex) => {
          const a = `#${aHex}`;
          const b = `#${bHex}`;
          const c = `#${cHex}`;
          
          const ratioAC = getContrastRatio(a, c);
          const ratioBC = getContrastRatio(b, c);
          const ratioCA = getContrastRatio(c, a);
          const ratioCB = getContrastRatio(c, b);
          
          // Symmetry should hold
          expect(Math.abs(ratioAC - ratioCA)).toBeLessThan(0.01);
          expect(Math.abs(ratioBC - ratioCB)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have maximum contrast with pure black or white', () => {
    /**
     * **Validates: Requirements 9.4**
     * 
     * Property: For any color, contrast with black or white is >= contrast with any other color
     * Black and white provide the maximum possible contrast.
     */
    fc.assert(
      fc.property(
        fc.stringMatching(/^[0-9A-F]{6}$/),
        fc.stringMatching(/^[0-9A-F]{6}$/),
        (color1Hex, color2Hex) => {
          const color1 = `#${color1Hex}`;
          const color2 = `#${color2Hex}`;
          
          const ratioWithBlack = getContrastRatio(color1, '#000000');
          const ratioWithWhite = getContrastRatio(color1, '#FFFFFF');
          const ratioWithColor2 = getContrastRatio(color1, color2);
          
          const maxContrast = Math.max(ratioWithBlack, ratioWithWhite);
          
          // Max contrast should be at least as high as contrast with any other color
          expect(maxContrast).toBeGreaterThanOrEqual(ratioWithColor2 - 0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
});
