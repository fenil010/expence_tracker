export default function SpendingCard() {
    return (
        <div className="card">
            <p className="font-semibold">Spending</p>
            <h2 className="text-2xl font-semibold mt-1">$2,450.00</h2>
            <p className="text-sm text-orange-500 mt-1">
                12% less than avg
            </p>

            <div className="mt-6">
                <p className="text-xs text-slate-500 mb-1">
                    Budget Used
                </p>
                <div className="w-full bg-slate-200 h-2 rounded-full">
                    <div className="bg-orange-500 h-2 rounded-full w-[75%]" />
                </div>
                <p className="text-xs text-right text-slate-400 mt-1">
                    $850 remaining
                </p>
            </div>
        </div>
    );
}
