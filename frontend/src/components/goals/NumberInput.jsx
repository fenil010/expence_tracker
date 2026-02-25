import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function NumberInput({ 
  value, 
  onChange, 
  min = 0, 
  max, 
  step = 1,
  label,
  placeholder = '0.00',
  ...props 
}) {
  const handleIncrement = () => {
    const newValue = (parseFloat(value) || 0) + step;
    if (!max || newValue <= max) {
      onChange({ target: { value: newValue.toString() } });
    }
  };

  const handleDecrement = () => {
    const newValue = (parseFloat(value) || 0) - step;
    if (newValue >= min) {
      onChange({ target: { value: newValue.toString() } });
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    // Allow empty string for clearing
    if (newValue === '') {
      onChange(e);
      return;
    }
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      if ((!min || numValue >= min) && (!max || numValue <= max)) {
        onChange(e);
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-char dark:text-zinc-300">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={handleDecrement}
          disabled={value !== '' && parseFloat(value) <= min}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            w-10 h-10 rounded-lg
            bg-sand dark:bg-zinc-800
            hover:bg-stone/30 dark:hover:bg-zinc-700
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-obsidian/20 dark:focus:ring-zinc-600
          "
        >
          <Minus className="w-4 h-4 text-char dark:text-zinc-300" />
        </motion.button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="
            flex-1 px-4 py-2.5 rounded-lg
            bg-linen dark:bg-zinc-900
            border border-stone/20 dark:border-zinc-800
            text-obsidian dark:text-white
            placeholder:text-drift dark:placeholder:text-zinc-500
            focus:outline-none focus:ring-2 focus:ring-obsidian/20 dark:focus:ring-zinc-700
            transition-all duration-200
            text-center font-semibold text-lg tabular-nums
          "
          {...props}
        />

        <motion.button
          type="button"
          onClick={handleIncrement}
          disabled={max && value !== '' && parseFloat(value) >= max}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="
            w-10 h-10 rounded-lg
            bg-sand dark:bg-zinc-800
            hover:bg-stone/30 dark:hover:bg-zinc-700
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-obsidian/20 dark:focus:ring-zinc-600
          "
        >
          <Plus className="w-4 h-4 text-char dark:text-zinc-300" />
        </motion.button>
      </div>
    </div>
  );
}
