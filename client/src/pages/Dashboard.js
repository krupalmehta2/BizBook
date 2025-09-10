import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import logo from "../assets/logo.png";
import Footer from "../components/Footer";


const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    myBookings: 0,
    products: 0,
  });

  // ✅ Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await API.get("/api/business");
        setBusinesses(res.data);

        // Dummy stats for now
        setStats({
          totalBusinesses: res.data.length,
          myBookings: Math.floor(Math.random() * 10),
          products: Math.floor(Math.random() * 20),
        });
      } catch (err) {
        console.error("❌ Error fetching businesses:", err.message);
      }
    };

    fetchBusinesses();
  }, []);

  // ✅ Filter businesses
  const filteredBusinesses = businesses.filter((biz) =>
    biz.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(135deg, #f5f7fa, #e6ecf5)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🧭 Hero Section */}
      <div style={{ textAlign: "center", margin: "50px 0" }}>
        <img src={logo} alt="BizBook Logo" style={{ width: "140px" }} />
        <h2
          style={{
            marginTop: "20px",
            color: "#2c3e50",
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          🇮🇳 Vocal for Local – Discover Local Businesses
        </h2>
        <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
          Support small businesses, strengthen communities 💙
        </p>
      </div>

      {/* 📊 Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          margin: "30px 40px",
        }}
      >
        {[
          { label: "Total Businesses", value: stats.totalBusinesses, color: "#2980b9" },
          { label: "My Bookings", value: stats.myBookings, color: "#27ae60" },
          { label: "Products/Services", value: stats.products, color: "#8e44ad" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "14px",
              boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              textAlign: "center",
              borderTop: `5px solid ${stat.color}`,
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <h2 style={{ color: stat.color, margin: 0 }}>{stat.value}</h2>
            <p
              style={{
                margin: "6px 0",
                fontWeight: "bold",
                color: "#34495e",
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* 🔍 Search */}
      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <input
          type="text"
          placeholder="🔍 Search businesses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "14px 20px",
            width: "400px",
            maxWidth: "90%",
            fontSize: "16px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        />
      </div>

      {/* 🧾 Business Cards */}
      <div
        style={{
          padding: "0 40px 60px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "25px",
          flex: 1,
        }}
      >
        {filteredBusinesses.length > 0 ? (
          filteredBusinesses.map((biz) => (
            <div
              key={biz._id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "14px",
                padding: "20px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                borderLeft: "5px solid #3498db",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-6px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <h3
                style={{
                  marginBottom: "8px",
                  color: "#2c3e50",
                  fontSize: "20px",
                }}
              >
                {biz.name}
              </h3>
              <p style={{ fontSize: "14px", color: "#7f8c8d" }}>
                📍 {biz.address}
              </p>
              <p style={{ fontSize: "14px", color: "#7f8c8d" }}>
                ☎️ {biz.contact}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#95a5a6",
                  marginBottom: "14px",
                }}
              >
                {biz.description}
              </p>

              <Link
                to={`/business/${biz._id}`}
                style={{
                  background: "linear-gradient(90deg, #3498db, #2980b9)",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "0.3s",
                }}
              >
                View Details →
              </Link>
            </div>
          ))
        ) : (
          <p
            style={{
              gridColumn: "1 / -1",
              color: "#999",
              textAlign: "center",
            }}
          >
            No businesses found.
          </p>
        )}
      </div>

      {/* ⬇ Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
