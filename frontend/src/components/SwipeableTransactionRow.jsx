import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { Badge } from './ui';
import { formatCurrency } from '../utils/currencies';

const SWIPE_THRESHOLD = -100;

export default function SwipeableTransactionRow({ 
  tx, 
  index, 
  onDelete 
}) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0], [0.5, 1]);
  const deleteOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const deleteScale = useTransform(x, [-150, -50, 0], [1, 0.8, 0.5]);

  const handleDragEnd = (_event, info) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      // Swipe threshold reached - delete
      onDelete(tx._id || tx.id);
    } else {
      // Snap back
      x.set(0);
    }
  };

  const isIncome = tx.type === 'income';

  return (
    <div className="relative overflow-hidden border-b border-stone/10 dark:border-zinc-800/50 last:border-0">
      {/* Delete background */}
      <motion.div 
        className="absolute inset-y-0 right-0 flex items-center justify-end px-6 bg-red-600/80 dark:bg-red-700/80"
        style={{ opacity: deleteOpacity }}
      >
        <motion.div style={{ scale: deleteScale }}>
          <Trash2 className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
        className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-sand/20 dark:hover:bg-zinc-800/40 transition-colors duration-200 bg-linen dark:bg-zinc-900 cursor-grab active:cursor-grabbing touch-pan-y"
      >
        {/* Description */}
        <div className="col-span-5 flex items-center gap-3">
          <div className={`
            w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${isIncome ? 'bg-emerald-50/60 dark:bg-emerald-950/40' : 'bg-sand/60 dark:bg-zinc-800'}
          `}>
            {isIncome ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-700/60 dark:text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-char dark:text-zinc-400" />
            )}
          </div>
          <span className="text-sm font-medium text-obsidian dark:text-zinc-200 truncate">
            {tx.description || 'Transaction'}
          </span>
        </div>

        {/* Category */}
        <div className="col-span-2">
          <Badge>{tx.category?.name || tx.category || '—'}</Badge>
        </div>

        {/* Date */}
        <div className="col-span-2 text-sm text-drift dark:text-zinc-400 tabular-nums">
          {new Date(tx.date).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })}
        </div>

        {/* Amount */}
        <div className={`col-span-2 text-sm font-semibold text-right tabular-nums ${isIncome ? 'text-emerald-700/70 dark:text-emerald-400' : 'text-obsidian dark:text-zinc-200'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), tx.currency || 'USD')}
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <button
            onClick={() => onDelete(tx._id || tx.id)}
            className="p-1.5 rounded-lg text-drift dark:text-zinc-500 hover:text-red-700/60 dark:hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/30 transition-all duration-300 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
