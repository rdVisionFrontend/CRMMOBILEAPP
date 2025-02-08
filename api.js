import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_BASE_URL = 'https://uatbackend.rdvision.tech';

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Optional timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Include cookies if required by API
});

// 📌 Add a request interceptor to include the token
apiInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      console.log("🔑 Retrieved Token from Storage:", token); 

      if (!token) {
        console.warn("⚠️ No Token Found in Storage! Authentication may fail.");
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('🚨 Error fetching token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 📌 Add a response interceptor to handle errors globally
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error("🚨 Network Error:", error.message);
      Alert.alert("Network error! Please check your internet connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    console.warn(`⚠️ API Error: ${status}`, data);

    if (status === 401) {
      console.warn("⏳ Token expired or invalid, logging out...");

      // Handle logout or token refresh logic
      await AsyncStorage.removeItem('jwtToken');
      Alert.alert("Session expired. Please log in again.");
    } else {
      Alert.alert(`Error: ${data.message || "Something went wrong!"}`);
    }

    return Promise.reject(error);
  }
);

export default apiInstance;
