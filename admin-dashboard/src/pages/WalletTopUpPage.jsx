import { useEffect, useMemo, useState } from "react";
import { getProfiles } from "../api/profilesApi";
import { topUpWallet } from "../api/walletApi";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import { formatMoney } from "../utils/formatters";

function StatusBadge({ banned }) {
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

export default function WalletTopUpPage() {
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [amount, setAmount] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      setLoadingProfiles(true);
      setError("");

      const data = await getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error("Failed to load profiles:", err);
      setError("Failed to load profiles.");
    } finally {
      setLoadingProfiles(false);
    }
  }

  const selectedProfile = useMemo(() => {
    return profiles.find(
      (profile) => String(profile.id) === String(selectedProfileId)
    );
  }, [profiles, selectedProfileId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedProfile) {
      setError("Please select a profile.");
      return;
    }

    if (!amount) {
      setError("Please enter a top-up amount.");
      return;
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await topUpWallet({
        userId: selectedProfile.user,
        amount: numericAmount,
      });

      const newBalance =
        result.new_balance !== undefined && result.new_balance !== null
          ? result.new_balance
          : "updated";

      setMessage(`Wallet topped up successfully. New balance: ${newBalance}`);
      setAmount("");

      await loadProfiles();
    } catch (err) {
      console.error("Wallet top-up failed:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Wallet top-up failed.";

      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Wallet Top Up"
        subtitle="Add funds to a student's wallet."
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
            Refresh Profiles
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

      {loadingProfiles ? (
        <LoadingSpinner label="Loading profiles..." />
      ) : profiles.length === 0 ? (
        <EmptyState message="No profiles found." />
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            maxWidth: "760px",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                Select Profile
              </label>

              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                }}
              >
                <option value="">Choose a profile</option>
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.username} — {formatMoney(profile.wallet_balance)}
                  </option>
                ))}
              </select>
            </div>

            {selectedProfile ? (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <strong>Username:</strong> {selectedProfile.username}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Current Balance:</strong>{" "}
                  {formatMoney(selectedProfile.wallet_balance)}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Warnings:</strong> {selectedProfile.warning_count}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <StatusBadge banned={selectedProfile.is_banned} />
                </div>
              </div>
            ) : null}

            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 600,
                }}
              >
                Top-Up Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "12px 16px",
                border: "none",
                borderRadius: "10px",
                background: "#16a34a",
                color: "white",
                cursor: "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Top Up Wallet"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}