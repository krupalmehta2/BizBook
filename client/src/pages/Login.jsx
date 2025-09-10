import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        email: form.email.trim(),
        password: form.password.trim(),
      };
      console.log('Sending login request to backend with:', payload);

      const res = await API.post('/api/users/login', payload);
      console.log('Backend response:', res.data);

      if (res.data.token) {
        // 🟢 clear any old session data before saving new
        localStorage.clear();

        localStorage.setItem('token', res.data.token);

        // optionally save user info if backend sends it
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        setMessage('Login successful ✅');
        navigate('/dashboard'); // redirect to dashboard
      } else {
        const errorMsg =
          res.data.message || 'Login failed: No token returned';
        setMessage(errorMsg);
        console.warn(errorMsg);
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Login failed ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Navigation to Register */}
      <p
        style={{
          marginTop: '15px',
          textAlign: 'center',
          fontSize: '14px',
        }}
      >
        Don’t have an account?{' '}
        <Link to="/register" style={{ color: '#007bff' }}>
          Register here
        </Link>
      </p>

      {message && (
        <p
          style={{
            marginTop: '15px',
            color: message.toLowerCase().includes('successful')
              ? 'green'
              : 'red',
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Login;
