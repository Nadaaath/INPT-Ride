export default function Topbar({ title, onLogout }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "24px",
      }}
    >
      <h1 style={{ margin: 0 }}>{title}</h1>

      <button
        onClick={onLogout}
        style={{
          padding: "10px 14px",
          border: "none",
          borderRadius: "10px",
          background: "#111827",
          color: "white",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </header>
  );
}