import {
    LineChart,
    Line,
    ResponsiveContainer
} from "recharts";

const data = [
    { month: "Jan", value: 10 },
    { month: "Mar", value: 15 },
    { month: "May", value: 22 },
    { month: "Jul", value: 30 },
    { month: "Sep", value: 18 },
    { month: "Nov", value: 40 },
];

export default function NetWorthChart() {
    return (
        <div className="card">
            <p className="font-semibold">Net Worth Overview</p>
            <p className="text-sm text-slate-500 mb-4">
                Last 12 Months Performance
            </p>

            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
