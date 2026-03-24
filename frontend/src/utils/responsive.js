/**
 * Responsive Utilities for UI Enhancement
 * 
 * This module provides utilities for responsive design including
 * breakpoint detection, media queries, and viewport management.
 */

import { useState, useEffect } from 'react';

// ============================================================================
// BREAKPOINT CONSTANTS
// ============================================================================

export const breakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

// ============================================================================
// BREAKPOINT DETECTION HOOK
// ============================================================================

/**
 * Hook to detect current breakpoint
 * @returns {string} Current breakpoint name
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < breakpoints.mobile) setBreakpoint('mobile');
      else if (width < breakpoints.tablet) setBreakpoint('tablet');
      else if (width < breakpoints.desktop) setBreakpoint('desktop');
      else setBreakpoint('wide');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

// ============================================================================
// MEDIA QUERY HOOK
// ============================================================================

/**
 * Hook for custom media queries
 * @param {string} query - Media query string
 * @returns {boolean} Whether query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export default {
  breakpoints,
  useBreakpoint,
  useMediaQuery,
};
