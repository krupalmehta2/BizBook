import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';

const TableBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [tableCount, setTableCount] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [note, setNote] = useState('');

  // Fetch business details
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await API.get(`/business/${id}`);
        if (res.data.type !== 'table') {
          toast.error('❌ This business does not support table bookings');
          navigate('/');
          return;
        }
        setBusiness(res.data);
      } catch (err) {
        console.error('Failed to fetch business:', err);
        toast.error('❌ Failed to load business details');
      }
    };
    fetchBusiness();
  }, [id, navigate]);

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    if (!bookingDate) return toast.warn('Select booking date');
    if (!bookingTime) return toast.warn('Select booking time');
    if (!tableCount || tableCount <= 0) return toast.warn('Enter valid table count');

    const payload = {
      businessId: id,
      type: 'table',       // important for backend
      tableCount: Number(tableCount),
      bookingDate,
      bookingTime,
      note,
    };

    try {
      await API.post('/api/bookings', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Table booked successfully!');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Booking error:', err);
      toast.error(err.response?.data?.message || '❌ Booking failed!');
    }
  };

  if (!business) return <p style={{ textAlign: 'center', marginTop: '100px', color: '#7f8c8d' }}>Loading business details...</p>;

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh', padding: '40px' }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        borderLeft: '5px solid #3498db'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🍽️ Reserve Table at {business.name}</h2>

        <label>Table Count:</label>
        <input
          type="number"
          value={tableCount}
          min={1}
          onChange={e => setTableCount(Number(e.target.value))}
          style={inputStyle}
        />

        <label>Booking Date:</label>
        <input
          type="date"
          value={bookingDate}
          onChange={e => setBookingDate(e.target.value)}
          style={inputStyle}
        />

        <label>Booking Time:</label>
        <input
          type="time"
          value={bookingTime}
          onChange={e => setBookingTime(e.target.value)}
          style={inputStyle}
        />

        <label>Note (optional):</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          style={{ ...inputStyle, height: '80px', resize: 'none' }}
        />

        <button onClick={handleBooking} style={buttonStyle}>
          🍽️ Reserve Table
        </button>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  fontSize: '15px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
};

const buttonStyle = {
  marginTop: '20px',
  padding: '12px 24px',
  backgroundColor: '#3498db',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  cursor: 'pointer'
};

export default TableBooking;
