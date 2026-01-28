import {
    LineChart,
    Line,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

/**
 * NetWorthChart Component
 * Displays net worth trend as a line chart.
 * 
 * @param {Object} props
 * @param {Array} props.chartData - Array of { month, value } objects
 */
export default function NetWorthChart({ chartData = [] }) {
    // Fallback data if empty
    const data = chartData.length > 0 ? chartData : [
        { month: "Jan", value: 0 },
        { month: "Feb", value: 0 },
    ];

    return (
        <div className="card">
            <p className="font-semibold">Net Worth Overview</p>
            <p className="text-sm text-slate-500 mb-4">
                Last 6 Months Performance (in $K)
            </p>

            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data}>
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                        hide
                        domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                        }}
                        formatter={(value) => [`$${value}K`, 'Net Worth']}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#2563eb' }}
                        activeDot={{ r: 6, fill: '#2563eb' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
