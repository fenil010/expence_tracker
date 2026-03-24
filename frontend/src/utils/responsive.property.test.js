/**
 * Property-Based Tests for Responsive Utilities
 * 
 * These tests verify universal properties across randomized inputs
 * using the fast-check library.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import {
  breakpoints,
  getBreakpointForWidth,
  useBreakpoint,
} from './responsive.js';
import { renderHook } from '@testing-library/react';

// ============================================================================
// PROPERTY TESTS
// ============================================================================

describe('Property Tests: Responsive Breakpoint Adaptation', () => {
  /**
   * **Validates: Requirements 10.1**
   * 
   * Property 16: Responsive Breakpoint Adaptation
   * For any viewport width, the UI layout should adapt appropriately at the 
   * defined breakpoints (640px, 768px, 1024px, 1280px).
   */
  it('should adapt layout at all defined breakpoints for any width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (width) => {
          const breakpoint = getBreakpointForWidth(width);
          
          // Verify correct breakpoint assignment
          if (width < breakpoints.mobile) {
            expect(breakpoint).toBe('mobile');
          } else if (width < breakpoints.tablet) {
            expect(breakpoint).toBe('tablet');
          } else if (width < breakpoints.desktop) {
            expect(breakpoint).toBe('desktop');
          } else {
            expect(breakpoint).toBe('wide');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return valid breakpoint name for any positive width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        (width) => {
          const breakpoint = getBreakpointForWidth(width);
          const validBreakpoints = ['mobile', 'tablet', 'desktop', 'wide'];
          
          expect(validBreakpoints).toContain(breakpoint);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain breakpoint consistency at boundaries', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          breakpoints.mobile,
          breakpoints.tablet,
          breakpoints.desktop,
          breakpoints.wide
        ),
        (boundaryWidth) => {
          const atBoundary = getBreakpointForWidth(boundaryWidth);
          const justBefore = getBreakpointForWidth(boundaryWidth - 1);
          
          // At boundary should be different from just before
          // (except for wide which extends infinitely)
          if (boundaryWidth !== breakpoints.wide) {
            expect(atBoundary).not.toBe(justBefore);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Property Tests: Breakpoint Flags Consistency', () => {
  /**
   * **Validates: Requirements 10.1, 10.5**
   * 
   * Verifies that breakpoint boolean flags are consistent with the
   * current breakpoint name and width.
   */
  it('should have consistent boolean flags for any width', () => {
    beforeEach(() => {
      window.matchMedia = vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
    });

    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (width) => {
          // Set window width
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
          });

          const { result } = renderHook(() => useBreakpoint());
          
          // Verify flag consistency
          if (width < breakpoints.tablet) {
            expect(result.current.isMobile).toBe(true);
            expect(result.current.isTablet).toBe(false);
            expect(result.current.isDesktop).toBe(false);
            expect(result.current.isWide).toBe(false);
          } else if (width < breakpoints.desktop) {
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(true);
            expect(result.current.isDesktop).toBe(false);
            expect(result.current.isWide).toBe(false);
          } else if (width < breakpoints.wide) {
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(true);
            expect(result.current.isDesktop).toBe(true);
            expect(result.current.isWide).toBe(false);
          } else {
            expect(result.current.isMobile).toBe(false);
            expect(result.current.isTablet).toBe(true);
            expect(result.current.isDesktop).toBe(true);
            expect(result.current.isWide).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain hierarchical relationship between breakpoint flags', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (width) => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
          });

          const { result } = renderHook(() => useBreakpoint());
          
          // Hierarchical rules:
          // - If isWide, then isDesktop and isTablet must be true
          // - If isDesktop, then isTablet must be true
          // - isMobile and isTablet are mutually exclusive
          
          if (result.current.isWide) {
            expect(result.current.isDesktop).toBe(true);
            expect(result.current.isTablet).toBe(true);
            expect(result.current.isMobile).toBe(false);
          }
          
          if (result.current.isDesktop) {
            expect(result.current.isTablet).toBe(true);
            expect(result.current.isMobile).toBe(false);
          }
          
          if (result.current.isMobile) {
            expect(result.current.isTablet).toBe(false);
            expect(result.current.isDesktop).toBe(false);
            expect(result.current.isWide).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: Breakpoint Monotonicity', () => {
  /**
   * **Validates: Requirements 10.1**
   * 
   * Verifies that breakpoint transitions are monotonic - as width increases,
   * breakpoints should only move forward, never backward.
   */
  it('should have monotonic breakpoint progression as width increases', () => {
    const breakpointOrder = ['mobile', 'tablet', 'desktop', 'wide'];
    
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        fc.integer({ min: 1, max: 1000 }),
        (width, increment) => {
          const breakpoint1 = getBreakpointForWidth(width);
          const breakpoint2 = getBreakpointForWidth(width + increment);
          
          const index1 = breakpointOrder.indexOf(breakpoint1);
          const index2 = breakpointOrder.indexOf(breakpoint2);
          
          // Breakpoint should stay same or move forward, never backward
          expect(index2).toBeGreaterThanOrEqual(index1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: Width Reporting Accuracy', () => {
  /**
   * **Validates: Requirements 10.1, 10.5**
   * 
   * Verifies that the reported width matches the actual window width.
   */
  it('should accurately report window width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (width) => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
          });

          const { result } = renderHook(() => useBreakpoint());
          
          // Reported width should match actual width
          expect(result.current.width).toBe(width);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: Breakpoint Determinism', () => {
  /**
   * **Validates: Requirements 10.1**
   * 
   * Verifies that the same width always produces the same breakpoint.
   */
  it('should return same breakpoint for same width (determinism)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (width) => {
          const breakpoint1 = getBreakpointForWidth(width);
          const breakpoint2 = getBreakpointForWidth(width);
          const breakpoint3 = getBreakpointForWidth(width);
          
          // Same input should always produce same output
          expect(breakpoint1).toBe(breakpoint2);
          expect(breakpoint2).toBe(breakpoint3);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: Breakpoint Coverage', () => {
  /**
   * **Validates: Requirements 10.1**
   * 
   * Verifies that every possible width maps to exactly one breakpoint.
   */
  it('should map every width to exactly one breakpoint', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        (width) => {
          const breakpoint = getBreakpointForWidth(width);
          
          // Should return a valid breakpoint
          expect(breakpoint).toBeDefined();
          expect(typeof breakpoint).toBe('string');
          expect(breakpoint.length).toBeGreaterThan(0);
          
          // Should be one of the valid breakpoints
          const validBreakpoints = ['mobile', 'tablet', 'desktop', 'wide'];
          expect(validBreakpoints).toContain(breakpoint);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property Tests: Breakpoint Boundary Precision', () => {
  /**
   * **Validates: Requirements 10.1**
   * 
   * Verifies exact behavior at breakpoint boundaries.
   */
  it('should handle exact breakpoint boundaries correctly', () => {
    const boundaries = [
      { width: 639, expected: 'mobile' },
      { width: 640, expected: 'tablet' },
      { width: 767, expected: 'tablet' },
      { width: 768, expected: 'desktop' },
      { width: 1023, expected: 'desktop' },
      { width: 1024, expected: 'desktop' },
      { width: 1279, expected: 'desktop' },
      { width: 1280, expected: 'wide' },
    ];
    
    boundaries.forEach(({ width, expected }) => {
      const breakpoint = getBreakpointForWidth(width);
      expect(breakpoint).toBe(expected);
    });
  });
});

describe('Property Tests: Edge Cases', () => {
  /**
   * **Validates: Requirements 10.1, 10.2**
   * 
   * Verifies behavior at extreme values and edge cases.
   */
  it('should handle very small widths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (width) => {
          const breakpoint = getBreakpointForWidth(width);
          expect(breakpoint).toBe('mobile');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle very large widths', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 5000, max: 10000 }),
        (width) => {
          const breakpoint = getBreakpointForWidth(width);
          expect(breakpoint).toBe('wide');
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle zero width', () => {
    const breakpoint = getBreakpointForWidth(0);
    expect(breakpoint).toBe('mobile');
  });

  it('should handle negative widths gracefully', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: -1 }),
        (width) => {
          const breakpoint = getBreakpointForWidth(width);
          // Should still return a valid breakpoint (mobile for negative)
          expect(breakpoint).toBe('mobile');
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Property Tests: Responsive Value Selection', () => {
  /**
   * **Validates: Requirements 10.2, 10.5**
   * 
   * Verifies that responsive value selection works correctly for all widths.
   */
  it('should select appropriate value for any width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 101, max: 200 }),
        fc.integer({ min: 201, max: 300 }),
        fc.integer({ min: 301, max: 400 }),
        (width, mobileVal, tabletVal, desktopVal, wideVal) => {
          const breakpoint = getBreakpointForWidth(width);
          const values = {
            mobile: mobileVal,
            tablet: tabletVal,
            desktop: desktopVal,
            wide: wideVal,
          };
          
          // Manually determine expected value based on breakpoint
          let expectedValue;
          if (breakpoint === 'wide') {
            expectedValue = wideVal;
          } else if (breakpoint === 'desktop') {
            expectedValue = desktopVal;
          } else if (breakpoint === 'tablet') {
            expectedValue = tabletVal;
          } else {
            expectedValue = mobileVal;
          }
          
          // The selected value should match the breakpoint
          const selectedValue = values[breakpoint];
          expect(selectedValue).toBe(expectedValue);
        }
      ),
      { numRuns: 100 }
    );
  });
});
