import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.08,
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3, ease: 'easeIn' }
  },
};

const headerVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function PageWrapper({
  children,
  title,
  subtitle,
  action,
  className = '',
}) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`space-y-6 ${className}`}
    >
      {(title || action) && (
        <motion.div
          variants={headerVariants}
          className="flex items-end justify-between gap-4"
        >
          <div>
            {title && (
              <h1 className="text-3xl font-semibold text-obsidian dark:text-white tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1.5 text-sm text-drift dark:text-zinc-400">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </motion.div>
      )}
      {children}
    </motion.div>
  );
}
