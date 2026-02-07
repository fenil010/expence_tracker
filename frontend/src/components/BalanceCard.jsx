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
        <div className="card h-full relative border border-neutral-100/50 hover:shadow-lg transition-all duration-300">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Total Balance</p>
            <h2 className="text-4xl font-bold mt-2 text-neutral-900">{formattedBalance}</h2>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={onAddFunds}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 font-medium text-sm active:scale-95"
                >
                    + Add Funds
                </button>
                <button className="border-2 border-neutral-200 text-neutral-700 px-6 py-3 rounded-xl font-medium text-sm hover:bg-neutral-50 hover:border-neutral-300 focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 transition-all duration-300">
                    Transfer
                </button>
            </div>

            <div className="absolute top-6 right-6 text-xs bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold shadow-sm">
                +2.5%
            </div>
        </div>
    );
}
