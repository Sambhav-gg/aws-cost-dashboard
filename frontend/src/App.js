import { useState, useEffect } from "react";
import axios from "axios";
import CostChart from "./components/CostChart";
import InsightPanel from "./components/InsightPanel";
import ServiceTable from "./components/ServiceTable";
// import dotenv from "dotenv";
// dotenv.config();

export default function App() {
  const [costs, setCosts] = useState([]);
  const [insight, setInsight] = useState("");
  const [loadingCosts, setLoadingCosts] = useState(true);
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchCosts();
    fetchInsights();
  }, []);

  async function fetchCosts() {
    try {
      setLoadingCosts(true);
      const res = await axios.get(`${API}/costs`);
      setCosts(res.data.data);
    } catch (err) {
      setError("Failed to fetch cost data");
    } finally {
      setLoadingCosts(false);
    }
  }

  async function fetchInsights() {
    try {
      setLoadingInsight(true);
      const res = await axios.get(`${API}/insights`);
      setInsight(res.data.insight);
    } catch (err) {
      setError("Failed to fetch insights");
    } finally {
      setLoadingInsight(false);
    }
  }

  const total = costs
    .reduce((sum, s) => sum + parseFloat(s.cost), 0)
    .toFixed(2);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "24px" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#0f172a", margin: 0 }}>
          AWS Cost Dashboard
        </h1>
        <p style={{ color: "#64748b", margin: "4px 0 0" }}>
          Powered by Gemini AI · Current month
        </p>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <StatCard title="Total Spend" value={`$${total}`} sub="This month" color="#6366f1" loading={loadingCosts} />
        <StatCard title="Top Service" value={costs[0]?.service?.split(" ").slice(-1)[0] || "—"} sub={costs[0] ? `$${costs[0].cost}` : ""} color="#f59e0b" loading={loadingCosts} />
        <StatCard title="Services Used" value={costs.length || "—"} sub="Across AWS" color="#10b981" loading={loadingCosts} />
      </div>

      {/* Chart + Insight */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <CostChart data={costs} loading={loadingCosts} />
        <InsightPanel insight={insight} loading={loadingInsight} onRefresh={fetchInsights} />
      </div>

      {/* Table */}
      <ServiceTable data={costs} loading={loadingCosts} />

    </div>
  );
}

function StatCard({ title, value, sub, color, loading }) {
  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
      {loading ? (
        <div style={{ height: "32px", background: "#f1f5f9", borderRadius: "6px", animation: "pulse 1.5s infinite" }} />
      ) : (
        <>
          <p style={{ fontSize: "28px", fontWeight: "700", color, margin: "0 0 4px" }}>{value}</p>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>{sub}</p>
        </>
      )}
    </div>
  );
}