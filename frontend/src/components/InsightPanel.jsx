import ReactMarkdown from "react-markdown";

export default function InsightPanel({ insight, loading, onRefresh }) {
    return (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0f172a", margin: 0 }}>
                    AI Insights
                </h2>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    style={{
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? "Analyzing..." : "Refresh"}
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", maxHeight: "320px" }}>
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[100, 80, 90, 70, 85].map((w, i) => (
                            <div key={i} style={{ height: "14px", width: `${w}%`, background: "#f1f5f9", borderRadius: "4px" }} />
                        ))}
                    </div>
                ) : (
                    <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.7" }}>
                        <ReactMarkdown>{insight}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                    Powered by Groq · Llama 3.3 · Cached for 24hrs
                </p>
            </div>

        </div>
    );
}