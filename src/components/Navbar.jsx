import { NavLink, Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ title }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  const linkClass = ({ isActive }) =>
    `navbar-link${isActive ? " active" : ""}`;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" aria-label="Society Hub home">
        <span className="navbar-mark">S</span>
        <span>{title}</span>
      </Link>

      <div className="navbar-links">
        <NavLink to="/" end className={linkClass}>Home</NavLink>
        <NavLink to="/societies" className={linkClass}>Societies</NavLink>

        {token ? (
          <>
            <NavLink to="/applications" className={linkClass}>
              My Applications
            </NavLink>

            {user?.role === "admin" && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}

            <span className="navbar-user" title={user?.name || "Signed in user"}>
              {user?.name}
            </span>

            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <Link to="/register" className="navbar-cta">Join Society Hub</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
