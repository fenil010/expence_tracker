import { motion } from 'framer-motion';

export default function Toggle({
  checked = false,
  onChange,
  label,
  className = '',
}) {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={`
          relative w-11 h-6 rounded-full
          transition-colors duration-400 ease-smooth
          cursor-pointer
          ${checked ? 'bg-obsidian' : 'bg-stone/50'}
        `}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className={`
            absolute top-0.5 w-5 h-5 rounded-full bg-parchment shadow-soft
            ${checked ? 'left-[22px]' : 'left-0.5'}
          `}
        />
      </button>
      {label && (
        <span className="text-sm text-char">{label}</span>
      )}
    </label>
  );
}
