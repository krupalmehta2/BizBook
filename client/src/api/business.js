import API from './axios';

// Get all businesses
export const getAllBusinesses = async () => {
  const res = await API.get('/api/business');
  return res.data;
};

// Get one business by ID
export const getBusinessById = async (id) => {
  const res = await API.get(`/api/business/${id}`);
  return res.data;
};

// Create a new business
export const createBusiness = async (data) => {
  const res = await API.post('/api/business', data);
  return res.data;
};
