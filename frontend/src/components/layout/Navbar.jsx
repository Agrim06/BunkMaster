import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getMe } from "../../api/auth.api";
import { LayoutDashboard, BookOpen, User, LogOut, ChevronDown, Sparkles, LogIn, UserPlus } from "lucide-react";
import "../../styles/layout.css";
import logo from "../../images/logo.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const profileRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (isLoggedIn) {
      getMe()
        .then((data) => setUser(data))
        .catch((err) => console.error("Error fetching user for navbar:", err));
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authUserChanged"));
    navigate("/login");
  };

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

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo-container">
        <img src={logo} alt="BunkMaster Logo" className="navbar-logo-img" />
      </Link>

      <div className="navbar-links">
        {isLoggedIn ? (
          <>
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}
            >
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/subjects"
              className={`nav-link ${location.pathname === "/subjects" ? "active" : ""}`}
            >
              <BookOpen size={17} />
              <span>Subjects</span>
            </Link>

            <div className="user-profile" ref={profileRef}>
              <button
                className={`profile-avatar-btn ${isProfileOpen ? "active" : ""}`}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="User Profile"
              >
                <div className="profile-avatar-badge">
                  {getInitials(user?.name)}
                </div>
                <ChevronDown size={14} className={`dropdown-chevron ${isProfileOpen ? "open" : ""}`} />
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar-circle">
                      {getInitials(user?.name)}
                    </div>
                    <div className="dropdown-user-details">
                      <span className="dropdown-name">{user?.name || "Student"}</span>
                      <span className="dropdown-email">{user?.email || ""}</span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="dropdown-item profile"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    className="dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/subjects"
                    className="dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <BookOpen size={16} />
                    <span>Manage Subjects</span>
                  </Link>

                  <div className="dropdown-divider"></div>

                  <button onClick={handleLogout} className="dropdown-item logout-link">
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              <LogIn size={16} />
              <span>Login</span>
            </Link>
            <Link to="/register" className="nav-btn-primary">
              <UserPlus size={16} />
              <span>Sign Up</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;