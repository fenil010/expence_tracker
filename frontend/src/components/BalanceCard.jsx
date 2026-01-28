/**
 * BalanceCard Component
 * Displays total balance with Add Funds and Transfer buttons.
 * 
 * @param {Object} props
 * @param {number} props.balance - Current total balance
 * @param {Function} props.onAddFunds - Callback to trigger Add Funds modal
 */
export default function BalanceCard({ balance = 0, onAddFunds }) {
    // Format currency with locale
    const formattedBalance = balance.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return (
        <div className="card h-full relative">
            <p className="text-sm text-slate-500">Total Balance</p>
            <h2 className="text-3xl font-semibold mt-1">{formattedBalance}</h2>

            <div className="flex gap-3 mt-5">
                <button
                    onClick={onAddFunds}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                    + Add Funds
                </button>
                <button className="border border-slate-200 px-6 py-3 rounded-full hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition">
                    Transfer
                </button>
            </div>

            <div className="absolute top-5 right-5 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                +2.5%
            </div>
        </div>
    );
}
