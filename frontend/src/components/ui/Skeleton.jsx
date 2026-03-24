import { motion } from 'framer-motion';

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  animation = 'wave',
  className = '',
  style = {},
}) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const animations = {
    pulse: {
      animate: {
        opacity: [0.5, 1, 0.5],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    wave: {
      animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    none: {},
  };

  const animationProps = animations[animation];

  return (
    <motion.div
      className={`
        bg-gradient-to-r from-stone/20 via-stone/40 to-stone/20
        dark:from-zinc-800/30 dark:via-zinc-700/50 dark:to-zinc-800/30
        ${variants[variant]}
        ${className}
      `}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
        backgroundSize: '200% 100%',
        ...style,
      }}
      {...animationProps}
    />
  );
}

// Preset skeleton components
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`space-y-4 p-6 ${className}`}>
      <Skeleton variant="text" width="60%" height="1.5rem" />
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="rectangular" height="200px" className="mt-4" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4, className = '' }) {
  return (
    <div className={`flex gap-4 py-3 ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" className="flex-1" />
      ))}
    </div>
  );
}

export function ChartSkeleton({ className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <Skeleton variant="text" width="40%" height="1.5rem" />
      <Skeleton variant="rectangular" height="300px" />
    </div>
  );
}
