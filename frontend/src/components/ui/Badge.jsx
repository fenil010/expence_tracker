const variants = {
  default: 'bg-sand/60 text-char',
  success: 'bg-emerald-50/60 text-emerald-800/70',
  danger: 'bg-red-50/60 text-red-800/70',
  warning: 'bg-amber-50/60 text-amber-800/70',
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
