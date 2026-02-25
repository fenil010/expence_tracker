import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxWidth = 'max-w-lg',
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-obsidian/20 dark:bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative w-full ${maxWidth}
              bg-linen dark:bg-zinc-900 border border-stone/30 dark:border-zinc-700
              rounded-2xl shadow-modal
              overflow-hidden
              ${className}
            `}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone/30 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-obsidian dark:text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-drift dark:text-zinc-400 hover:text-char dark:hover:text-zinc-200 hover:bg-sand dark:hover:bg-zinc-800 transition-colors duration-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
