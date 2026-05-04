import { useEffect, useMemo, useState } from "react";
import { getInvoices } from "../api/invoicesApi";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import { formatDateTime, formatMoney } from "../utils/formatters";

function InvoiceStatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let className = "badge";
  if (normalized === "paid") className += " badge--success";
  else if (normalized === "pending") className += " badge--warning";
  else if (normalized === "cancelled") className += " badge--danger";
  else className += " badge--info";

  return <span className={className}>{status || "-"}</span>;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoading(true);
      setError("");

      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setStatusFilter("all");
    setSearchTerm("");
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter((row) => {
      const normalizedStatus = String(row.status || "").toLowerCase();
      const normalizedSearch = searchTerm.trim().toLowerCase();

      const matchesStatus =
        statusFilter === "all" || normalizedStatus === statusFilter;

      const haystack = [
        row.id,
        row.username,
        row.ride_id,
        row.vehicle_code,
        row.vehicle_type,
        row.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || haystack.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [invoices, statusFilter, searchTerm]);

  const columns = [
    {
      key: "id",
      label: "Invoice #",
      render: (row) => `#${row.id}`,
    },
    {
      key: "username",
      label: "User",
      render: (row) => row.username ?? "-",
    },
    {
      key: "ride_id",
      label: "Ride",
      render: (row) => (row.ride_id ? `#${row.ride_id}` : "-"),
    },
    {
      key: "vehicle_code",
      label: "Vehicle",
      render: (row) =>
        row.vehicle_code
          ? `${row.vehicle_code}${row.vehicle_type ? ` • ${String(row.vehicle_type).toUpperCase()}` : ""}`
          : "-",
    },
    {
      key: "base_fee",
      label: "Base Fee",
      render: (row) => formatMoney(row.base_fee),
    },
    {
      key: "time_amount",
      label: "Time Amount",
      render: (row) => formatMoney(row.time_amount),
    },
    {
      key: "late_penalty_amount",
      label: "Late Penalty",
      render: (row) => formatMoney(row.late_penalty_amount),
    },
    {
      key: "damage_fee",
      label: "Damage Fee",
      render: (row) => formatMoney(row.damage_fee),
    },
    {
      key: "total_amount",
      label: "Total",
      render: (row) => formatMoney(row.total_amount),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <InvoiceStatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      label: "Created At",
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: "paid_at",
      label: "Paid At",
      render: (row) => formatDateTime(row.paid_at),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Review billing records generated from completed rides."
        action={
          <button className="btn btn--primary" onClick={loadInvoices}>
            Refresh
          </button>
        }
      />

      {error ? <div className="alert alert--error">{error}</div> : null}

      <div className="form-card" style={{ marginBottom: "20px" }}>
        <div className="form-grid" style={{ alignItems: "end" }}>
          <div>
            <label>Status</label>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label>Search</label>
            <input
              className="input"
              type="text"
              placeholder="Invoice, user, ride, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <button className="btn btn--secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <div style={{ marginTop: "14px", color: "var(--text-muted)", fontSize: "14px" }}>
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading invoices..." />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState message="No invoices match the current filters." />
      ) : (
        <DataTable columns={columns} rows={filteredInvoices} />
      )}
    </div>
  );
}