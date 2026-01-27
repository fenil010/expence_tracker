export default function QuickActions() {
    return (
        <div className="grid grid-cols-2 gap-4 h-full">
            {["Reports", "Cards", "Bills", "Settings"].map(item => (
                <div
                    key={item}
                    className="card flex items-center justify-center text-slate-600 font-medium hover:scale-105 transition"
                >
                    {item}
                </div>
            ))}
        </div>
    );
}
