import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Footer from "../components/Footer"; // ✅ Import Footer

const AllProducts = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get("/api/business");
        setBusinesses(res.data);
      } catch (err) {
        console.error("Error fetching businesses:", err);
      }
    };
    fetchBusinesses();
  }, []);

  // Fetch products by business
  const fetchProducts = async (businessId) => {
    if (!businessId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/api/products?businessId=${businessId}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessChange = (e) => {
    const id = e.target.value;
    setSelectedBusiness(id);
    fetchProducts(id);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ FIX: Safe navigation to business details
  const handleProductClick = (product) => {
    const businessId = product.businessId?._id || product.businessId;
    if (!businessId) return;

    const business =
      typeof product.businessId === "object"
        ? product.businessId
        : businesses.find((b) => b._id === businessId);

    if (!business) {
      navigate(`/business/${businessId}`, { state: { productId: product._id } });
      return;
    }

    if (business.type === "table") {
      navigate(`/table-booking/${business._id}`);
    } else if (business.type === "service") {
      navigate(`/service-booking/${business._id}`, {
        state: { productId: product._id },
      });
    } else {
      navigate(`/business/${business._id}`, { state: { productId: product._id } });
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Segoe UI, sans-serif", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: "1" }}>
        <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>All Products</h2>

        {/* Top Controls */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <select
            value={selectedBusiness}
            onChange={handleBusinessChange}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          >
            <option value="">-- Select Business --</option>
            {businesses.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />

          {selectedBusiness && (
            <button
              onClick={() => fetchProducts(selectedBusiness)}
              style={{
                padding: "12px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#3498db",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#2980b9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#3498db")
              }
            >
              Refresh
            </button>
          )}
        </div>

        {/* Loading/Error */}
        {loading && <p>Loading products...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Products Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            filteredProducts.map((p) => {
              const businessName =
                typeof p.businessId === "object"
                  ? p.businessId?.name
                  : businesses.find((b) => b._id === p.businessId)?.name || "Unknown";

              return (
                <div
                  key={p._id}
                  onClick={() => handleProductClick(p)}
                  style={{
                    border: "1px solid #ddd",
                    padding: "20px",
                    borderRadius: "12px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    transition: "0.3s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.05)")
                  }
                >
                  <h3 style={{ margin: "0 0 10px", color: "#34495e" }}>
                    {p.name}
                  </h3>
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    <strong>Price:</strong> ${p.price || 0}
                  </p>
                  {p.description && (
                    <p style={{ margin: "5px 0", fontSize: "14px", color: "#555" }}>
                      {p.description}
                    </p>
                  )}
                  <p style={{ margin: "5px 0", fontSize: "14px" }}>
                    <strong>Business:</strong> {businessName}
                  </p>
                  <p
                    style={{
                      marginTop: "10px",
                      color: "#3498db",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    Click to Book →
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ⬇ Footer */}
      <Footer />
    </div>
  );
};

export default AllProducts;
