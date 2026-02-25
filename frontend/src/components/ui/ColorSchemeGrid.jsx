import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { COLOR_SCHEMES } from '../../context/ThemeContext';

export default function ColorSchemeGrid({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => {
        const isSelected = value === key;
        
        return (
          <motion.button
            key={key}
            onClick={() => onChange(key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-300
              ${isSelected 
                ? 'border-obsidian dark:border-zinc-400 bg-sand/30 dark:bg-zinc-800/50 shadow-sm' 
                : 'border-stone/20 dark:border-zinc-800 hover:border-stone/40 dark:hover:border-zinc-700 bg-linen dark:bg-zinc-900'
              }
            `}
            aria-label={`Select ${scheme.name} color scheme`}
            aria-pressed={isSelected}
          >
            {/* Color Preview Swatches */}
            <div className="flex gap-2 mb-3">
              <div 
                className="w-8 h-8 rounded-lg shadow-sm border border-stone/10 dark:border-zinc-700" 
                style={{ backgroundColor: scheme.light.accent }}
                aria-hidden="true"
                title="Light mode accent"
              />
              <div 
                className="w-8 h-8 rounded-lg shadow-sm border border-stone/10 dark:border-zinc-700" 
                style={{ backgroundColor: scheme.dark.accent }}
                aria-hidden="true"
                title="Dark mode accent"
              />
            </div>
            
            {/* Scheme Name */}
            <p className="text-sm font-medium text-obsidian dark:text-white relative z-10">
              {scheme.name}
            </p>
            
            {/* Selected Indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full 
                           bg-obsidian dark:bg-zinc-200 
                           flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-linen dark:text-zinc-900" strokeWidth={3} />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
