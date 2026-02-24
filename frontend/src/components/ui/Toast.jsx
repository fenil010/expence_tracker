import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const toastVariants = {
  success: {
    icon: CheckCircle,
    bg: 'bg-linen border-stone/40',
    iconColor: 'text-emerald-700/70',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-linen border-red-200/40',
    iconColor: 'text-red-700/60',
  },
};

export function Toast({ message, type = 'success', onClose }) {
  const config = toastVariants[type] || toastVariants.success;
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`
        flex items-center gap-3 px-4 py-3
        ${config.bg} border rounded-xl shadow-elevated
        min-w-[280px] max-w-sm
      `}
    >
      <Icon className={`w-4 h-4 ${config.iconColor} shrink-0`} />
      <p className="text-sm text-char flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 text-drift hover:text-char transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

let toastId = 0;
let addToastFn = null;

export function toast(message, type = 'success') {
  addToastFn?.({ id: ++toastId, message, type });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = (t) => setToasts((prev) => [...prev, t]);
    return () => { addToastFn = null; };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => remove(t.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
