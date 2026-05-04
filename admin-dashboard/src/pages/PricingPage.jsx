import { useEffect, useState } from "react";
import { getPricingEntries, updatePricingEntry } from "../api/pricingApi";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import { formatMoney } from "../utils/formatters";

export default function PricingPage() {
  const [pricingEntries, setPricingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPricingId, setEditingPricingId] = useState(null);

  const [formData, setFormData] = useState({
    vehicle_type: "",
    base_fee: "",
    hourly_rate: "",
    is_active: true,
  });

  useEffect(() => {
    loadPricingEntries();
  }, []);

  async function loadPricingEntries() {
    try {
      setLoading(true);
      setError("");

      const data = await getPricingEntries();
      setPricingEntries(data);
    } catch (err) {
      console.error("Failed to load pricing entries:", err);
      setError("Failed to load pricing entries.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      vehicle_type: "",
      base_fee: "",
      hourly_rate: "",
      is_active: true,
    });
    setEditingPricingId(null);
    setShowForm(false);
  }

  function openEditForm(entry) {
    setError("");
    setMessage("");
    setEditingPricingId(entry.id);
    setFormData({
      vehicle_type: entry.vehicle_type ?? "",
      base_fee:
        entry.base_fee !== null && entry.base_fee !== undefined
          ? String(entry.base_fee)
          : "0",
      hourly_rate:
        entry.hourly_rate !== null && entry.hourly_rate !== undefined
          ? String(entry.hourly_rate)
          : "0",
      is_active: !!entry.is_active,
    });
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!editingPricingId) {
      setError("No pricing entry selected.");
      return;
    }

    const baseFee = Number(formData.base_fee);
    const hourlyRate = Number(formData.hourly_rate);

    if (Number.isNaN(baseFee) || baseFee < 0) {
      setError("Base fee must be a valid non-negative number.");
      return;
    }

    if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
      setError("Hourly rate must be a valid non-negative number.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        vehicle_type: formData.vehicle_type,
        base_fee: baseFee,
        hourly_rate: hourlyRate,
        is_active: formData.is_active,
      };

      await updatePricingEntry(editingPricingId, payload);

      setMessage("Pricing entry updated successfully.");
      resetForm();
      await loadPricingEntries();
    } catch (err) {
      console.error("Failed to update pricing entry:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Failed to update pricing entry.";

      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: "vehicle_type",
      label: "Vehicle Type",
      render: (row) =>
        row.vehicle_type ? String(row.vehicle_type).toUpperCase() : "-",
    },
    {
      key: "base_fee",
      label: "Base Fee",
      render: (row) => formatMoney(row.base_fee),
    },
    {
      key: "hourly_rate",
      label: "Hourly Rate",
      render: (row) => formatMoney(row.hourly_rate),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <span
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: "999px",
            background: row.is_active ? "#dcfce7" : "#fee2e2",
            color: row.is_active ? "#166534" : "#b91c1c",
            fontWeight: 600,
            fontSize: "12px",
          }}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => openEditForm(row)}
          style={{
            padding: "8px 12px",
            border: "none",
            borderRadius: "8px",
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Pricing"
        subtitle="Manage pricing rules used for ride billing."
        action={
          <button
            onClick={loadPricingEntries}
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

      {showForm && (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            maxWidth: "760px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <h3 style={{ margin: 0 }}>Edit Pricing Entry</h3>

            <button
              onClick={resetForm}
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label>Vehicle Type</label>
                <input
                  value={formData.vehicle_type}
                  disabled
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#f9fafb",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label>Base Fee</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="base_fee"
                  value={formData.base_fee}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label>Hourly Rate</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              Active
            </label>

            <div>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#111827",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {submitting ? "Updating..." : "Update Pricing"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading pricing entries..." />
      ) : pricingEntries.length === 0 ? (
        <EmptyState message="No pricing entries found." />
      ) : (
        <DataTable columns={columns} rows={pricingEntries} />
      )}
    </div>
  );
}