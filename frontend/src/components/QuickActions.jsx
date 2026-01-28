/**
 * QuickActions Component
 * Quick action buttons grid with reset functionality.
 * 
 * @param {Object} props
 * @param {Function} props.onReset - Callback to reset all data
 */
export default function QuickActions({ onReset }) {
    const actions = [
        { name: 'Reports', icon: '📊' },
        { name: 'Cards', icon: '💳' },
        { name: 'Bills', icon: '📄' },
        { name: 'Reset', icon: '🔄', onClick: onReset, danger: true },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {actions.map((item) => (
                <div
                    key={item.name}
                    onClick={item.onClick}
                    className={`card flex flex-col items-center justify-center gap-2 cursor-pointer
                        ${item.danger
                            ? 'hover:bg-red-50 hover:border-red-200'
                            : 'hover:bg-blue-50 hover:border-blue-200'
                        } 
                        hover:scale-105 transition-all duration-200`}
                >
                    <span className="text-xl">{item.icon}</span>
                    <span className={`text-sm font-medium ${item.danger ? 'text-red-600' : 'text-slate-600'}`}>
                        {item.name}
                    </span>
                </div>
            ))}
        </div>
    );
}
