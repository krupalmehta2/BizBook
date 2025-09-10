import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]); // products/services
  const [loading, setLoading] = useState(true);

  const [note, setNote] = useState("");
  const [itemId, setItemId] = useState("");
  const [tableCount, setTableCount] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryContact, setDeliveryContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch business and products/services
  useEffect(() => {
    if (!id) return;

    const fetchBusinessData = async () => {
      try {
        const bizRes = await API.get(`/api/business/${id}`);
        setBusiness(bizRes.data);

        if (bizRes.data.type === "order") {
          const prodRes = await API.get(`/api/products?businessId=${id}`);
          setItems(prodRes.data || []);
        } else if (bizRes.data.type === "appointment") {
          const servRes = await API.get(`/api/services?businessId=${id}`);
          setItems(servRes.data || []);
        } else {
          setItems([]); // table booking doesn't need items
        }
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to load business details");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [id]);

  // Handle booking
  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    if (!business) return;

    // --- Validations ---
    if (business.type === "appointment" && !itemId) {
      return toast.warn("Please select a service before booking");
    }

    if (business.type === "order" && !itemId) {
      return toast.warn("Please select a product before placing an order");
    }

    if (
      (business.type === "appointment" || business.type === "table") &&
      (!bookingDate || !bookingTime)
    ) {
      return toast.warn("Select booking date & time");
    }

    if (business.type === "table" && (!tableCount || tableCount < 1)) {
      return toast.warn("Enter valid table count");
    }

    if (business.type === "order" && (!deliveryAddress || !deliveryContact)) {
      return toast.warn("Enter delivery details");
    }

    const payload = {
      businessId: id,
      type: business.type,
      note: note || undefined,
      productId: business.type === "order" ? itemId : undefined,
      serviceId: business.type === "appointment" ? itemId : undefined,
      tableCount: business.type === "table" ? Number(tableCount) : undefined,
      bookingDate:
        business.type === "appointment" || business.type === "table"
          ? bookingDate
          : undefined,
      bookingTime:
        business.type === "appointment" || business.type === "table"
          ? bookingTime
          : undefined,
      deliveryAddress: business.type === "order" ? deliveryAddress : undefined,
      deliveryContact: business.type === "order" ? deliveryContact : undefined,
    };

    try {
      setSubmitting(true);
      await API.post("/api/bookings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Booking successful!");
      navigate("/my-bookings");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Booking failed!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading">Loading business details...</p>;
  if (!business) return <p className="loading">Business not found</p>;

  const renderOpeningHours = (hours) => {
    if (!hours) return "N/A";
    if (typeof hours === "string") return hours;
    return Object.entries(hours).map(([day, { open, close }]) => (
      <div key={day}>
        <strong>{day}:</strong> {open} - {close}
      </div>
    ));
  };

  return (
    <div className="business-page">
      <div className="business-card">
        {business.logoUrl && (
          <img src={business.logoUrl} alt="Logo" className="business-logo" />
        )}
        <h2>{business.name}</h2>
        <p className="business-type">
          <strong>Type:</strong> {business.type}
        </p>

        <div className="business-info">
          <p><strong>Category:</strong> {business.category || "N/A"}</p>
          <p><strong>Contact:</strong> {business.contact || "N/A"}</p>
          <p><strong>Email:</strong> {business.email || "N/A"}</p>
          <p>
            <strong>Address:</strong>{" "}
            {[business.address, business.city, business.state, business.zipCode]
              .filter(Boolean)
              .join(", ") || "N/A"}
          </p>
          <p><strong>Opening Hours:</strong> {renderOpeningHours(business.openingHours)}</p>
        </div>

        {business.socialLinks && (
          <div className="social-links">
            {Object.entries(business.socialLinks).map(([key, link]) =>
              link ? (
                <p key={key}>
                  <strong>{key}:</strong>{" "}
                  <a href={link} target="_blank" rel="noreferrer">{link}</a>
                </p>
              ) : null
            )}
          </div>
        )}

        <p className="desc">{business.description || "No description."}</p>
        <hr />

        {/* Items Dropdown */}
        {items.length > 0 && (
          <div className="item-list">
            <h3>{business.type === "order" ? "Available Products" : "Available Services"}</h3>
            <ul>
              {items.map((item) => (
                <li key={item._id}>
                  <strong>{item.name}</strong> - ₹{item.price}
                </li>
              ))}
            </ul>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="input-field"
            >
              <option value="">
                -- Select {business.type === "order" ? "Product" : "Service"} --
              </option>
              {items.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name} - ₹{i.price}
                </option>
              ))}
            </select>
          </div>
        )}

        <hr />

        {/* Booking Inputs */}
        {(business.type === "appointment" || business.type === "table") && (
          <>
            {business.type === "table" && (
              <>
                <label>Table Count:</label>
                <input
                  type="number"
                  value={tableCount}
                  onChange={(e) => setTableCount(Number(e.target.value))}
                  min={1}
                  className="input-field"
                />
              </>
            )}
            <label>Booking Date:</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="input-field"
            />
            <label>Booking Time:</label>
            <input
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="input-field"
            />
          </>
        )}

        {business.type === "order" && (
          <>
            <label>Delivery Address:</label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="input-field"
            />
            <label>Delivery Contact:</label>
            <input
              type="text"
              value={deliveryContact}
              onChange={(e) => setDeliveryContact(e.target.value)}
              className="input-field"
            />
          </>
        )}

        {/* Note */}
        <label>Note:</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note..."
          className="input-field note-field"
        />

        {/* Booking Button */}
        <button
          onClick={handleBooking}
          className="booking-btn"
          disabled={submitting}
        >
          {submitting
            ? "Processing..."
            : business.type === "appointment"
            ? "Book Appointment"
            : business.type === "order"
            ? "Place Order"
            : "Reserve Table"}
        </button>
      </div>

      <style jsx="true">{`
        .business-page {
          font-family: "Segoe UI", sans-serif;
          background: #f9f9f9;
          min-height: 100vh;
          padding: 40px;
          display: flex;
          justify-content: center;
        }
        .business-card {
          background: #fff;
          padding: 30px;
          border-radius: 12px;
          width: 100%;
          max-width: 850px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-left: 5px solid #3498db;
        }
        .business-logo {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .business-info p,
        .social-links p {
          color: #555;
          margin: 4px 0;
          font-size: 15px;
        }
        .desc { margin-top: 15px; color: #777; }
        .item-list { margin: 20px 0; }
        .item-list ul { list-style: disc; padding-left: 20px; margin-bottom: 15px; }
        .input-field { width: 100%; padding: 12px; margin-bottom: 15px; font-size: 15px; border-radius: 8px; border: 1px solid #ccc; }
        .note-field { height: 80px; resize: none; }
        .booking-btn { background: #3498db; color: #fff; padding: 12px 24px; border-radius: 8px; font-size: 16px; border: none; cursor: pointer; margin-top: 20px; width: 100%; }
        .booking-btn:hover { background: #2980b9; }
        .booking-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        hr { margin: 25px 0; border: none; border-top: 1px solid #eee; }
        .loading { text-align: center; margin-top: 100px; color: #7f8c8d; font-size: 16px; }
      `}</style>
    </div>
  );
};

export default BusinessDetails;
