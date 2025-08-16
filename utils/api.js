import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API = axios.create({
  baseURL: 'http://192.168.18.106:3001/api',
});

// Log request config
API.interceptors.request.use(async config => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // 🌐 Log useful request details
  console.log('🔻 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.baseURL + config.url,
    headers: config.headers,
    data: config.data,
    params: config.params
  });

  return config;
});

export default API;