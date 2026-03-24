/**
 * Unit Tests for Responsive Utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  breakpoints,
  breakpointNames,
  mediaQueries,
  getBreakpointForWidth,
  matchesBreakpoint,
  isTouchDevice,
  getOrientation,
  getScreenDensity,
  useBreakpoint,
  useMediaQuery,
  useOrientation,
  useTouchDevice,
  useResponsive,
  useResponsiveValue,
} from './responsive.js';

// ============================================================================
// CONSTANTS TESTS
// ============================================================================

describe('Responsive Constants', () => {
  it('should have correct breakpoint values', () => {
    expect(breakpoints.mobile).toBe(640);
    expect(breakpoints.tablet).toBe(768);
    expect(breakpoints.desktop).toBe(1024);
    expect(breakpoints.wide).toBe(1280);
  });

  it('should have all breakpoint names', () => {
    expect(breakpointNames).toEqual(['mobile', 'tablet', 'desktop', 'wide']);
  });

  it('should have media query strings for all breakpoints', () => {
    expect(mediaQueries.mobile).toBe('(min-width: 640px)');
    expect(mediaQueries.tablet).toBe('(min-width: 768px)');
    expect(mediaQueries.desktop).toBe('(min-width: 1024px)');
    expect(mediaQueries.wide).toBe('(min-width: 1280px)');
  });

  it('should have max-width media queries', () => {
    expect(mediaQueries.maxMobile).toBe('(max-width: 639px)');
    expect(mediaQueries.maxTablet).toBe('(max-width: 767px)');
    expect(mediaQueries.maxDesktop).toBe('(max-width: 1023px)');
    expect(mediaQueries.maxWide).toBe('(max-width: 1279px)');
  });

  it('should have orientation media queries', () => {
    expect(mediaQueries.portrait).toBe('(orientation: portrait)');
    expect(mediaQueries.landscape).toBe('(orientation: landscape)');
  });

  it('should have device type media queries', () => {
    expect(mediaQueries.touch).toBe('(hover: none) and (pointer: coarse)');
    expect(mediaQueries.mouse).toBe('(hover: hover) and (pointer: fine)');
  });

  it('should have accessibility media queries', () => {
    expect(mediaQueries.reducedMotion).toBe('(prefers-reduced-motion: reduce)');
    expect(mediaQueries.highContrast).toBe('(prefers-contrast: high)');
  });
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('getBreakpointForWidth', () => {
  it('should return mobile for widths below 640px', () => {
    expect(getBreakpointForWidth(320)).toBe('mobile');
    expect(getBreakpointForWidth(480)).toBe('mobile');
    expect(getBreakpointForWidth(639)).toBe('mobile');
  });

  it('should return tablet for widths 640-767px', () => {
    expect(getBreakpointForWidth(640)).toBe('tablet');
    expect(getBreakpointForWidth(700)).toBe('tablet');
    expect(getBreakpointForWidth(767)).toBe('tablet');
  });

  it('should return desktop for widths 768-1023px', () => {
    expect(getBreakpointForWidth(768)).toBe('desktop');
    expect(getBreakpointForWidth(900)).toBe('desktop');
    expect(getBreakpointForWidth(1023)).toBe('desktop');
  });

  it('should return wide for widths 1024px and above', () => {
    expect(getBreakpointForWidth(1024)).toBe('desktop');
    expect(getBreakpointForWidth(1280)).toBe('wide');
    expect(getBreakpointForWidth(1920)).toBe('wide');
  });

  it('should handle edge cases', () => {
    expect(getBreakpointForWidth(0)).toBe('mobile');
    expect(getBreakpointForWidth(1)).toBe('mobile');
    expect(getBreakpointForWidth(10000)).toBe('wide');
  });
});

describe('matchesBreakpoint', () => {
  beforeEach(() => {
    // Mock window.matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it('should return false for unknown breakpoint', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(matchesBreakpoint('unknown')).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Unknown breakpoint: unknown');
    consoleSpy.mockRestore();
  });

  it('should call matchMedia with correct query', () => {
    matchesBreakpoint('tablet');
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });
});

describe('isTouchDevice', () => {
  it('should detect touch support via ontouchstart', () => {
    window.ontouchstart = null;
    expect(isTouchDevice()).toBe(true);
    delete window.ontouchstart;
  });

  it('should detect touch support via maxTouchPoints', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 1,
      configurable: true,
    });
    expect(isTouchDevice()).toBe(true);
  });

  it('should return false when no touch support', () => {
    delete window.ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true,
    });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(isTouchDevice()).toBe(false);
  });
});

describe('getOrientation', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('portrait'),
      media: query,
    }));
  });

  it('should return portrait when portrait matches', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    expect(getOrientation()).toBe('portrait');
  });

  it('should return landscape when portrait does not match', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    expect(getOrientation()).toBe('landscape');
  });
});

describe('getScreenDensity', () => {
  it('should return devicePixelRatio', () => {
    window.devicePixelRatio = 2;
    expect(getScreenDensity()).toBe(2);
  });

  it('should return 1 if devicePixelRatio is not available', () => {
    const originalRatio = window.devicePixelRatio;
    delete window.devicePixelRatio;
    expect(getScreenDensity()).toBe(1);
    window.devicePixelRatio = originalRatio;
  });
});

// ============================================================================
// HOOK TESTS
// ============================================================================

describe('useBreakpoint', () => {
  beforeEach(() => {
    // Set default window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('should return current breakpoint state', () => {
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current).toHaveProperty('breakpoint');
    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isTablet');
    expect(result.current).toHaveProperty('isDesktop');
    expect(result.current).toHaveProperty('isWide');
    expect(result.current).toHaveProperty('width');
  });

  it('should detect desktop breakpoint for 1024px width', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isWide).toBe(false);
  });

  it('should detect mobile breakpoint for 480px width', () => {
    window.innerWidth = 480;
    const { result } = renderHook(() => useBreakpoint());
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // Wait for debounce
    setTimeout(() => {
      expect(result.current.breakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
    }, 200);
  });

  it('should update on window resize', async () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.breakpoint).toBe('desktop');
    
    act(() => {
      window.innerWidth = 1920;
      window.dispatchEvent(new Event('resize'));
    });
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 200));
    
    expect(result.current.width).toBe(1920);
  });
});

describe('useMediaQuery', () => {
  let listeners = [];

  beforeEach(() => {
    listeners = [];
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((event, handler) => {
        listeners.push({ event, handler });
      }),
      removeEventListener: vi.fn((event, handler) => {
        listeners = listeners.filter(l => l.handler !== handler);
      }),
    }));
  });

  it('should return initial match state', () => {
    window.matchMedia = vi.fn().mockReturnValue({ 
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('should update when media query changes', () => {
    let matchResult = false;
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: matchResult,
      media: query,
      addEventListener: vi.fn((event, handler) => {
        listeners.push({ event, handler, query });
      }),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      matchResult = true;
      listeners.forEach(l => {
        if (l.event === 'change') {
          l.handler({ matches: true });
        }
      });
    });

    expect(result.current).toBe(true);
  });

  it('should handle legacy addListener API', () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();
    
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(min-width: 768px)',
      addListener,
      removeListener,
    });

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(addListener).toHaveBeenCalled();
    
    unmount();
    expect(removeListener).toHaveBeenCalled();
  });
});

describe('useOrientation', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('portrait'),
      media: query,
    }));
  });

  it('should return orientation state', () => {
    const { result } = renderHook(() => useOrientation());
    
    expect(result.current).toHaveProperty('orientation');
    expect(result.current).toHaveProperty('isPortrait');
    expect(result.current).toHaveProperty('isLandscape');
  });

  it('should detect portrait orientation', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.orientation).toBe('portrait');
    expect(result.current.isPortrait).toBe(true);
    expect(result.current.isLandscape).toBe(false);
  });

  it('should detect landscape orientation', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const { result } = renderHook(() => useOrientation());
    
    expect(result.current.orientation).toBe('landscape');
    expect(result.current.isPortrait).toBe(false);
    expect(result.current.isLandscape).toBe(true);
  });
});

describe('useTouchDevice', () => {
  it('should detect touch device', () => {
    window.ontouchstart = null;
    const { result } = renderHook(() => useTouchDevice());
    expect(result.current).toBe(true);
    delete window.ontouchstart;
  });

  it('should detect non-touch device', () => {
    delete window.ontouchstart;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      configurable: true,
    });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    
    const { result } = renderHook(() => useTouchDevice());
    expect(result.current).toBe(false);
  });
});

describe('useResponsive', () => {
  beforeEach(() => {
    window.innerWidth = 1024;
    window.devicePixelRatio = 2;
    window.matchMedia = vi.fn().mockReturnValue({ 
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  it('should return complete responsive configuration', () => {
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current).toHaveProperty('breakpoint');
    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isTablet');
    expect(result.current).toHaveProperty('isDesktop');
    expect(result.current).toHaveProperty('isWide');
    expect(result.current).toHaveProperty('orientation');
    expect(result.current).toHaveProperty('isPortrait');
    expect(result.current).toHaveProperty('isLandscape');
    expect(result.current).toHaveProperty('isTouchDevice');
    expect(result.current).toHaveProperty('screenDensity');
    expect(result.current).toHaveProperty('width');
  });

  it('should include screen density', () => {
    window.devicePixelRatio = 3;
    const { result } = renderHook(() => useResponsive());
    expect(result.current.screenDensity).toBe(3);
  });
});

describe('useResponsiveValue', () => {
  it('should return mobile value for mobile breakpoint', () => {
    window.innerWidth = 480;
    const values = {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      wide: 4,
    };
    
    const { result } = renderHook(() => useResponsiveValue(values));
    
    // Initial render might be desktop, wait for resize
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    setTimeout(() => {
      expect(result.current).toBe(1);
    }, 200);
  });

  it('should return desktop value for desktop breakpoint', () => {
    window.innerWidth = 1024;
    const values = {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      wide: 4,
    };
    
    const { result } = renderHook(() => useResponsiveValue(values));
    expect(result.current).toBe(3);
  });

  it('should return wide value for wide breakpoint', () => {
    window.innerWidth = 1920;
    const values = {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      wide: 4,
    };
    
    const { result } = renderHook(() => useResponsiveValue(values));
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    setTimeout(() => {
      expect(result.current).toBe(4);
    }, 200);
  });

  it('should fallback to smaller breakpoint if value not defined', () => {
    window.innerWidth = 1920;
    const values = {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      // wide not defined
    };
    
    const { result } = renderHook(() => useResponsiveValue(values));
    expect(result.current).toBe(3);
  });

  it('should fallback to first available value', () => {
    window.innerWidth = 1920;
    const values = {
      mobile: 1,
      // other values not defined
    };
    
    const { result } = renderHook(() => useResponsiveValue(values));
    expect(result.current).toBe(1);
  });
});
