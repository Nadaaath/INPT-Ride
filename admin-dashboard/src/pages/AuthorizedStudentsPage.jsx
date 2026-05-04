import { useEffect, useState } from "react";
import {
  createAuthorizedStudent,
  getAuthorizedStudents,
  updateAuthorizedStudent,
} from "../api/studentsApi";
import PageHeader from "../components/common/PageHeader";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EmptyState from "../components/common/EmptyState";
import DataTable from "../components/common/DataTable";
import { formatDateTime } from "../utils/formatters";

function ActiveBadge({ active }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: "999px",
        background: active ? "#dcfce7" : "#fee2e2",
        color: active ? "#166534" : "#b91c1c",
        fontWeight: 600,
        fontSize: "12px",
      }}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

const initialFormData = {
  full_name: "",
  email: "",
  student_identifier: "",
  is_active: true,
};

export default function AuthorizedStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const data = await getAuthorizedStudents();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load authorized students:", err);
      setError("Failed to load authorized students.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData(initialFormData);
    setEditingStudentId(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setError("");
    setMessage("");
    setEditingStudentId(null);
    setFormData(initialFormData);
    setShowForm(true);
  }

  function openEditForm(student) {
    setError("");
    setMessage("");
    setEditingStudentId(student.id);
    setFormData({
      full_name: student.full_name ?? "",
      email: student.email ?? "",
      student_identifier: student.student_identifier ?? "",
      is_active: !!student.is_active,
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

    if (!formData.full_name || !formData.email || !formData.student_identifier) {
      setError("Please fill in full name, email, and student identifier.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        student_identifier: formData.student_identifier.trim(),
        is_active: formData.is_active,
      };

      if (editingStudentId) {
        await updateAuthorizedStudent(editingStudentId, payload);
        setMessage("Authorized student updated successfully.");
      } else {
        await createAuthorizedStudent(payload);
        setMessage("Authorized student created successfully.");
      }

      resetForm();
      await loadStudents();
    } catch (err) {
      console.error("Failed to save authorized student:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Failed to save authorized student.";

      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(student) {
    setError("");
    setMessage("");

    try {
      await updateAuthorizedStudent(student.id, {
        full_name: student.full_name,
        email: student.email,
        student_identifier: student.student_identifier,
        is_active: !student.is_active,
      });

      setMessage(
        `Student ${!student.is_active ? "activated" : "deactivated"} successfully.`
      );
      await loadStudents();
    } catch (err) {
      console.error("Failed to update student status:", err);

      const backendMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Failed to update student status.";

      setError(backendMessage);
    }
  }

  const columns = [
    {
      key: "full_name",
      label: "Full Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "student_identifier",
      label: "Student ID",
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => <ActiveBadge active={row.is_active} />,
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
            onClick={() => handleToggleActive(row)}
            style={{
              padding: "8px 12px",
              border: "none",
              borderRadius: "8px",
              background: row.is_active ? "#b91c1c" : "#16a34a",
              color: "white",
              cursor: "pointer",
            }}
          >
            {row.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Authorized Students"
        subtitle="Manage which students are allowed to create INPT Ride accounts."
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={openCreateForm}
              style={{
                padding: "10px 14px",
                border: "none",
                borderRadius: "10px",
                background: "#16a34a",
                color: "white",
                cursor: "pointer",
              }}
            >
              Add Student
            </button>

            <button
              onClick={loadStudents}
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
          </div>
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
            <h3 style={{ margin: 0 }}>
              {editingStudentId ? "Edit Authorized Student" : "Add Authorized Student"}
            </h3>

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
                <label>Full Name</label>
                <input
                  name="full_name"
                  value={formData.full_name}
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
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
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
                <label>Student Identifier</label>
                <input
                  name="student_identifier"
                  value={formData.student_identifier}
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
                {submitting
                  ? editingStudentId
                    ? "Updating..."
                    : "Creating..."
                  : editingStudentId
                  ? "Update Student"
                  : "Create Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading authorized students..." />
      ) : students.length === 0 ? (
        <EmptyState message="No authorized students found." />
      ) : (
        <DataTable columns={columns} rows={students} />
      )}
    </div>
  );
}