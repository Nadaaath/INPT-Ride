export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div className="page-header__left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {action && <div className="page-header__actions">{action}</div>}
    </div>
  );
}