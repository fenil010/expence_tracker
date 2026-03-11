import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-char dark:text-zinc-200">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full px-3 py-2.5 pr-10
            bg-parchment dark:bg-zinc-950 border-2 border-stone/40 dark:border-zinc-700
            rounded-xl text-char dark:text-zinc-100 text-sm
            appearance-none cursor-pointer
            focus:outline-none focus:border-[var(--color-accent)] dark:focus:border-[var(--color-accent)]
            transition-all duration-300 ease-smooth
            ${error ? 'border-red-300/60 dark:border-red-500/50' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option
              key={typeof opt === 'string' ? opt : opt.value}
              value={typeof opt === 'string' ? opt : opt.value}
            >
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-drift dark:text-zinc-500 pointer-events-none" />
      </div>
      {error && (
        <p className="text-xs text-red-600/70 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
