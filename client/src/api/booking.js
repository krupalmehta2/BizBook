import API from './axios';

export const getMyBookings = async (token) => {
  const res = await API.get('/api/bookings/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const cancelBooking = async (id, token) => {
  const res = await API.patch(`/api/bookings/${id}/status`, { status: 'cancelled' }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
