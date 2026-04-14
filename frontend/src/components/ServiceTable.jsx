export default function ServiceTable({ data, loading }) {
    const total = data.reduce((sum, s) => sum + parseFloat(s.cost), 0);

    return (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", margin: "0 0 16px" }}>
                Service Breakdown
            </h2>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ height: "40px", background: "#f1f5f9", borderRadius: "6px" }} />
                    ))}
                </div>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                            <th style={{ textAlign: "left", padding: "8px 12px", color: "#64748b", fontWeight: "600", fontSize: "12px", textTransform: "uppercase" }}>Service</th>
                            <th style={{ textAlign: "right", padding: "8px 12px", color: "#64748b", fontWeight: "600", fontSize: "12px", textTransform: "uppercase" }}>Cost</th>
                            <th style={{ textAlign: "right", padding: "8px 12px", color: "#64748b", fontWeight: "600", fontSize: "12px", textTransform: "uppercase" }}>% of Total</th>
                            <th style={{ textAlign: "left", padding: "8px 12px", color: "#64748b", fontWeight: "600", fontSize: "12px", textTransform: "uppercase" }}>Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((s, i) => {
                            const pct = ((parseFloat(s.cost) / total) * 100).toFixed(1);
                            return (
                                <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "10px 12px", color: "#0f172a", fontWeight: "500" }}>{s.service}</td>
                                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#0f172a", fontWeight: "600" }}>${parseFloat(s.cost).toFixed(2)}</td>
                                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#64748b" }}>{pct}%</td>
                                    <td style={{ padding: "10px 12px", minWidth: "120px" }}>
                                        <div style={{ background: "#f1f5f9", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
                                            <div style={{ width: `${pct}%`, height: "100%", background: "#6366f1", borderRadius: "99px" }} />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: "2px solid #f1f5f9" }}>
                            <td style={{ padding: "10px 12px", fontWeight: "700", color: "#0f172a" }}>Total</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "700", color: "#6366f1" }}>${total.toFixed(2)}</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", color: "#64748b" }}>100%</td>
                            <td />
                        </tr>
                    </tfoot>
                </table>
            )}
        </div>
    );
}