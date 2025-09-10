import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AllProducts from './pages/AllProducts'; // ✅ NEW
import AllServices from './pages/AllServices'; // ✅ NEW
import AllTableBookings from './pages/AllTableBookings';
import BusinessDetails from './pages/BusinessDetails';
import BusinessList from './pages/BusinessList';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import Register from './pages/Register';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/business" element={<BusinessList />} />
        <Route path="/business/:id" element={<BusinessDetails />} />
        <Route path="/products" element={<AllProducts />} /> {/* ✅ New */}
        <Route path="/services" element={<AllServices />} /> {/* ✅ New */}
        <Route path="/tables" element={<AllTableBookings />} />
        

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
