import { useState, useEffect } from 'react';

/**
 * Custom hook for managing glassmorphism effects
 * Handles browser support detection, user preferences, and performance optimization
 */
export function useGlassmorphism() {
  const [isSupported, setIsSupported] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for backdrop-filter support
    const checkBackdropFilterSupport = () => {
      const testElement = document.createElement('div');
      testElement.style.backdropFilter = 'blur(1px)';
      const isBackdropSupported = testElement.style.backdropFilter !== '';
      
      // Also check for -webkit-backdrop-filter for Safari
      if (!isBackdropSupported) {
        testElement.style.webkitBackdropFilter = 'blur(1px)';
        return testElement.style.webkitBackdropFilter !== '';
      }
      
      return isBackdropSupported;
    };

    // Check for reduced motion preference
    const checkReducedMotion = () => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    // Check for low-end device indicators
    const checkPerformance = () => {
      // Check for hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 4;
      
      // Check for device memory (if available)
      const memory = navigator.deviceMemory || 4;
      
      // Check for connection type (if available)
      const connection = navigator.connection;
      const isSlowConnection = connection && 
        (connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.effectiveType === '3g');

      // Disable glassmorphism on low-end devices or slow connections
      return cores >= 4 && memory >= 2 && !isSlowConnection;
    };

    const supported = checkBackdropFilterSupport();
    const performant = checkPerformance();
    const motionReduced = checkReducedMotion();

    setIsSupported(supported);
    setIsEnabled(supported && performant);
    setReducedMotion(motionReduced);

    // Listen for changes in reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => setReducedMotion(e.matches);
    
    mediaQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Get appropriate glassmorphism class based on support and preferences
  const getGlassClass = (variant = 'default', fallback = 'card') => {
    if (!isSupported || !isEnabled) {
      return fallback;
    }

    const glassVariants = {
      default: 'glass',
      light: 'glass-light',
      subtle: 'glass-subtle',
      strong: 'glass-strong',
      dark: 'glass-dark',
      'dark-light': 'glass-dark-light',
      'dark-subtle': 'glass-dark-subtle',
      'dark-strong': 'glass-dark-strong',
      blue: 'glass-blue',
      green: 'glass-green',
      red: 'glass-red',
      orange: 'glass-orange',
      modal: 'glass-modal',
      dropdown: 'glass-dropdown',
      nav: 'glass-nav',
      card: 'glass-card',
      sidebar: 'glass-sidebar',
      tooltip: 'glass-tooltip',
    };

    return glassVariants[variant] || glassVariants.default;
  };

  // Get appropriate blur class based on support
  const getBlurClass = (intensity = 'md') => {
    if (!isSupported || !isEnabled) {
      return '';
    }

    const blurClasses = {
      xs: 'backdrop-blur-xs',
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
      '2xl': 'backdrop-blur-2xl',
      '3xl': 'backdrop-blur-3xl',
      '4xl': 'backdrop-blur-4xl',
    };

    return blurClasses[intensity] || blurClasses.md;
  };

  // Get animation classes based on reduced motion preference
  const getAnimationClass = (animation = 'transition-smooth') => {
    if (reducedMotion) {
      return '';
    }
    return animation;
  };

  // Toggle glassmorphism effects (for user preference)
  const toggleGlassmorphism = () => {
    setIsEnabled(prev => !prev);
  };

  return {
    isSupported,
    isEnabled,
    reducedMotion,
    getGlassClass,
    getBlurClass,
    getAnimationClass,
    toggleGlassmorphism,
  };
}

/**
 * Hook for glassmorphism theme management
 * Provides theme-aware glassmorphism utilities
 */
export function useGlassmorphismTheme(theme = 'light') {
  const glassmorphism = useGlassmorphism();

  // Get theme-appropriate glassmorphism variant
  const getThemedGlass = (variant = 'default') => {
    if (theme === 'dark') {
      const darkVariants = {
        default: 'dark',
        light: 'dark-light',
        subtle: 'dark-subtle',
        strong: 'dark-strong',
      };
      return glassmorphism.getGlassClass(darkVariants[variant] || variant);
    }
    
    return glassmorphism.getGlassClass(variant);
  };

  // Get theme-appropriate text colors
  const getThemedTextColor = () => {
    return theme === 'dark' ? 'text-white' : 'text-gray-900';
  };

  // Get theme-appropriate border colors
  const getThemedBorderColor = () => {
    return theme === 'dark' 
      ? 'border-white/10' 
      : 'border-white/20';
  };

  return {
    ...glassmorphism,
    getThemedGlass,
    getThemedTextColor,
    getThemedBorderColor,
    theme,
  };
}

/**
 * Hook for glassmorphism performance monitoring
 * Monitors performance and adjusts glassmorphism effects accordingly
 */
export function useGlassmorphismPerformance() {
  const [performanceLevel, setPerformanceLevel] = useState('high');
  const glassmorphism = useGlassmorphism();

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      // Measure FPS every second
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // Adjust performance level based on FPS
        if (fps < 30) {
          setPerformanceLevel('low');
        } else if (fps < 50) {
          setPerformanceLevel('medium');
        } else {
          setPerformanceLevel('high');
        }
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    // Start performance monitoring only if glassmorphism is enabled
    if (glassmorphism.isEnabled) {
      animationId = requestAnimationFrame(measurePerformance);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [glassmorphism.isEnabled]);

  // Get performance-optimized glassmorphism settings
  const getOptimizedGlass = (variant = 'default') => {
    if (performanceLevel === 'low') {
      // Use fallback styling for low performance
      return 'card';
    } else if (performanceLevel === 'medium') {
      // Use subtle glassmorphism for medium performance
      return glassmorphism.getGlassClass('subtle');
    }
    
    // Use full glassmorphism for high performance
    return glassmorphism.getGlassClass(variant);
  };

  const getOptimizedBlur = (intensity = 'md') => {
    if (performanceLevel === 'low') {
      return '';
    } else if (performanceLevel === 'medium') {
      // Reduce blur intensity for medium performance
      const reducedIntensity = {
        '4xl': '2xl',
        '3xl': 'xl',
        '2xl': 'lg',
        'xl': 'md',
        'lg': 'sm',
        'md': 'sm',
        'sm': 'xs',
        'xs': 'xs',
      };
      return glassmorphism.getBlurClass(reducedIntensity[intensity] || 'sm');
    }
    
    return glassmorphism.getBlurClass(intensity);
  };

  return {
    ...glassmorphism,
    performanceLevel,
    getOptimizedGlass,
    getOptimizedBlur,
  };
}