import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5100', // backend URL + port
  withCredentials: true,           // if your backend uses cookies
});

export default API;
