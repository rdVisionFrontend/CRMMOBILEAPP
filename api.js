import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const API_BASE_URL = 'https://uatbackend.rdvision.tech';

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Optional timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add a request interceptor
apiInstance.interceptors.request.use(
  async (config) => {
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiInstance;
