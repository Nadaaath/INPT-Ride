import { NavLink, useNavigate } from "react-router-dom";
import { clearAdminToken } from "../../utils/auth";

export default function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAdminToken();
    navigate("/login");
  }

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/vehicles", label: "Vehicles" },
    { to: "/authorized-students", label: "Authorized Students" },
    { to: "/profiles", label: "Profiles" },
    { to: "/wallet-top-up", label: "Wallet Top Up" },
    { to: "/pricing", label: "Pricing" },
    { to: "/reservations", label: "Reservations" },
    { to: "/rides", label: "Rides" },
    { to: "/analytics", label: "Analytics" },
    { to: "/invoices", label: "Invoices" },


  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__title">
          INPT <span>Ride</span>
        </div>
        <div className="sidebar__subtitle">Admin panel</div>
      </div>

      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="btn btn--secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}