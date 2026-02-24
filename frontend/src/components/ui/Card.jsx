import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hover = true,
  padding = 'p-6',
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 12px 32px rgba(26, 23, 20, 0.10)' } : {}}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`
        bg-linen border border-stone/25 rounded-2xl
        shadow-card ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
