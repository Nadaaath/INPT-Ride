import { useEffect, useState } from "react";
import { getProfiles, updateProfile } from "../api/profilesApi";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import { formatDateTime, formatMoney } from "../utils/formatters";

function BannedBadge({ banned }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: "999px",
        background: banned ? "#fee2e2" : "#dcfce7",
        color: banned ? "#b91c1c" : "#166534",
        fontWeight: 600,
        fontSize: "12px",
      }}
    >
      {banned ? "Banned" : "Active"}
    </span>
  );
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    wallet_balance: "",
    warning_count: "",
    is_banned: false,
    user: null,
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      setLoading(true);
      setError("");

      const data = await getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error("Failed to load profiles:", err);
      setError("Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      username: "",
      wallet_balance: "",
      warning_count: "",
      is_banned: false,
      user: null,
    });
    setEditingProfileId(null);
    setShowForm(false);
  }

  function openEditForm(profile) {
    setError("");
    setMessage("");
    setEditingProfileId(profile.id);
    setFormData({
      username: profile.username ?? "",
      wallet_balance:
        profile.wallet_balance !== null && profile.wallet_balance !== undefined
          ? String(profile.wallet_balance)
          : "0",
      warning_count:
        profile.warning_count !== null && profile.warning_count !== undefined
          ? String(profile.warning_count)
          : "0",
      is_banned: !!profile.is_banned,
      user: profile.user,
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

    if (!editingProfileId) {
      setError("No profile selected.");
      return;
    }

    const walletBalance = Number(formData.wallet_balance);
    const warningCount = Number(formData.warning_count);

    if (Number.isNaN(walletBalance) || walletBalance < 0) {
      setError("Wallet balance must be a valid non-negative number.");
      return;
    }

    if (Number.isNaN(warningCount) || warningCount < 0) {
      setError("Warning count must be a valid non-negative number.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        user: formData.user,
        wallet_balance: walletBalance,
        warning_count: warningCount,
        is_banned: formData.is_banned,
      };

      await updateProfile(editingProfileId, payload);

      setMessage("Profile updated successfully.");
      resetForm();
      await loadProfiles();
    } catch (err) {
      console.error("Failed to update profile:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Failed to update profile.";

      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleBan(profile) {
    setError("");
    setMessage("");

    try {
      await updateProfile(profile.id, {
        user: profile.user,
        wallet_balance: profile.wallet_balance,
        warning_count: profile.warning_count,
        is_banned: !profile.is_banned,
      });

      setMessage(
        `Profile ${!profile.is_banned ? "banned" : "unbanned"} successfully.`
      );
      await loadProfiles();
    } catch (err) {
      console.error("Failed to update banned status:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Failed to update banned status.";

      setError(backendMessage);
    }
  }

  const columns = [
    {
      key: "username",
      label: "Username",
    },
    {
      key: "wallet_balance",
      label: "Wallet Balance",
      render: (row) => formatMoney(row.wallet_balance),
    },
    {
      key: "warning_count",
      label: "Warnings",
    },
    {
      key: "is_banned",
      label: "Status",
      render: (row) => <BannedBadge banned={row.is_banned} />,
    },
    {
      key: "created_at",
      label: "Created At",
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
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

          <button
            onClick={() => handleToggleBan(row)}
            style={{
              padding: "8px 12px",
              border: "none",
              borderRadius: "8px",
              background: row.is_banned ? "#16a34a" : "#b91c1c",
              color: "white",
              cursor: "pointer",
            }}
          >
            {row.is_banned ? "Unban" : "Ban"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Profiles"
        subtitle="Manage student account status, wallet balance, and warnings."
        action={
          <button
            onClick={loadProfiles}
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
            <h3 style={{ margin: 0 }}>Edit Profile</h3>

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
                <label>Username</label>
                <input
                  value={formData.username}
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
                <label>Wallet Balance</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="wallet_balance"
                  value={formData.wallet_balance}
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
                <label>Warning Count</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="warning_count"
                  value={formData.warning_count}
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
                name="is_banned"
                checked={formData.is_banned}
                onChange={handleChange}
              />
              Banned
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
                {submitting ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading profiles..." />
      ) : profiles.length === 0 ? (
        <EmptyState message="No profiles found." />
      ) : (
        <DataTable columns={columns} rows={profiles} />
      )}
    </div>
  );
}