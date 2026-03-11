import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { backdropVariants, durations } from '../../utils/animations';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' | 'warning'
    loading = false,
}) {
    const colors = {
        danger: {
            icon: 'bg-red-50/60 dark:bg-red-950/40',
            iconColor: 'text-red-600/70 dark:text-red-400',
            button: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
        },
        warning: {
            icon: 'bg-amber-50/60 dark:bg-amber-950/40',
            iconColor: 'text-amber-600/70 dark:text-amber-400',
            button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700',
        },
    };

    const colorSet = colors[variant] || colors.danger;
    const IconComponent = variant === 'danger' ? Trash2 : AlertTriangle;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 z-[60] flex items-center justify-center px-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        className="absolute inset-0 bg-obsidian/30 dark:bg-black/60"
                        initial={{ backdropFilter: 'blur(0px)' }}
                        animate={{ backdropFilter: 'blur(8px)' }}
                        exit={{ backdropFilter: 'blur(0px)' }}
                        transition={{ duration: durations.normal }}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="relative w-full max-w-sm bg-linen dark:bg-zinc-900 border border-stone/30 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirm-title"
                        aria-describedby="confirm-message"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-1.5 rounded-xl text-drift dark:text-zinc-400 hover:text-char dark:hover:text-zinc-200 hover:bg-sand dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="px-6 py-6 text-center">
                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className={`w-14 h-14 rounded-2xl ${colorSet.icon} flex items-center justify-center mx-auto mb-4`}
                            >
                                <IconComponent className={`w-6 h-6 ${colorSet.iconColor}`} />
                            </motion.div>

                            {/* Title */}
                            <h3 id="confirm-title" className="text-lg font-semibold text-obsidian dark:text-white mb-2">
                                {title}
                            </h3>

                            {/* Message */}
                            <p id="confirm-message" className="text-sm text-drift dark:text-zinc-400 mb-6 leading-relaxed">
                                {message}
                            </p>

                            {/* Buttons */}
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-char dark:text-zinc-300 bg-sand/50 dark:bg-zinc-800 hover:bg-sand dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {cancelText}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-white ${colorSet.button} transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2`}
                                >
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        confirmText
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
