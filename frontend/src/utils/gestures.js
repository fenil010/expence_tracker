/**
 * Gesture Utilities for UI Enhancement
 * 
 * This module provides utilities for touch gestures including
 * swipe detection, long press, and pinch-to-zoom.
 */

import { useState, useEffect, useRef } from 'react';

// ============================================================================
// SWIPE DETECTION HOOK
// ============================================================================

/**
 * Hook for swipe gesture detection
 * @param {Function} onSwipeLeft - Callback for left swipe
 * @param {Function} onSwipeRight - Callback for right swipe
 * @param {number} threshold - Minimum distance for swipe (default: 50px)
 * @returns {Object} Touch event handlers
 */
export function useSwipe(onSwipeLeft, onSwipeRight, threshold = 50) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

// ============================================================================
// LONG PRESS DETECTION HOOK
// ============================================================================

/**
 * Hook for long press gesture detection
 * @param {Function} onLongPress - Callback for long press
 * @param {number} duration - Duration in ms (default: 500ms)
 * @returns {Object} Event handlers
 */
export function useLongPress(onLongPress, duration = 500) {
  const [startLongPress, setStartLongPress] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (startLongPress) {
      timerRef.current = setTimeout(onLongPress, duration);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startLongPress, onLongPress, duration]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
}

export default {
  useSwipe,
  useLongPress,
};
