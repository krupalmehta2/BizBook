import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const AllServices = () => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await axios.get('/api/business');
        setBusinesses(res.data);
      } catch (err) {
        console.error('Error fetching businesses:', err);
      }
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (!selectedBusiness) {
      setServices([]);
      return;
    }
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/api/service?businessId=${selectedBusiness}`);
        setServices(res.data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [selectedBusiness]);

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceClick = (service) => {
    const business = service.businessId;
    if (!business) return;

    if (business.type === 'table') {
      navigate(`/table-booking/${business._id}`);
    } else {
      navigate(`/service-booking/${business._id}`, { state: { serviceId: service._id } });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2>All Services</h2>

      <select
        value={selectedBusiness}
        onChange={(e) => setSelectedBusiness(e.target.value)}
        style={{ padding: '10px', marginBottom: '15px', borderRadius: '6px' }}
      >
        <option value="">-- Select Business --</option>
        {businesses.map(b => (
          <option key={b._id} value={b._id}>{b.name}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search services..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '10px', marginLeft: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
      />

      {selectedBusiness && (
        <button
          onClick={() => setSelectedBusiness(selectedBusiness)}
          style={{ marginLeft: '10px', padding: '10px 15px', borderRadius: '6px', border: 'none', backgroundColor: '#3498db', color: '#fff', cursor: 'pointer' }}
        >
          Refresh
        </button>
      )}

      {loading && <p>Loading services...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '20px' }}>
        {filteredServices.length === 0 && !loading ? (
          <p>No services found.</p>
        ) : (
          filteredServices.map(s => (
            <div
              key={s._id}
              onClick={() => handleServiceClick(s)}
              style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#f9f9f9', cursor: 'pointer' }}
            >
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <p>Price: ₹{s.price || 0}</p>
              <p><strong>Business:</strong> {s.businessId?.name || 'Unknown'}</p>
              <p style={{ color: '#2ecc71', fontWeight: 'bold' }}>Click to Book</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllServices;
