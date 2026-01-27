export default function GoalsCard() {
    return (
        <div className="card">
            <p className="font-semibold">New Car</p>
            <p className="text-sm text-gray-500">$4,500 / $10,000</p>

            <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
                <div className="bg-purple-500 h-2 rounded-full w-[45%]"></div>
            </div>
        </div>
    );
}
