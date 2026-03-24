import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonVariants, durations, easings } from '../../utils/animations';

const variants = {
  primary: 'bg-gradient-to-br from-accent via-accent to-accent-secondary text-accent-fg shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 border border-accent/20',
  secondary: 'glass-card text-char dark:text-zinc-100 hover:bg-white/80 dark:hover:bg-indigo-900/50 shadow-md',
  ghost: 'bg-transparent text-char dark:text-zinc-200 hover:glass-subtle',
  danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 border border-red-400/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className = '',
  disabled = false,
  loading = false,
  success = false,
  ...props
}, ref) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    // Call original onClick if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <motion.button
      ref={ref}
      initial="rest"
      whileHover={disabled || loading ? "rest" : "hover"}
      whileTap={disabled || loading ? "rest" : "tap"}
      variants={buttonVariants}
      className={`
        relative overflow-hidden
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-300 ease-smooth
        cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
      onClick={handleClick}
    >
      {/* Ripple effect container */}
      <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 dark:bg-white/20"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: easings.easeOut }}
            />
          ))}
        </AnimatePresence>
      </span>

      {/* Button content */}
      <span className="relative flex items-center justify-center gap-2 whitespace-nowrap">
        {loading ? (
          <motion.span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full shrink-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : success ? (
          <motion.svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </motion.svg>
        ) : Icon ? (
          <motion.span
            className="shrink-0"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: durations.fast }}
          >
            <Icon className="w-4 h-4" />
          </motion.span>
        ) : null}
        <span className="shrink-0">{children}</span>
        {IconRight && !loading && (
          <motion.span
            className="shrink-0"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ duration: durations.fast }}
          >
            <IconRight className="w-4 h-4" />
          </motion.span>
        )}
      </span>
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
