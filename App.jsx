import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Navigation from './Navigation';
import Login from './src/screens/Login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './src/Authorization/AuthContext';

const App = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const {isAuthenticated} = useAuth()
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwtToken');
        console.log('App Token:', storedToken);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      } finally {
        setLoading(false); // Stop loading after token check
      }
    };
    checkLoginStatus();
  }, [isAuthenticated]);
  return (
    <>
      <View style={styles.container}>{token ? <Navigation /> : <Login />}</View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1
  },
});

export default App;
