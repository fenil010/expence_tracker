import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeSelector() {
  const { mode, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {themes.map(({ value, label, icon: Icon }) => (
        <motion.button
          key={value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTheme(value)}
          className={`
            flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl
            transition-all duration-200 font-medium text-sm
            ${mode === value
              ? 'bg-obsidian dark:bg-white text-parchment dark:text-zinc-900 shadow-soft'
              : 'bg-sand/40 dark:bg-zinc-800/60 text-char dark:text-zinc-300 hover:bg-sand/60 dark:hover:bg-zinc-800 border border-stone/20 dark:border-zinc-700'
            }
          `}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
          <span>{label}</span>
        </motion.button>
      ))}
    </div>
  );
}
