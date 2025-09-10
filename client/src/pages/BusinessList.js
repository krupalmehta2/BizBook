import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import defaultLogo from "../assets/logo.png"; // ✅ BizBook default logo
import Footer from "../components/Footer"; // ✅ Import Footer

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/api/business");
        setBusinesses(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("Failed to fetch businesses:", err.response || err.message);
        setError("❌ Failed to load businesses.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  // 🔍 Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(businesses);
    } else {
      setFiltered(
        businesses.filter((biz) =>
          biz.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, businesses]);

  if (loading) {
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: "120px",
          fontSize: "20px",
          color: "#34495e",
          fontWeight: "500",
        }}
      >
        ⏳ Loading businesses...
      </p>
    );
  }

  if (error) {
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: "120px",
          color: "#e74c3c",
          fontSize: "18px",
          fontWeight: "500",
        }}
      >
        {error}
      </p>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(135deg, #f9fbfd, #e9eef5)",
        minHeight: "100vh",
        padding: "50px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <h2
          style={{
            color: "#2c3e50",
            marginBottom: "20px",
            fontSize: "34px",
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          📍 Discover Local Businesses
        </h2>
        <p
          style={{
            color: "#7f8c8d",
            fontSize: "16px",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          Explore and connect with trusted local businesses around you.
        </p>

        {/* Search bar */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <input
            type="text"
            placeholder="🔍 Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "12px 18px",
              width: "100%",
              maxWidth: "400px",
              borderRadius: "10px",
              border: "1px solid #dcdfe3",
              fontSize: "15px",
              outline: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
          />
        </div>

        {/* Business Cards */}
        {filtered.length === 0 ? (
          <p
            style={{
              color: "#7f8c8d",
              fontSize: "16px",
              textAlign: "center",
            }}
          >
            No businesses found.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "30px",
            }}
          >
            {filtered.map((biz) => (
              <div
                key={biz._id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "18px",
                  overflow: "hidden",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 24px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(0,0,0,0.1)";
                }}
              >
                {/* Logo */}
                <div
                  style={{
                    backgroundColor: "#f9f9f9",
                    position: "relative",
                  }}
                >
                  <img
                    src={biz.logoUrl || defaultLogo}
                    alt={biz.name || "Business Logo"}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                  {/* Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      left: "0",
                      right: "0",
                      height: "60px",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ padding: "20px", flex: "1" }}>
                  <h3
                    style={{
                      marginBottom: "10px",
                      color: "#2c3e50",
                      fontSize: "20px",
                      fontWeight: "600",
                      lineHeight: "1.3",
                    }}
                  >
                    {biz.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#7f8c8d",
                      marginBottom: "20px",
                      lineHeight: "1.5",
                      minHeight: "45px",
                    }}
                  >
                    {biz.description || "No description provided."}
                  </p>
                  <Link
                    to={`/business/${biz._id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      backgroundColor: "#3498db",
                      color: "#fff",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      textDecoration: "none",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#1d6fa5";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#3498db";
                    }}
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ⬇ Footer */}
      <Footer />
    </div>
  );
};

export default BusinessList;
