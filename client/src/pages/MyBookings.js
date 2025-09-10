import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";

/** ------------------------
 *  Helpers
 -------------------------*/
const getStatusStyle = (status) => {
  const map = {
    pending: { bg: "#fff3cd", color: "#856404" },
    done: { bg: "#d4edda", color: "#155724" },
    cancelled: { bg: "#f8d7da", color: "#721c24" },
  };
  return map[status] || map.pending;
};

const formatDateTime = (dt) => {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "N/A";
  }
};

/** ------------------------
 *  BookingCard Component
 -------------------------*/
const BookingCard = ({ booking, onCancel }) => {
  const status = booking?.status || "pending";
  const { bg, color } = getStatusStyle(status);
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  const business = booking?.businessId;

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div className="business-info">
          <Link to={`/business/${business?._id}`} className="business-name">
            {business?.name || "Unnamed Business"}
          </Link>
          {business?.category && (
            <span className="business-extra">· {business.category}</span>
          )}
          {business?.location && (
            <span className="business-extra">· {business.location}</span>
          )}
        </div>
        <span
          className="status"
          style={{ backgroundColor: bg, color }}
          title={`Booking is ${displayStatus}`}
        >
          {displayStatus}
        </span>
      </div>

      {/* Details */}
      <div className="card-body">
        <p>
          <strong>Type:</strong> {booking?.type || "N/A"}
        </p>
        {booking?.bookingDate && (
          <p>
            <strong>Date:</strong> {formatDateTime(booking.bookingDate)}
          </p>
        )}
        {booking?.bookingTime && (
          <p>
            <strong>Time:</strong> {booking.bookingTime}
          </p>
        )}
        {booking?.tableCount && (
          <p>
            <strong>Tables:</strong> {booking.tableCount}
          </p>
        )}
        {booking?.productId && (
          <p>
            <strong>Product:</strong> {booking.productId?.name} (₹
            {booking.productId?.price})
          </p>
        )}
        {booking?.serviceId && (
          <p>
            <strong>Service:</strong> {booking.serviceId?.name} (₹
            {booking.serviceId?.price})
          </p>
        )}
        {booking?.note && (
          <p>
            <strong>Note:</strong> {booking.note}
          </p>
        )}
        <p>
          <strong>Booked At:</strong> {formatDateTime(booking?.createdAt)}
        </p>
      </div>

      {/* Cancel button */}
      {status === "pending" && (
        <button className="cancel-btn" onClick={() => onCancel(booking._id)}>
          ❌ Cancel Booking
        </button>
      )}
    </div>
  );
};

/** ------------------------
 *  Main Component
 -------------------------*/
const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch user bookings
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchBookings = async () => {
      try {
        const res = await API.get("/api/bookings/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.bookings || res.data || [];
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("❌ Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  // Cancel booking
  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await API.patch(
        `/api/bookings/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
        );
        toast.success(response.data.message || "✅ Booking cancelled!");
      } else {
        toast.error(response.data.message || "❌ Failed to cancel booking.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Failed to cancel booking.");
    }
  };

  /** ------------------------
   *  Render
   -------------------------*/
  if (loading) return <p className="loading">Loading bookings...</p>;
  if (error) return <p className="error">{error}</p>;
  if (bookings.length === 0)
    return <p className="loading">No bookings found.</p>;

  return (
    <div className="mybookings">
      <div className="container">
        <h2>📋 My Bookings</h2>

        <div className="grid">
          {bookings.map((b) => (
            <BookingCard key={b._id} booking={b} onCancel={cancelBooking} />
          ))}
        </div>
      </div>

      <style jsx="true">{`
        .mybookings {
          background: #f9fafb;
          min-height: 100vh;
          padding: 40px 20px;
          font-family: "Segoe UI", sans-serif;
        }
        .container {
          max-width: 1100px;
          margin: auto;
        }
        h2 {
          text-align: center;
          margin-bottom: 30px;
          color: #2c3e50;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 25px;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-4px);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .business-info {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }
        .business-name {
          font-weight: bold;
          font-size: 16px;
          color: #2c3e50;
          text-decoration: none;
        }
        .business-name:hover {
          text-decoration: underline;
        }
        .business-extra {
          font-size: 13px;
          color: #777;
        }
        .status {
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: bold;
        }
        .card-body p {
          margin: 6px 0;
          font-size: 14px;
          color: #333;
        }
        .cancel-btn {
          background: #e74c3c;
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 15px;
          transition: background 0.3s;
        }
        .cancel-btn:hover {
          background: #c0392b;
        }
        .loading,
        .error {
          text-align: center;
          margin-top: 100px;
          font-size: 16px;
        }
        .error {
          color: red;
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
