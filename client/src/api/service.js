import API from './axios';

// Get all services for a specific business
export const getServicesByBusiness = async (businessId) => {
  const res = await API.get(`/api/services?businessId=${businessId}`);
  return res.data;
};
