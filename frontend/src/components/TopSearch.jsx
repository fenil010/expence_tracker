export default function TopSearch() {
    return (
        <div className="card flex items-center gap-3 mb-8">
            <input
                className="flex-1 bg-transparent outline-none text-slate-600"
                placeholder="Ask Fenil OS... (e.g. Show my spending)"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full">
                AI
            </button>
        </div>
    );
}
