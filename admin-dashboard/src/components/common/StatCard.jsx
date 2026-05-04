export default function StatCard({ title, value, color = "#2563eb", subtitle }) {
  return (
    <div className="stat-card" style={{ "--primary": color }}>
      <div className="stat-card__label">{title}</div>
      <div className="stat-card__value">{value}</div>
      {subtitle ? (
        <div
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}