import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
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
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-drift dark:text-zinc-500" />
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2.5
            ${Icon ? 'pl-10' : ''}
            bg-parchment dark:bg-zinc-950 border border-stone/40 dark:border-zinc-700
            rounded-xl text-char dark:text-zinc-100 text-sm
            placeholder:text-drift/60 dark:placeholder:text-zinc-500
            focus:outline-none focus:border-char dark:focus:border-zinc-400
            transition-colors duration-300 ease-smooth
            ${error ? 'border-red-300/60 dark:border-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600/70 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
