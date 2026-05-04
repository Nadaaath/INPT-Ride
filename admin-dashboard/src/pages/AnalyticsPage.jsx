import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import {
  getBillingAnalyticsSummary,
  getBillingRevenueTrend,
} from "../api/analyticsApi";
import { formatMoney } from "../utils/formatters";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadAnalytics(days);
  }, [days]);

  async function loadAnalytics(selectedDays) {
    try {
      setLoading(true);
      setError("");

      const [summaryData, trendData] = await Promise.all([
        getBillingAnalyticsSummary(),
        getBillingRevenueTrend(selectedDays),
      ]);

      setSummary(summaryData);
      setTrend(trendData);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading analytics..." />;
  }

  if (error) {
    return <EmptyState message={error} />;
  }

  const penaltiesTotal =
    Number(summary?.late_penalties_total ?? 0) +
    Number(summary?.damage_penalties_total ?? 0);

  const maxRevenue = Math.max(
    ...trend.map((item) => Number(item.revenue ?? 0)),
    1
  );

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Revenue and billing insights for INPT Ride."
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="select"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{ minWidth: "140px" }}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            <button className="btn btn--primary" onClick={() => loadAnalytics(days)}>
              Refresh
            </button>
          </div>
        }
      />

      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <StatCard
          title="Revenue Today"
          value={formatMoney(summary?.revenue_today)}
          color="#2563eb"
        />
        <StatCard
          title="Revenue This Week"
          value={formatMoney(summary?.revenue_this_week)}
          color="#16a34a"
        />
        <StatCard
          title="Revenue This Month"
          value={formatMoney(summary?.revenue_this_month)}
          color="#9333ea"
        />
        <StatCard
          title="Paid Invoices"
          value={summary?.paid_invoices_count ?? 0}
          color="#ea580c"
        />
        <StatCard
          title="Unpaid Invoices"
          value={summary?.unpaid_invoices_count ?? 0}
          color="#dc2626"
        />
        <StatCard
          title="Avg Revenue / Ride"
          value={formatMoney(summary?.average_revenue_per_completed_ride)}
          color="#0891b2"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 0.7fr",
          gap: "20px",
        }}
      >
        <div className="card card--padded">
          <div style={{ fontWeight: 800, fontSize: "20px", marginBottom: "18px" }}>
            Revenue Trend
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "end",
              gap: "10px",
              height: "260px",
              paddingTop: "10px",
            }}
          >
            {trend.map((item) => {
              const revenue = Number(item.revenue ?? 0);
              const height = Math.max((revenue / maxRevenue) * 220, 8);

              return (
                <div
                  key={item.day}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "end",
                    gap: "8px",
                  }}
                >
                  <div
                    title={`${item.day} — ${formatMoney(revenue)}`}
                    style={{
                      width: "100%",
                      borderRadius: "10px 10px 0 0",
                      height: `${height}px`,
                      background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)",
                      minWidth: "16px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      maxHeight: "60px",
                    }}
                  >
                    {item.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card--padded">
          <div style={{ fontWeight: 800, fontSize: "20px", marginBottom: "18px" }}>
            Penalties
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="card" style={{ padding: "16px", borderRadius: "16px" }}>
              <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>
                Late Penalties
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px" }}>
                {formatMoney(summary?.late_penalties_total)}
              </div>
            </div>

            <div className="card" style={{ padding: "16px", borderRadius: "16px" }}>
              <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>
                Damage Penalties
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px" }}>
                {formatMoney(summary?.damage_penalties_total)}
              </div>
            </div>

            <div className="card" style={{ padding: "16px", borderRadius: "16px" }}>
              <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>
                Penalties Total
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px" }}>
                {formatMoney(penaltiesTotal)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}