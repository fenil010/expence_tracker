import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { calculateBudgetHealth, getStatusLabel, formatCurrency } from '../../utils/budgetHealth';

export default function SpendingMeter({
  spent = 0,
  limit = 0,
  category,
  size = 'md',
  showLabels = true,
  className = ''
}) {
  const { resolved } = useTheme();
  const isDark = resolved === 'dark';
  
  const health = calculateBudgetHealth(spent, limit);
  const color = isDark ? health.colorDark : health.color;
  const statusLabel = getStatusLabel(health.status);

  // Size variants
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`spending-meter ${className}`} role="meter" aria-valuenow={health.percentage} aria-valuemin="0" aria-valuemax="100" aria-label={`Budget ${statusLabel}: ${formatCurrency(spent)} of ${formatCurrency(limit)}`}>
      {showLabels && (
        <div className="flex justify-between items-baseline mb-2">
          <div className="flex items-center gap-2">
            {category && (
              <span className={`font-medium text-char dark:text-zinc-200 ${textSizeClasses[size]}`}>
                {category}
              </span>
            )}
            <span 
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                health.status === 'healthy' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : health.status === 'warning'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <span className={`tabular-nums text-drift dark:text-zinc-400 ${textSizeClasses[size]}`}>
            {formatCurrency(spent)} / {formatCurrency(limit)}
          </span>
        </div>
      )}
      
      <div className={`${sizeClasses[size]} bg-sand/50 dark:bg-zinc-800 rounded-full overflow-hidden relative`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ 
            width: `${health.percentage}%`
          }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
          className={`h-full rounded-full relative ${
            health.isOverBudget && health.status === 'over' ? 'animate-pulse' : ''
          }`}
          style={{ backgroundColor: color }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      </div>

      {health.isOverBudget && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium"
        >
          Over budget by {formatCurrency(Math.abs(health.remaining))}
        </motion.p>
      )}

      {!health.isOverBudget && health.remaining > 0 && showLabels && (
        <p className="text-xs text-drift dark:text-zinc-500 mt-1">
          {formatCurrency(health.remaining)} remaining
        </p>
      )}
    </div>
  );
}
