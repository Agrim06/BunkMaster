import { Link, useNavigate } from "react-router-dom";
import "../../styles/layout.css"

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        🎓 BunkTracker
      </div>
      <div className="navbar-links">
        {isLoggedIn ? (
          <>
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/subjects" className="nav-link">Subjects</Link>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;