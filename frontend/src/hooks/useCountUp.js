import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for count-up animation
 * @param {number} end - Target number to count up to
 * @param {number} duration - Animation duration in milliseconds
 * @param {number} start - Starting number (default: 0)
 * @returns {number} Current animated value
 */
export function useCountUp(end, duration = 1000, start = 0) {
  const [count, setCount] = useState(start);
  const frameRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    // Reset when end value changes
    startTimeRef.current = null;
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeOut;
      
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, start]);

  return count;
}
