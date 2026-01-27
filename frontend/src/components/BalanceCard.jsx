export default function BalanceCard() {
    return (
        <div className="card h-full  relative">
            <p className="text-sm text-slate-500">Total Balance</p>
            <h2 className="text-3xl font-semibold mt-1">$24,500.00</h2>

            <div className="flex gap-3 mt-5">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-full shadow">
                    + Add Funds
                </button>
                <button className="border px-6 py-3 rounded-full">
                    Transfer
                </button>
            </div>

            <div className="absolute top-5 right-5 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                +2.5%
            </div>
        </div>
    );
}
