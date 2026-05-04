import { useEffect, useMemo, useState } from "react";
import { getRides } from "../api/ridesApi";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import {
  formatDate,
  formatDateTime,
  formatStatus,
} from "../utils/formatters";

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let background = "#e5e7eb";
  let color = "#374151";

  if (normalized === "ongoing") {
    background = "#fef3c7";
    color = "#b45309";
  } else if (normalized === "completed") {
    background = "#dcfce7";
    color = "#166534";
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: "999px",
        background,
        color,
        fontWeight: 600,
        fontSize: "12px",
        textTransform: "capitalize",
      }}
    >
      {formatStatus(status)}
    </span>
  );
}

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

export default function RidesPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRides();
  }, []);

  async function loadRides() {
    try {
      setLoading(true);
      setError("");

      const data = await getRides();
      setRides(data);
    } catch (err) {
      console.error("Failed to load rides:", err);
      setError("Failed to load rides.");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setStatusFilter("all");
    setDateFilter("");
    setSearchTerm("");
  }

  const filteredRides = useMemo(() => {
    return rides.filter((row) => {
      const normalizedStatus = String(row.status || "").toLowerCase();
      const normalizedSearch = searchTerm.trim().toLowerCase();

      const matchesStatus =
        statusFilter === "all" || normalizedStatus === statusFilter;

      const rideDate =
        row.actual_start_time
          ? new Date(row.actual_start_time).toISOString().slice(0, 10)
          : "";

      const matchesDate = !dateFilter || rideDate === dateFilter;

      const haystack = [
        row.id,
        row.user,
        row.vehicle,
        row.vehicle_code,
        row.vehicle_type,
        row.vehicle_slot_number,
        row.reservation,
        row.status,
        row.actual_start_time,
        row.actual_end_time,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || haystack.includes(normalizedSearch);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [rides, statusFilter, dateFilter, searchTerm]);

  const columns = [
    {
      key: "id",
      label: "Ride #",
    },
    {
      key: "user",
      label: "User",
      render: (row) => row.user ?? "-",
    },
    {
      key: "vehicle_code",
      label: "Vehicle",
      render: (row) =>
        row.vehicle_code
          ? `${row.vehicle_code}${
              row.vehicle_type ? ` • ${String(row.vehicle_type).toUpperCase()}` : ""
            }`
          : row.vehicle || "-",
    },
    {
      key: "reservation",
      label: "Reservation",
      render: (row) => row.reservation ?? "-",
    },
    {
      key: "actual_start_time",
      label: "Start Date",
      render: (row) => formatDate(row.actual_start_time),
    },
    {
      key: "actual_start_time_detail",
      label: "Started At",
      render: (row) => formatDateTime(row.actual_start_time),
    },
    {
      key: "actual_end_time",
      label: "Ended At",
      render: (row) => formatDateTime(row.actual_end_time),
    },
    {
      key: "used_hours",
      label: "Used Hours",
      render: (row) => row.used_hours ?? "-",
    },
    {
      key: "distance_km",
      label: "Distance",
      render: (row) =>
        row.distance_km !== null && row.distance_km !== undefined
          ? `${row.distance_km} km`
          : "-",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      label: "Created At",
      render: (row) => formatDateTime(row.created_at),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Rides"
        subtitle="Monitor active and completed rides across the platform."
        action={
          <button
            onClick={loadRides}
            style={{
              padding: "10px 14px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "white",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        }
      />

      {error ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "14px",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "12px",
          }}
        >
          {error}
        </div>
      ) : null}

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Search
            </label>
            <input
              type="text"
              placeholder="Ride, user, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
              }}
            >
              Start Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <button
              onClick={clearFilters}
              style={{
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                background: "white",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: "16px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Showing {filteredRides.length} of {rides.length} rides
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading rides..." />
      ) : filteredRides.length === 0 ? (
        <EmptyState message="No rides match the current filters." />
      ) : (
        <DataTable columns={columns} rows={filteredRides} />
      )}
    </div>
  );
}