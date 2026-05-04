import { useEffect, useMemo, useState } from "react";
import {
  createVehicle,
  getVehicles,
  updateVehicle,
} from "../api/vehiclesApi";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import { formatStatus, formatVehicleType } from "../utils/formatters";

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let className = "badge";
  if (normalized === "available") className += " badge--success";
  else if (normalized === "in_use") className += " badge--danger";
  else if (normalized === "reserved") className += " badge--warning";
  else className += " badge--info";

  return <span className={className}>{formatStatus(status)}</span>;
}

const initialFormData = {
  code: "",
  type: "bike",
  status: "available",
  slot_number: "",
  battery_level: "",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    try {
      setLoading(true);
      setError("");

      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setError("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingVehicleId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setError("");
    setMessage("");
    setEditingVehicleId(null);
    setFormData(initialFormData);
    setShowForm(true);
  }

  function openEditForm(vehicle) {
    setError("");
    setMessage("");
    setEditingVehicleId(vehicle.id);
    setFormData({
      code: vehicle.code ?? "",
      type: vehicle.type ?? "bike",
      status: vehicle.status ?? "available",
      slot_number:
        vehicle.slot_number !== null && vehicle.slot_number !== undefined
          ? String(vehicle.slot_number)
          : "",
      battery_level:
        vehicle.battery_level !== null && vehicle.battery_level !== undefined
          ? String(vehicle.battery_level)
          : "",
    });
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const isScooter = useMemo(
    () => String(formData.type).toLowerCase() === "scooter",
    [formData.type]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (
      !formData.code ||
      !formData.type ||
      !formData.status ||
      !formData.slot_number
    ) {
      setError("Please fill in code, type, status, and slot number.");
      return;
    }

    const slotNumber = Number(formData.slot_number);
    if (Number.isNaN(slotNumber) || slotNumber <= 0) {
      setError("Slot number must be a valid positive number.");
      return;
    }

    let batteryLevel = null;
    if (formData.battery_level !== "") {
      batteryLevel = Number(formData.battery_level);

      if (
        Number.isNaN(batteryLevel) ||
        batteryLevel < 0 ||
        batteryLevel > 100
      ) {
        setError("Battery level must be between 0 and 100.");
        return;
      }
    }

    if (isScooter && batteryLevel === null) {
      setError("Battery level is required for scooters.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        code: formData.code.trim(),
        type: formData.type,
        status: formData.status,
        slot_number: slotNumber,
        battery_level: batteryLevel,
      };

      if (editingVehicleId) {
        await updateVehicle(editingVehicleId, payload);
        setMessage("Vehicle updated successfully.");
      } else {
        await createVehicle(payload);
        setMessage("Vehicle created successfully.");
      }

      resetForm();
      await loadVehicles();
    } catch (err) {
      console.error("Failed to save vehicle:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Failed to save vehicle.";

      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: "code",
      label: "Code",
    },
    {
      key: "type",
      label: "Type",
      render: (row) => formatVehicleType(row.type),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "slot_number",
      label: "Slot",
    },
    {
      key: "battery_level",
      label: "Battery",
      render: (row) =>
        row.battery_level !== null && row.battery_level !== undefined
          ? `${row.battery_level}%`
          : "-",
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
        title="Vehicles"
        subtitle="Manage and monitor all vehicles in the system."
        action={
          <>
            <button className="btn btn--success" onClick={openCreateForm}>
              Add Vehicle
            </button>
            <button className="btn btn--primary" onClick={loadVehicles}>
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
              {editingVehicleId ? "Edit Vehicle" : "Create Vehicle"}
            </h3>

            <button className="btn btn--secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: "16px" }}>
              <div>
                <label>Code</label>
                <input
                  className="input"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Type</label>
                <select
                  className="select"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>

              <div>
                <label>Status</label>
                <select
                  className="select"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div>
                <label>Slot Number</label>
                <input
                  className="input"
                  type="number"
                  name="slot_number"
                  value={formData.slot_number}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>
                  Battery Level{" "}
                  {isScooter ? "(required for scooter)" : "(optional)"}
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="100"
                  name="battery_level"
                  value={formData.battery_level}
                  onChange={handleChange}
                  placeholder={isScooter ? "Required for scooter" : "Optional"}
                />
              </div>
            </div>

            <button className="btn btn--dark" type="submit" disabled={submitting}>
              {submitting
                ? editingVehicleId
                  ? "Updating..."
                  : "Creating..."
                : editingVehicleId
                ? "Update Vehicle"
                : "Create Vehicle"}
            </button>
          </form>
        </div>
      ) : null}

      {loading ? (
        <LoadingSpinner label="Loading vehicles..." />
      ) : vehicles.length === 0 ? (
        <EmptyState message="No vehicles found." />
      ) : (
        <DataTable columns={columns} rows={vehicles} />
      )}
    </div>
  );
}