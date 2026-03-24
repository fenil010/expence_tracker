import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalVariants, backdropVariants, durations } from '../../utils/animations';

// Detect if device is mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxWidth = 'max-w-lg',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement;

    // Get all focusable elements in the modal
    const getFocusableElements = () => {
      if (!modalRef.current) return [];
      return modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    const handleTabKey = (e) => {
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Focus first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    }

    // Add event listeners
    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
      
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const mobile = isMobile();
  const currentModalVariants = mobile ? modalVariants.mobile : modalVariants.desktop;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={(e) => {
            if (closeOnOverlayClick && e.target === overlayRef.current) {
              onClose();
            }
          }}
        >
          {/* Enhanced backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-obsidian/30 dark:bg-black/60"
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(8px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            transition={{ duration: durations.normal }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            variants={currentModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              relative w-full ${maxWidth}
              glass-elevated
              rounded-2xl shadow-2xl
              overflow-hidden
              ${mobile ? 'mb-0 rounded-b-none' : ''}
              ${className}
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone/20 dark:border-zinc-700/50 bg-white/40 dark:bg-zinc-800/30">
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-obsidian dark:text-white"
                >
                  {title}
                </h2>
                {showCloseButton && (
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-xl text-drift dark:text-zinc-400 hover:text-char dark:hover:text-zinc-200 hover:bg-white/60 dark:hover:bg-zinc-700/50 transition-all duration-300 cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
