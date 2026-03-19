import { motion } from 'framer-motion';
import { cardVariants, durations, easings } from '../../utils/animations';

const variants = {
  default: 'bg-white/65 dark:bg-zinc-900/60 border border-white/45 dark:border-zinc-700/60 backdrop-blur-2xl shadow-soft',
  elevated: 'bg-white/70 dark:bg-zinc-900/65 border border-white/50 dark:border-zinc-700/60 backdrop-blur-2xl shadow-card',
  flat: 'bg-white/50 dark:bg-zinc-950/60 border border-white/30 dark:border-zinc-800/60 backdrop-blur-xl',
  outlined: 'bg-white/20 dark:bg-zinc-900/20 border-2 border-white/40 dark:border-zinc-700/60 backdrop-blur-xl',
  gradient: 'bg-linear-to-br from-white/70 via-white/50 to-white/70 dark:from-zinc-900/60 dark:via-zinc-950/60 dark:to-zinc-900/60 border border-white/50 dark:border-zinc-700/60 backdrop-blur-2xl shadow-soft',
  glass: 'bg-white/65 dark:bg-zinc-900/60 border border-white/45 dark:border-zinc-700/60 backdrop-blur-2xl shadow-soft',
};

const glowColors = {
  default: 'hover:shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.1)]',
  accent: 'hover:shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.2)]',
  none: '',
};

export default function Card({
  children,
  className = '',
  hover = true,
  interactive = false,
  padding = 'p-6',
  variant = 'default',
  glow = 'default',
  loading = false,
  onClick,
  ...props
}) {
  const isInteractive = interactive || onClick;

  return (
    <motion.div
      initial="rest"
      whileHover={hover || isInteractive ? "hover" : "rest"}
      whileTap={isInteractive ? "tap" : "rest"}
      variants={cardVariants}
      onClick={onClick}
      className={`
        relative
        ${variants[variant]}
        rounded-2xl
        ${padding}
        ${hover || isInteractive ? 'transition-all duration-400 ease-smooth' : ''}
        ${isInteractive ? 'cursor-pointer' : ''}
        ${glow !== 'none' ? glowColors[glow] : ''}
        ${loading ? 'animate-pulse pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Gradient overlay on hover */}
      {(hover || isInteractive) && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/5 to-transparent dark:from-white/3 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: durations.normal }}
        />
      )}

      {/* Border glow effect */}
      {glow !== 'none' && (hover || isInteractive) && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: durations.normal }}
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-alpha) 0%, transparent 50%, var(--color-accent-alpha) 100%)',
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
