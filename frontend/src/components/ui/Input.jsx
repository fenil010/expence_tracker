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
        <label className="block text-sm font-medium text-char">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-drift" />
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2.5
            ${Icon ? 'pl-10' : ''}
            bg-parchment border border-stone/40
            rounded-xl text-char text-sm
            placeholder:text-drift/60
            focus:outline-none focus:border-char
            transition-colors duration-300 ease-smooth
            ${error ? 'border-red-300/60' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600/70">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
