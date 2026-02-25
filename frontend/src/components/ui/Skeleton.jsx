export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-linen dark:bg-zinc-900 border border-stone/30 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 flex-1"
          style={{ maxWidth: i === 0 ? '40%' : '20%' }}
        />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-linen dark:bg-zinc-900 border border-stone/30 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-lg"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}
