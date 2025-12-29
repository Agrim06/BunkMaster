import { Link } from "react-router-dom";

const Navbar = () => {
    const handleLayout = () =>{
        localStorage.removeItem("token");
        window.location.href("/login");
    }

return (
    <nav className="navbar">
        <h2 className="navbar-title">BunkMaster</h2>
      <div>
        <Link to="/" style={{ marginRight: "12px" }}>Dashboard</Link>
        <Link to="/subjects" style={{ marginRight: "12px" }}>Subjects</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};


export default Navbar;