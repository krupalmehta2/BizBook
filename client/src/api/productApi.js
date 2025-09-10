import API from './axios';

export const getProductsByBusiness = async (businessId, type = '') => {
  const query = type ? `?businessId=${businessId}&type=${type}` : `?businessId=${businessId}`;
  const res = await API.get(`/products${query}`);
  return res.data;
};

