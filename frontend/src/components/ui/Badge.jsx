const variants = {
  default: 'bg-sand/60 dark:bg-zinc-800 text-char dark:text-zinc-300',
  success: 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800/70 dark:text-emerald-400',
  danger: 'bg-red-50/60 dark:bg-red-950/40 text-red-800/70 dark:text-red-400',
  warning: 'bg-amber-50/60 dark:bg-amber-950/40 text-amber-800/70 dark:text-amber-400',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-lg
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
