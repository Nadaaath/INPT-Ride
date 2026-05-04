import { useEffect, useMemo, useState } from "react";
import {
  cancelReservation,
  getReservations,
} from "../api/reservationsApi";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import {
  formatDate,
  formatDateTime,
  formatTimeHour,
  formatStatus,
} from "../utils/formatters";

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let background = "#e5e7eb";
  let color = "#374151";

  if (normalized === "scheduled") {
    background = "#dbeafe";
    color = "#1d4ed8";
  } else if (normalized === "converted") {
    background = "#fef3c7";
    color = "#b45309";
  } else if (normalized === "completed") {
    background = "#dcfce7";
    color = "#166534";
  } else if (normalized === "cancelled") {
    background = "#fee2e2";
    color = "#b91c1c";
  } else if (normalized === "partially_used") {
    background = "#ede9fe";
    color = "#6d28d9";
  } else if (normalized === "no_show") {
    background = "#ffe4e6";
    color = "#be123c";
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
  { value: "scheduled", label: "Scheduled" },
  { value: "converted", label: "Converted" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "partially_used", label: "Partially Used" },
  { value: "no_show", label: "No Show" },
];

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    try {
      setLoading(true);
      setError("");

      const data = await getReservations();
      setReservations(data);
    } catch (err) {
      console.error("Failed to load reservations:", err);
      setError("Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelReservation(reservation) {
    const confirmCancel = window.confirm(
      `Cancel reservation #${reservation.id}?`
    );

    if (!confirmCancel) return;

    try {
      setCancellingId(reservation.id);
      setError("");
      setMessage("");

      const result = await cancelReservation(reservation.id);
      setMessage(result.message || "Reservation cancelled successfully.");

      await loadReservations();
    } catch (err) {
      console.error("Failed to cancel reservation:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Failed to cancel reservation.";

      setError(backendMessage);
    } finally {
      setCancellingId(null);
    }
  }

  function clearFilters() {
    setStatusFilter("all");
    setDateFilter("");
    setSearchTerm("");
  }

  const filteredReservations = useMemo(() => {
    return reservations.filter((row) => {
      const normalizedStatus = String(row.status || "").toLowerCase();
      const normalizedSearch = searchTerm.trim().toLowerCase();

      const matchesStatus =
        statusFilter === "all" || normalizedStatus === statusFilter;

      const matchesDate =
        !dateFilter || String(row.reserved_date || "") === dateFilter;

      const haystack = [
        row.id,
        row.user,
        row.vehicle,
        row.vehicle_code,
        row.vehicle_type,
        row.vehicle_slot_number,
        row.status,
        row.reserved_date,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || haystack.includes(normalizedSearch);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [reservations, statusFilter, dateFilter, searchTerm]);

  const columns = [
    {
      key: "id",
      label: "Reservation #",
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
      key: "reserved_date",
      label: "Date",
      render: (row) => formatDate(row.reserved_date),
    },
    {
      key: "time_range",
      label: "Time",
      render: (row) =>
        `${formatTimeHour(row.start_hour)} → ${formatTimeHour(row.end_hour)}`,
    },
    {
      key: "duration_hours",
      label: "Duration",
      render: (row) => `${row.duration_hours} h`,
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
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        const canCancel =
          String(row.status || "").trim().toLowerCase() === "scheduled";

        if (!canCancel) {
          return <span style={{ color: "#9ca3af" }}>No action</span>;
        }

        return (
          <button
            onClick={() => handleCancelReservation(row)}
            disabled={cancellingId === row.id}
            style={{
              padding: "8px 12px",
              border: "none",
              borderRadius: "8px",
              background: "#b91c1c",
              color: "white",
              cursor: "pointer",
            }}
          >
            {cancellingId === row.id ? "Cancelling..." : "Cancel"}
          </button>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle="Monitor reservation activity across the platform."
        action={
          <button
            onClick={loadReservations}
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

      {message ? (
        <div
          style={{
            marginBottom: "16px",
            padding: "14px",
            background: "#dcfce7",
            color: "#166534",
            borderRadius: "12px",
          }}
        >
          {message}
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
              placeholder="Reservation, user, vehicle..."
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
              Date
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
          Showing {filteredReservations.length} of {reservations.length} reservations
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading reservations..." />
      ) : filteredReservations.length === 0 ? (
        <EmptyState message="No reservations match the current filters." />
      ) : (
        <DataTable columns={columns} rows={filteredReservations} />
      )}
    </div>
  );
}