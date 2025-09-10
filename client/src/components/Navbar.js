import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.brand}>BizBook</h2>
      <div style={styles.links}>
        {isLoggedIn ? (
          <>
            <NavLink to="/" label="Dashboard" />
            <NavLink to="/business" label="Businesses" />
            <NavLink to="/products" label="Products" />
            <NavLink to="/my-bookings" label="My Bookings" />
            <button onClick={handleLogout} style={styles.logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" label="Login" />
            <NavLink to="/register" label="Register" />
          </>
        )}
      </div>
    </nav>
  );
};

// ✅ Small reusable NavLink component
const NavLink = ({ to, label }) => (
  <Link to={to} style={styles.link}>
    {label}
  </Link>
);

const styles = {
  nav: {
    background: "#2c3e50",
    color: "#ecf0f1",
    padding: "12px 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { margin: 0, fontSize: "20px" },
  links: { display: "flex", alignItems: "center" },
  link: {
    marginLeft: "12px",
    textDecoration: "none",
    color: "#ecf0f1",
    fontSize: "14px",
    fontWeight: "bold",
  },
  logout: {
    marginLeft: "12px",
    padding: "6px 12px",
    background: "#e74c3c",
    border: "none",
    borderRadius: "5px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default Navbar;
