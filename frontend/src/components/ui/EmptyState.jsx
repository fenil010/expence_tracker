import { motion } from 'framer-motion';
import { scaleVariants, durations } from '../../utils/animations';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <motion.div
      variants={scaleVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {Icon && (
        <motion.div
          className="mb-4 text-drift/40 dark:text-zinc-600"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon className="w-16 h-16" />
        </motion.div>
      )}
      
      <h3 className="text-lg font-semibold text-char dark:text-zinc-200 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-drift dark:text-zinc-400 mb-6 max-w-md">
        {description}
      </p>
      
      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
