// src/features/products/productSlice.js
import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const crmSlice = createSlice({
  name: 'user',
  initialState: {
    userData: {}, // Store user details
    jwtToken: '', // Store JWT token
    refreshToken: '', // Store refresh token
    loading: false,
    status: '',
  },
  reducers: {
    // Add a reducer to update user data in the store
    setUser: (state, action) => {
      state.userData = action.payload.user;
      state.jwtToken = action.payload.jwtToken;
      state.refreshToken = action.payload.refreshToken;
    },
    // Add a reducer for logout
    clearUser: (state) => {
      state.userData = {};
      state.jwtToken = '';
      state.refreshToken = '';
    },
  },
});

export const { setUser, clearUser } = crmSlice.actions;

// Thunk for handling logout (with AsyncStorage)
export const logout = () => async (dispatch) => {
  try {
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('user');
    dispatch(clearUser()); // Clear Redux state
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};

export default crmSlice.reducer;