import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/layout.css"

const Navbar = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">

      <Link to="/" className="navbar-logo" style={{ textDecoration: "none" }}>🎓 BunkMaster</Link>

      <div className="navbar-links">
        {isLoggedIn ? (
          <>
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/subjects" className="nav-link">My Subjects</Link>

            <div className="user-profile" ref={profileRef}>
              <button
                className="profile-avatar"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="User Profile"
              >
                👤
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-name">My Account</span>
                  </div>
                  <button onClick={handleLogout} className="dropdown-item logout-link">
                    Log Out 🚪
                  </button>
                </div>
              )}
            </div>
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