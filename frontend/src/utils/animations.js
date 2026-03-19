/**
 * Animation Utilities for UI Enhancement
 * 
 * This module provides reusable animation configurations, timing functions,
 * and variants for Framer Motion animations throughout the application.
 */

// ============================================================================
// TIMING FUNCTIONS (Easing)
// ============================================================================

export const easings = {
  // Standard easings
  easeOut: [0.16, 1, 0.3, 1],
  easeIn: [0.5, 0, 0.84, 0.36],
  easeInOut: [0.65, 0, 0.35, 1],
  
  // Spring physics
  spring: { type: "spring", stiffness: 280, damping: 30, mass: 0.9 },
  springGentle: { type: "spring", stiffness: 180, damping: 26, mass: 1 },
  springBouncy: { type: "spring", stiffness: 360, damping: 22, mass: 0.8 },
  
  // Custom easings
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.2, 0.9, 0.2, 1],
};

// ============================================================================
// DURATION SCALE
// ============================================================================

export const durations = {
  instant: 0,
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  slower: 0.9,
  slowest: 1.3,
};

// ============================================================================
// COMMON ANIMATION VARIANTS
// ============================================================================

// Fade animations
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: durations.normal, ease: easings.easeOut }
  },
  exit: { 
    opacity: 0,
    transition: { duration: durations.fast, ease: easings.easeIn }
  }
};

// Slide animations
export const slideVariants = {
  up: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: durations.normal, ease: easings.easeOut }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: durations.fast, ease: easings.easeIn }
    }
  },
  down: {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: durations.normal, ease: easings.easeOut }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: { duration: durations.fast, ease: easings.easeIn }
    }
  },
  left: {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: durations.normal, ease: easings.easeOut }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: durations.fast, ease: easings.easeIn }
    }
  },
  right: {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: durations.normal, ease: easings.easeOut }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: durations.fast, ease: easings.easeIn }
    }
  }
};

// Scale animations
export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: durations.normal, ease: easings.easeOut }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: durations.fast, ease: easings.easeIn }
  }
};

// Stagger container and item variants
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: durations.slow, ease: easings.easeOut }
  }
};

// ============================================================================
// COMPONENT-SPECIFIC VARIANTS
// ============================================================================

// Card hover effect
export const cardVariants = {
  rest: { 
    scale: 1, 
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    transition: { duration: durations.normal, ease: easings.easeOut }
  },
  hover: { 
    scale: 1.015, 
    boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
    transition: { duration: durations.normal, ease: easings.easeOut }
  },
  tap: {
    scale: 0.98,
    transition: { duration: durations.fast, ease: easings.easeOut }
  }
};

// Button press effect
export const buttonVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: durations.fast, ease: easings.easeOut }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: durations.fast, ease: easings.easeOut }
  }
};

// Modal/Dialog variants
export const modalVariants = {
  desktop: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: durations.normal, ease: easings.easeOut }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: durations.fast, ease: easings.easeIn }
    }
  },
  mobile: {
    hidden: { opacity: 0, y: "100%" },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { ...easings.spring }
    },
    exit: { 
      opacity: 0, 
      y: "100%",
      transition: { duration: durations.normal, ease: easings.easeIn }
    }
  }
};

// Backdrop variants
export const backdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { 
    opacity: 1, 
    backdropFilter: "blur(8px)",
    transition: { duration: durations.normal, ease: easings.easeOut }
  },
  exit: { 
    opacity: 0, 
    backdropFilter: "blur(0px)",
    transition: { duration: durations.fast, ease: easings.easeIn }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detects if user prefers reduced motion
 * @returns {boolean} True if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Returns simplified variants if user prefers reduced motion
 * @param {Object} normalVariants - Normal animation variants
 * @param {Object} reducedVariants - Optional reduced motion variants
 * @returns {Object} Appropriate variants based on user preference
 */
export const getAccessibleVariants = (normalVariants, reducedVariants = null) => {
  if (prefersReducedMotion()) {
    return reducedVariants || fadeVariants;
  }
  return normalVariants;
};

/**
 * Creates a stagger configuration
 * @param {number} staggerDelay - Delay between each child animation
 * @param {number} delayChildren - Initial delay before children start
 * @returns {Object} Stagger configuration
 */
export const createStagger = (staggerDelay = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren
    }
  }
});

/**
 * Creates a spring transition configuration
 * @param {number} stiffness - Spring stiffness (default: 300)
 * @param {number} damping - Spring damping (default: 30)
 * @returns {Object} Spring configuration
 */
export const createSpring = (stiffness = 300, damping = 30) => ({
  type: "spring",
  stiffness,
  damping
});

/**
 * Creates a custom easing transition
 * @param {number} duration - Animation duration in seconds
 * @param {Array} ease - Cubic bezier easing array
 * @returns {Object} Transition configuration
 */
export const createTransition = (duration = durations.normal, ease = easings.easeOut) => ({
  duration,
  ease
});

// ============================================================================
// GESTURE CONFIGURATIONS
// ============================================================================

export const dragConstraints = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

export const swipeConfidenceThreshold = 10000;
export const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const animationPresets = {
  // Quick fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: durations.fast }
  },
  
  // Slide up with fade
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.normal, ease: easings.easeOut }
  },
  
  // Scale with fade
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: durations.normal, ease: easings.easeOut }
  },
  
  // Bounce in
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { ...easings.springBouncy }
  }
};

export default {
  easings,
  durations,
  fadeVariants,
  slideVariants,
  scaleVariants,
  staggerContainer,
  staggerItem,
  cardVariants,
  buttonVariants,
  modalVariants,
  backdropVariants,
  prefersReducedMotion,
  getAccessibleVariants,
  createStagger,
  createSpring,
  createTransition,
  animationPresets
};
