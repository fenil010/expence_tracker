import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  error,
  type = 'page',
  recoverable = true,
  onRetry,
  className = '',
}) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';

  // Log error for debugging
  if (typeof error === 'object' && error !== null) {
    console.error('ErrorState:', error);
  }

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  };

  if (type === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0, ...shakeAnimation }}
        className={`flex items-center gap-2 text-sm text-red-600 dark:text-red-400 ${className}`}
      >
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{errorMessage}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, ...shakeAnimation }}
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      <div className="mb-4 text-red-600/70 dark:text-red-400">
        <AlertCircle className="w-16 h-16" />
      </div>
      
      <h3 className="text-lg font-semibold text-char dark:text-zinc-200 mb-2">
        Something went wrong
      </h3>
      
      <p className="text-sm text-drift dark:text-zinc-400 mb-6 max-w-md">
        {errorMessage}
      </p>
      
      {recoverable && onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </motion.div>
  );
}
