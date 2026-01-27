export default function ProfileCard() {
    return (
        <div className="card h-full flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold">
                F
            </div>

            <div>
                <p className="text-sm text-slate-500">Good Morning,</p>
                <h2 className="text-lg font-semibold">Fenil</h2>

                <div className="flex gap-2 mt-2">
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
            Credit: 780
          </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            Pro
          </span>
                </div>
            </div>
        </div>
    );
}
