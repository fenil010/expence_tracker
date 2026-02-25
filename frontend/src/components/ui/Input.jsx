import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { durations, easings } from '../../utils/animations';

const Input = forwardRef(({
  label,
  error,
  success,
  icon: Icon,
  className = '',
  type = 'text',
  maxLength,
  showCharCount = false,
  floatingLabel = false,
  clearable = false,
  value,
  onChange,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');

  const hasValue = (value || internalValue)?.toString().length > 0;
  const isFloating = floatingLabel && (isFocused || hasValue);
  const isPassword = type === 'password';
  const currentType = isPassword && showPassword ? 'text' : type;

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(e);
    }
  };

  const handleClear = () => {
    const syntheticEvent = {
      target: { value: '' },
      currentTarget: { value: '' },
    };
    setInternalValue('');
    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  const charCount = (value || internalValue)?.toString().length || 0;

  return (
    <div className="space-y-1.5">
      <div className="relative">
        {/* Floating or static label */}
        {label && (
          <motion.label
            className={`
              absolute left-3 pointer-events-none
              text-sm font-medium transition-all duration-300
              ${floatingLabel
                ? isFloating
                  ? '-top-2.5 text-xs bg-parchment dark:bg-zinc-950 px-1 text-char dark:text-zinc-200'
                  : 'top-1/2 -translate-y-1/2 text-drift dark:text-zinc-500'
                : 'block mb-1.5 text-char dark:text-zinc-200'
              }
              ${Icon && !floatingLabel ? 'pl-7' : ''}
              ${error ? 'text-red-600/70 dark:text-red-400' : ''}
              ${isFocused && !error ? 'text-[var(--color-accent)]' : ''}
            `}
            animate={{
              y: floatingLabel && isFloating ? 0 : floatingLabel ? '50%' : 0,
              scale: floatingLabel && isFloating ? 0.85 : 1,
            }}
            transition={{ duration: durations.fast, ease: easings.easeOut }}
          >
            {label}
          </motion.label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-drift dark:text-zinc-500 pointer-events-none" />
          )}

          {/* Input field */}
          <motion.input
            ref={ref}
            type={currentType}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLength}
            className={`
              w-full px-3 py-2.5
              ${Icon ? 'pl-10' : ''}
              ${(clearable && hasValue) || isPassword || success || error ? 'pr-10' : ''}
              bg-parchment dark:bg-zinc-950 border-2 border-stone/40 dark:border-zinc-700
              rounded-xl text-char dark:text-zinc-100 text-sm
              placeholder:text-drift/60 dark:placeholder:text-zinc-500
              focus:outline-none
              transition-all duration-300 ease-smooth
              ${error 
                ? 'border-red-300/60 dark:border-red-500/50 focus:border-red-400 dark:focus:border-red-400' 
                : success
                ? 'border-green-300/60 dark:border-green-500/50 focus:border-green-400 dark:focus:border-green-400'
                : 'focus:border-[var(--color-accent)] dark:focus:border-[var(--color-accent)]'
              }
              ${className}
            `}
            {...props}
          />

          {/* Animated focus ring */}
          <AnimatePresence>
            {isFocused && !error && (
              <motion.div
                className="absolute inset-0 rounded-xl pointer-events-none"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: durations.fast }}
                style={{
                  boxShadow: '0 0 0 3px var(--color-accent-alpha)',
                }}
              />
            )}
          </AnimatePresence>

          {/* Right side icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Validation icon */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: durations.fast, ease: easings.springGentle }}
                >
                  <X className="w-4 h-4 text-red-600/70 dark:text-red-400" />
                </motion.div>
              )}
              {success && !error && (
                <motion.div
                  key="success"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: durations.fast, ease: easings.springGentle }}
                >
                  <Check className="w-4 h-4 text-green-600/70 dark:text-green-400" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password visibility toggle */}
            {isPassword && (
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-drift dark:text-zinc-500 hover:text-char dark:hover:text-zinc-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </motion.button>
            )}

            {/* Clear button */}
            {clearable && hasValue && !isPassword && (
              <motion.button
                type="button"
                onClick={handleClear}
                className="text-drift dark:text-zinc-500 hover:text-char dark:hover:text-zinc-300 transition-colors"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: durations.fast }}
            className="text-xs text-red-600/70 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Character count */}
      {showCharCount && maxLength && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs text-right ${
            charCount > maxLength * 0.9
              ? 'text-red-600/70 dark:text-red-400'
              : 'text-drift dark:text-zinc-500'
          }`}
        >
          {charCount} / {maxLength}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
