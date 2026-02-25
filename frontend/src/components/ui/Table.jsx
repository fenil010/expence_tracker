export default function Table({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone/30 dark:border-zinc-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  px-4 py-3 text-left text-xs font-medium
                  text-drift dark:text-zinc-500 uppercase tracking-wider
                  ${col.className || ''}
                `}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone/20 dark:divide-zinc-800">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-drift dark:text-zinc-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`
                  hover:bg-sand/50 dark:hover:bg-zinc-800/50 transition-colors duration-300
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-sm text-char dark:text-zinc-300 ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
