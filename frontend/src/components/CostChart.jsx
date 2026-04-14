import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function CostChart({ data, loading }) {
    const chartData = data.map((s) => ({
        name: s.service.replace("Amazon ", "").replace("AWS ", ""),
        cost: parseFloat(s.cost),
    }));

    return (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", margin: "0 0 20px" }}>
                Cost by Service
            </h2>

            {loading ? (
                <div style={{ height: "280px", background: "#f1f5f9", borderRadius: "8px" }} />
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 60 }}>
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#64748b" }}
                            tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip
                            formatter={(v) => [`$${v.toFixed(2)}`, "Cost"]}
                            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                        />
                        <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
