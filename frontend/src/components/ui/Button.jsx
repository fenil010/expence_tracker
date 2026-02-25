import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonVariants, durations, easings } from '../../utils/animations';

const variants = {
  primary: 'bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent)]/90 text-white dark:text-white hover:shadow-lg hover:shadow-[var(--color-accent)]/20',
  secondary: 'bg-linen dark:bg-zinc-800 text-char dark:text-zinc-200 border border-stone dark:border-zinc-700 hover:bg-sand dark:hover:bg-zinc-700',
  ghost: 'bg-transparent text-char dark:text-zinc-300 hover:bg-sand dark:hover:bg-zinc-800',
  danger: 'bg-parchment dark:bg-red-950/30 text-red-800/70 dark:text-red-400 border border-red-200/50 dark:border-red-800/40 hover:bg-red-50/50 dark:hover:bg-red-950/50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
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
        font-medium rounded-xl
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
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full flex-shrink-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : Icon ? (
          <motion.span
            className="flex-shrink-0"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: durations.fast }}
          >
            <Icon className="w-4 h-4" />
          </motion.span>
        ) : null}
        <span className="flex-shrink-0">{children}</span>
        {IconRight && !loading && (
          <motion.span
            className="flex-shrink-0"
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
