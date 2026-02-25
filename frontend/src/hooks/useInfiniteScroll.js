import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scroll functionality
 * @param {Function} callback - Function to call when reaching bottom
 * @param {boolean} hasMore - Whether there's more data to load
 * @param {boolean} loading - Whether data is currently loading
 * @param {number} threshold - Distance from bottom to trigger (in pixels)
 * @returns {Object} Ref to attach to scrollable container
 */
export function useInfiniteScroll(callback, hasMore, loading, threshold = 300) {
  const observerRef = useRef();
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);

  // Update refs
  useEffect(() => {
    loadingRef.current = loading;
    hasMoreRef.current = hasMore;
  }, [loading, hasMore]);

  const handleScroll = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      callback();
    }
  }, [callback, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return observerRef;
}
