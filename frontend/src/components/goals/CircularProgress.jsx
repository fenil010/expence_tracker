import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

export default function CircularProgress({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 8,
  showPercentage = true,
  color = '#3D3830',
  backgroundColor = '#E8E4DA'
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  // Animate percentage number
  const animatedProgress = useCountUp(progress, 1000);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="dark:opacity-30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2 
          }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      {showPercentage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-2xl font-bold text-obsidian dark:text-white tabular-nums">
            {Math.round(animatedProgress)}%
          </span>
        </motion.div>
      )}
    </div>
  );
}
