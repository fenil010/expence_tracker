import { forwardRef } from 'react';

/**
 * Base Glass Container Component
 * Provides the foundation for all glassmorphism effects
 */
export const GlassContainer = forwardRef(({ 
  children, 
  variant = 'default', 
  blur = 'md',
  className = '',
  ...props 
}, ref) => {
  const variants = {
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
  };

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

  return (
    <div
      ref={ref}
      className={`${variants[variant]} ${blurClasses[blur]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

GlassContainer.displayName = 'GlassContainer';

/**
 * Glass Modal Component
 * Optimized for modal dialogs with strong glassmorphism effect
 */
export const GlassModal = forwardRef(({ 
  children, 
  isOpen = false,
  onClose,
  className = '',
  overlayClassName = '',
  ...props 
}, ref) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glass Overlay */}
      <div
        className={`absolute inset-0 glass-overlay ${overlayClassName}`}
        onClick={onClose}
      />

      {/* Glass Modal */}
      <div
        ref={ref}
        className={`relative glass-modal rounded-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-300 ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});

GlassModal.displayName = 'GlassModal';

/**
 * Glass Card Component
 * Perfect for content cards with subtle glassmorphism
 */
export const GlassCard = forwardRef(({ 
  children, 
  hover = true,
  className = '',
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`glass-card rounded-xl p-6 transition-all duration-300 ${
        hover ? 'hover:shadow-glass-strong hover:-translate-y-1' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

/**
 * Glass Navigation Component
 * Optimized for navigation bars with backdrop blur
 */
export const GlassNav = forwardRef(({ 
  children, 
  sticky = true,
  className = '',
  ...props 
}, ref) => {
  return (
    <nav
      ref={ref}
      className={`glass-nav ${sticky ? 'sticky top-0' : ''} z-40 ${className}`}
      {...props}
    >
      {children}
    </nav>
  );
});

GlassNav.displayName = 'GlassNav';

/**
 * Glass Dropdown Component
 * Perfect for dropdown menus and popovers
 */
export const GlassDropdown = forwardRef(({ 
  children, 
  isOpen = false,
  position = 'bottom-left',
  className = '',
  ...props 
}, ref) => {
  if (!isOpen) return null;

  const positionClasses = {
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'left': 'right-full top-0 mr-2',
    'right': 'left-full top-0 ml-2',
  };

  return (
    <div
      ref={ref}
      className={`absolute glass-dropdown rounded-xl p-2 min-w-48 animate-in fade-in slide-in-from-top-2 duration-200 ${positionClasses[position]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

GlassDropdown.displayName = 'GlassDropdown';

/**
 * Glass Sidebar Component
 * Optimized for side navigation panels
 */
export const GlassSidebar = forwardRef(({ 
  children, 
  side = 'left',
  className = '',
  ...props 
}, ref) => {
  const sideClasses = {
    left: 'left-0 glass-sidebar',
    right: 'right-0 glass-sidebar border-l border-r-0',
  };

  return (
    <aside
      ref={ref}
      className={`fixed top-0 h-full w-64 z-30 ${sideClasses[side]} ${className}`}
      {...props}
    >
      {children}
    </aside>
  );
});

GlassSidebar.displayName = 'GlassSidebar';

/**
 * Glass Tooltip Component
 * Perfect for tooltips and small informational overlays
 */
export const GlassTooltip = forwardRef(({ 
  children, 
  content,
  position = 'top',
  isVisible = false,
  className = '',
  ...props 
}, ref) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block" ref={ref} {...props}>
      {children}
      {isVisible && (
        <div
          className={`absolute glass-tooltip rounded-lg px-3 py-2 text-sm text-white whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 ${positionClasses[position]} ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  );
});

GlassTooltip.displayName = 'GlassTooltip';

/**
 * Glass Button Component
 * Button with glassmorphism effect
 */
export const GlassButton = forwardRef(({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}, ref) => {
  const variants = {
    default: 'glass-card text-gray-900',
    primary: 'glass-blue text-primary',
    success: 'glass-green text-success',
    warning: 'glass-orange text-warning',
    danger: 'glass-red text-error',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} rounded-xl font-medium transition-all duration-200 hover:shadow-glass-strong hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

GlassButton.displayName = 'GlassButton';

/**
 * Glass Input Component
 * Input field with glassmorphism styling
 */
export const GlassInput = forwardRef(({ 
  label,
  error,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 glass-card rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200 ${
          error ? 'ring-2 ring-error/30' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

/**
 * Glass Badge Component
 * Small informational badges with glassmorphism
 */
export const GlassBadge = forwardRef(({ 
  children, 
  variant = 'default',
  size = 'sm',
  className = '',
  ...props 
}, ref) => {
  const variants = {
    default: 'glass-card text-gray-700',
    primary: 'glass-blue text-primary',
    success: 'glass-green text-success',
    warning: 'glass-orange text-warning',
    danger: 'glass-red text-error',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
  };

  return (
    <span
      ref={ref}
      className={`inline-flex items-center ${variants[variant]} ${sizes[size]} rounded-full font-medium ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

GlassBadge.displayName = 'GlassBadge';