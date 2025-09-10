import {
  Calendar,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Twitter,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";
import DefaultLogo from "../assets/logo.png"; // 👈 import default logo

const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking/order form states
  const [note, setNote] = useState("");
  const [itemId, setItemId] = useState("");
  const [tableCount, setTableCount] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryContact, setDeliveryContact] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchBusiness = async () => {
      try {
        const res = await API.get(`/api/business/${id}`);
        setBusiness(res.data);

        if (res.data.type === "order") {
          const prodRes = await API.get(
            `/api/products?businessId=${id}&type=product`
          );
          setItems(prodRes.data || []);
        } else if (
          res.data.type === "appointment" ||
          res.data.type === "table"
        ) {
          try {
            const servRes = await API.get(`/api/services?businessId=${id}`);
            if (servRes.data.length > 0) {
              setItems(servRes.data);
            } else {
              const prodRes = await API.get(
                `/api/products?businessId=${id}&type=service`
              );
              setItems(prodRes.data || []);
            }
          } catch (err) {
            console.error("Error fetching services:", err);
            toast.error("Failed to load services");
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to load business details");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  const handleBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    if (!business) return;

    // Validation
    if (
      (business.type === "appointment" ||
        business.type === "order" ||
        business.type === "table") &&
      !itemId &&
      business.type !== "table"
    ) {
      return toast.warn(
        `Please select a ${
          business.type === "order" ? "product" : "service"
        } before booking`
      );
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

    if (
      business.type === "order" &&
      (!deliveryAddress || !deliveryContact)
    ) {
      return toast.warn("Enter delivery details");
    }

    const payload = {
      businessId: id,
      type: business.type,
      note: note || undefined,
      productId: business.type === "order" ? itemId : undefined,
      serviceId:
        business.type === "appointment" || business.type === "table"
          ? itemId
          : undefined,
      tableCount:
        business.type === "table" ? Number(tableCount) : undefined,
      bookingDate:
        business.type === "appointment" || business.type === "table"
          ? bookingDate
          : undefined,
      bookingTime:
        business.type === "appointment" || business.type === "table"
          ? bookingTime
          : undefined,
      deliveryAddress:
        business.type === "order" ? deliveryAddress : undefined,
      deliveryContact:
        business.type === "order" ? deliveryContact : undefined,
    };

    try {
      await API.post("/api/bookings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Booking successful!");
      navigate("/my-bookings");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Booking failed!");
    }
  };

  if (loading) return <p className="loading">Loading business details...</p>;
  if (!business) return <p className="loading">Business not found</p>;

  return (
    <div className="business-container">
      {/* Header */}
      <div className="business-header">
        <img
          src={
            business.logoUrl && business.logoUrl.trim() !== ""
              ? business.logoUrl
              : DefaultLogo // 👈 fallback logo
          }
          alt="Logo"
          className="business-logo"
        />
        <div className="business-header-info">
          <h1>{business.name}</h1>
          <p className="category">{business.category}</p>
          <span className="type-tag">{business.type.toUpperCase()}</span>
        </div>
      </div>

      {/* Info */}
      <div className="business-info">
        {business.description && (
          <p className="desc">{business.description}</p>
        )}
        <div className="info-grid">
          <div className="info-item">
            <MapPin size={18} className="icon" />
            <span>
              {business.address}, {business.city}, {business.state}{" "}
              {business.zipCode}
            </span>
          </div>
          <div className="info-item">
            <Phone size={18} className="icon" />
            <a href={`tel:${business.contact}`} className="link">
              {business.contact || "N/A"}
            </a>
          </div>
          <div className="info-item">
            <Mail size={18} className="icon" />
            <a href={`mailto:${business.email}`} className="link">
              {business.email || "N/A"}
            </a>
          </div>
          {business.website && (
            <div className="info-item">
              <Globe size={18} className="icon" />
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                {business.website}
              </a>
            </div>
          )}
          <div className="info-item">
            <Clock size={18} className="icon" />
            <span>{business.openingHours || "Not available"}</span>
          </div>
          {business.type === "table" && (
            <div className="info-item">
              <UtensilsCrossed size={18} className="icon" />
              <span>Total Tables: {business.totalTables}</span>
            </div>
          )}
        </div>
        {/* Socials */}
        {(business.socialLinks?.facebook ||
          business.socialLinks?.instagram ||
          business.socialLinks?.twitter ||
          business.socialLinks?.linkedin) && (
          <div className="social-links">
            {business.socialLinks.facebook && (
              <a
                href={business.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook />
              </a>
            )}
            {business.socialLinks.instagram && (
              <a
                href={business.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram />
              </a>
            )}
            {business.socialLinks.twitter && (
              <a
                href={business.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter />
              </a>
            )}
            {business.socialLinks.linkedin && (
              <a
                href={business.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div className="card">
          <h2>
            {business.type === "order"
              ? "Available Products"
              : "Available Services"}
          </h2>
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
                {i.name} - ₹{i.price}{" "}
                {i.duration ? `(${i.duration})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Booking/Order Form */}
      {(business.type === "appointment" || business.type === "table") && (
        <div className="card">
          {business.type === "table" && (
            <div className="form-group">
              <label>Table Count</label>
              <input
                type="number"
                min={1}
                value={tableCount}
                onChange={(e) => setTableCount(Number(e.target.value))}
                className="input-field"
              />
            </div>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label>Booking Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Booking Time</label>
              <input
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {business.type === "order" && (
        <div className="card">
          <div className="form-group">
            <label>Delivery Address</label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label>Delivery Contact</label>
            <input
              type="text"
              value={deliveryContact}
              onChange={(e) => setDeliveryContact(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      )}

      {/* Note */}
      <div className="card">
        <div className="form-group">
          <label>Note (Optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Special instructions..."
            className="input-field"
          />
        </div>
      </div>

      {/* Action Button */}
      <button onClick={handleBooking} className="booking-btn">
        {business.type === "appointment" ? (
          <Calendar size={18} />
        ) : business.type === "order" ? (
          <ShoppingBag size={18} />
        ) : (
          <UtensilsCrossed size={18} />
        )}
        {business.type === "appointment"
          ? "Book Appointment"
          : business.type === "order"
          ? "Place Order"
          : "Reserve Table"}
      </button>

      {/* Styles */}
      <style jsx="true">{`
        .business-container {
          max-width: 900px;
          margin: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .business-header {
          display: flex;
          align-items: center;
          gap: 20px;
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .business-logo {
          width: 100px;
          height: 100px;
          border-radius: 12px;
          object-fit: cover;
        }
        .business-header-info h1 {
          margin: 0;
          font-size: 22px;
        }
        .category {
          font-size: 14px;
          color: #777;
        }
        .type-tag {
          background: #3498db;
          color: white;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
          margin-top: 6px;
        }
        .business-info {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .desc {
          margin-bottom: 15px;
          color: #555;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          color: #444;
        }
        .info-item .icon {
          color: #3498db;
        }
        .link {
          color: #2c3e50;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }
        .social-links {
          display: flex;
          gap: 15px;
          margin-top: 15px;
        }
        .social-links a {
          color: #666;
          transition: color 0.3s;
        }
        .social-links a:hover {
          color: #3498db;
        }
        .card {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .form-group {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 15px;
        }
        .input-field {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }
        textarea.input-field {
          min-height: 70px;
          resize: vertical;
        }
        .booking-btn {
          background: #3498db;
          color: white;
          font-size: 16px;
          padding: 14px 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          border: none;
          transition: background 0.3s;
        }
        .booking-btn:hover {
          background: #2980b9;
        }
        .loading {
          text-align: center;
          color: #7f8c8d;
          margin-top: 100px;
        }
      `}</style>
    </div>
  );
};

export default BusinessDetails;
