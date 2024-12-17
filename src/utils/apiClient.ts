import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://sandbox.safaricom.co.ke',
  timeout: 5000,
});

export default apiClient;
