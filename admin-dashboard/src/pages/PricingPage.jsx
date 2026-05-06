import { useEffect, useState } from "react";
import {
  createPricingEntry,
  getPricingEntries,
  updatePricingEntry,
} from "../api/pricingApi";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import { formatMoney } from "../utils/formatters";

const initialFormData = {
  vehicle_type: "bike",
  base_fee: "",
  hourly_rate: "",
  late_return_multiplier: "1.30",
  no_show_fee: "",
  active: true,
};

export default function PricingPage() {
  const [pricingEntries, setPricingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPricingId, setEditingPricingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

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
    setFormData(initialFormData);
    setEditingPricingId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setError("");
    setMessage("");
    setEditingPricingId(null);
    setFormData(initialFormData);
    setShowForm(true);
  }

  function openEditForm(entry) {
    setError("");
    setMessage("");
    setEditingPricingId(entry.id);
    setFormData({
      vehicle_type: entry.vehicle_type ?? "bike",
      base_fee:
        entry.base_fee !== null && entry.base_fee !== undefined
          ? String(entry.base_fee)
          : "",
      hourly_rate:
        entry.hourly_rate !== null && entry.hourly_rate !== undefined
          ? String(entry.hourly_rate)
          : "",
      late_return_multiplier:
        entry.late_return_multiplier !== null &&
        entry.late_return_multiplier !== undefined
          ? String(entry.late_return_multiplier)
          : "1.30",
      no_show_fee:
        entry.no_show_fee !== null && entry.no_show_fee !== undefined
          ? String(entry.no_show_fee)
          : "",
      active: !!entry.active,
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

    const baseFee = Number(formData.base_fee);
    const hourlyRate = Number(formData.hourly_rate);
    const lateReturnMultiplier = Number(formData.late_return_multiplier);
    const noShowFee = Number(formData.no_show_fee);

    if (!formData.vehicle_type) {
      setError("Vehicle type is required.");
      return;
    }

    if (Number.isNaN(baseFee) || baseFee < 0) {
      setError("Base fee must be a valid non-negative number.");
      return;
    }

    if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
      setError("Hourly rate must be a valid non-negative number.");
      return;
    }

    if (Number.isNaN(lateReturnMultiplier) || lateReturnMultiplier < 1) {
      setError("Late return multiplier must be at least 1.");
      return;
    }

    if (Number.isNaN(noShowFee) || noShowFee < 0) {
      setError("No-show fee must be a valid non-negative number.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        vehicle_type: formData.vehicle_type,
        base_fee: baseFee,
        hourly_rate: hourlyRate,
        late_return_multiplier: lateReturnMultiplier,
        no_show_fee: noShowFee,
        active: formData.active,
      };

      if (editingPricingId) {
        await updatePricingEntry(editingPricingId, payload);
        setMessage("Pricing rule updated successfully.");
      } else {
        await createPricingEntry(payload);
        setMessage("Pricing rule created successfully.");
      }

      resetForm();
      await loadPricingEntries();
    } catch (err) {
      console.error("Failed to save pricing rule:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Failed to save pricing rule.";

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
      key: "late_return_multiplier",
      label: "Late Multiplier",
      render: (row) => row.late_return_multiplier ?? "-",
    },
    {
      key: "no_show_fee",
      label: "No-show Fee",
      render: (row) => formatMoney(row.no_show_fee),
    },
    {
      key: "active",
      label: "Status",
      render: (row) => (
        <span
          style={{
            display: "inline-block",
            padding: "6px 10px",
            borderRadius: "999px",
            background: row.active ? "#dcfce7" : "#fee2e2",
            color: row.active ? "#166534" : "#b91c1c",
            fontWeight: 600,
            fontSize: "12px",
          }}
        >
          {row.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button className="btn btn--dark" onClick={() => openEditForm(row)}>
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
          <>
            <button className="btn btn--success" onClick={openCreateForm}>
              Add Pricing Rule
            </button>
            <button className="btn btn--primary" onClick={loadPricingEntries}>
              Refresh
            </button>
          </>
        }
      />

      {error ? <div className="alert alert--error">{error}</div> : null}
      {message ? <div className="alert alert--success">{message}</div> : null}

      {showForm ? (
        <div className="form-card" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <h3 style={{ margin: 0 }}>
              {editingPricingId ? "Edit Pricing Rule" : "Create Pricing Rule"}
            </h3>

            <button className="btn btn--secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: "16px" }}>
              <div>
                <label>Vehicle Type</label>
                <select
                  className="select"
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  disabled={!!editingPricingId}
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>

              <div>
                <label>Base Fee</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  name="base_fee"
                  value={formData.base_fee}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Hourly Rate</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Late Return Multiplier</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="0.01"
                  name="late_return_multiplier"
                  value={formData.late_return_multiplier}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>No-show Fee</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  name="no_show_fee"
                  value={formData.no_show_fee}
                  onChange={handleChange}
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
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              Active
            </label>

            <div>
              <button className="btn btn--dark" type="submit" disabled={submitting}>
                {submitting
                  ? editingPricingId
                    ? "Updating..."
                    : "Creating..."
                  : editingPricingId
                  ? "Update Pricing Rule"
                  : "Create Pricing Rule"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

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