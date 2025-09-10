import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('Sending register request:', form);

      const res = await API.post('/api/users/register', form);
      console.log('Register response:', res.data);

      if (res.data.token) {
        // If backend returns a token after registration
        localStorage.setItem('token', res.data.token);
        setMessage('Registration successful ✅');
        navigate('/dashboard'); // auto-login and go to dashboard
      } else {
        setMessage(res.data.message || 'Registered successfully, please log in.');
        navigate('/login'); // fallback: redirect to login
      }
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Registration failed ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: 'white', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && (
        <p style={{ marginTop: '15px', color: message.toLowerCase().includes('successful') ? 'green' : 'red', textAlign: 'center' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Register;
