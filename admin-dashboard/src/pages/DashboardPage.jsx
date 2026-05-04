import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import { getDashboardData } from "../api/dashboardApi";
import { getBillingAnalyticsSummary } from "../api/analyticsApi";
import { formatMoney, formatStatus } from "../utils/formatters";

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let className = "badge";
  if (normalized === "scheduled") className += " badge--info";
  else if (normalized === "cancelled") className += " badge--danger";
  else if (normalized === "completed") className += " badge--success";
  else if (normalized === "ongoing") className += " badge--warning";
  else if (normalized === "converted") className += " badge--warning";
  else className += " badge--info";

  return <span className={className}>{formatStatus(status)}</span>;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalAuthorizedStudents: 0,
    totalProfiles: 0,
    activeRides: 0,
    scheduledReservations: 0,
    cancelledReservations: 0,
    bannedProfiles: 0,
  });

  const [recentReservations, setRecentReservations] = useState([]);
  const [recentRides, setRecentRides] = useState([]);
  const [moneyAnalytics, setMoneyAnalytics] = useState({
    total_revenue: 0,
    revenue_this_month: 0,
    paid_invoices_count: 0,
    late_penalties_total: 0,
    damage_penalties_total: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        {
          vehicles,
          students,
          profiles,
          reservations,
          rides,
        },
        analyticsSummary,
      ] = await Promise.all([
        getDashboardData(),
        getBillingAnalyticsSummary(),
      ]);

      const activeRides = rides.filter(
        (ride) => String(ride.status || "").toLowerCase() === "ongoing"
      ).length;

      const scheduledReservations = reservations.filter(
        (reservation) =>
          String(reservation.status || "").toLowerCase() === "scheduled"
      ).length;

      const cancelledReservations = reservations.filter(
        (reservation) =>
          String(reservation.status || "").toLowerCase() === "cancelled"
      ).length;

      const bannedProfiles = profiles.filter((profile) => !!profile.is_banned).length;

      setStats({
        totalVehicles: vehicles.length,
        totalAuthorizedStudents: students.length,
        totalProfiles: profiles.length,
        activeRides,
        scheduledReservations,
        cancelledReservations,
        bannedProfiles,
      });

      const sortedReservations = [...reservations]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      const sortedRides = [...rides]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentReservations(sortedReservations);
      setRecentRides(sortedRides);
      setMoneyAnalytics(analyticsSummary);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  const penaltiesTotal =
    Number(moneyAnalytics.late_penalties_total ?? 0) +
    Number(moneyAnalytics.damage_penalties_total ?? 0);

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  if (error) {
    return <EmptyState message={error} />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of the INPT Ride system."
        action={
          <button className="btn btn--primary" onClick={loadDashboard}>
            Refresh
          </button>
        }
      />

      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <StatCard title="Total Vehicles" value={stats.totalVehicles} color="#2563eb" />
        <StatCard title="Authorized Students" value={stats.totalAuthorizedStudents} color="#16a34a" />
        <StatCard title="Profiles" value={stats.totalProfiles} color="#9333ea" />
        <StatCard title="Active Rides" value={stats.activeRides} color="#ea580c" />
        <StatCard title="Scheduled Reservations" value={stats.scheduledReservations} color="#0891b2" />
        <StatCard title="Cancelled Reservations" value={stats.cancelledReservations} color="#dc2626" />
        <StatCard title="Banned Profiles" value={stats.bannedProfiles} color="#b91c1c" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1.2fr",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div className="table-card">
          <div style={{ padding: "20px 20px 0", fontWeight: 800, fontSize: "20px" }}>
            Recent Reservations
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reservation</th>
                  <th>User</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#64748b" }}>
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  recentReservations.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>{item.user ?? "-"}</td>
                      <td>{item.vehicle_code || item.vehicle || "-"}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <div style={{ padding: "20px 20px 0", fontWeight: 800, fontSize: "20px" }}>
            Recent Rides
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ride</th>
                  <th>User</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "#64748b" }}>
                      No rides found.
                    </td>
                  </tr>
                ) : (
                  recentRides.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>{item.user ?? "-"}</td>
                      <td>{item.vehicle_code || item.vehicle || "-"}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "20px",
        }}
      >
        <div className="card card--padded">
          <div style={{ fontWeight: 800, fontSize: "20px", marginBottom: "18px" }}>
            Money Analytics
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(180px, 1fr))",
              gap: "14px",
            }}
          >
            <div className="card" style={{ padding: "16px", borderRadius: "16px" }}>
              <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>
                Total Revenue
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px" }}>
                {formatMoney(moneyAnalytics.total_revenue)}
              </div>
            </div>

            <div className="card" style={{ padding: "16px", borderRadius: "16px" }}>
              <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>
                Revenue This Month
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px" }}>
                {formatMoney(moneyAnalytics.revenue_this_month)}
              </div>
            </div>

            <div className="card" style={{ padding: "16px", borderRadius: "16px" }}>
              <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>
                Paid Invoices
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px" }}>
                {moneyAnalytics.paid_invoices_count ?? 0}
              </div>
            </div>

            <div className="card" style={{ padding: "16px", borderRadius: "16px" }}>
              <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>
                Penalties Total
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, marginTop: "6px" }}>
                {formatMoney(penaltiesTotal)}
              </div>
            </div>
          </div>
        </div>

        <div className="card card--padded">
          <div style={{ fontWeight: 800, fontSize: "20px", marginBottom: "18px" }}>
            Quick Actions
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/vehicles" className="btn btn--secondary" style={{ textAlign: "left" }}>
              Add Vehicle
            </Link>
            <Link to="/authorized-students" className="btn btn--secondary" style={{ textAlign: "left" }}>
              Add Authorized Student
            </Link>
            <Link to="/wallet-top-up" className="btn btn--secondary" style={{ textAlign: "left" }}>
              Top Up Wallet
            </Link>
            <Link to="/analytics" className="btn btn--secondary" style={{ textAlign: "left" }}>
              Open Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}