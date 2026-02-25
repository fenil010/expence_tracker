import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-obsidian dark:bg-white text-parchment dark:text-zinc-900 hover:opacity-90',
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
  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
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
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className="w-4 h-4" />}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
