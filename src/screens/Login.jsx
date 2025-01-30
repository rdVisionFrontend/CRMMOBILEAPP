import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, Image, ActivityIndicator, TouchableOpacity, ImageBackground } from 'react-native';
import { Toast } from 'toastify-react-native';
import MainScreen from './MainScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomePage from '../../WelcomePage';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../Redux/features/crmSlice';
import apiInstance from '../../api';


const Login = ({ navigation }) => {
  const [email, setEmail] = useState('rajanprajapati743@gmail.com');
  const [password, setPassword] = useState('9795189922');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [reqOtpForm, setRequestOtpForm] = useState(true);
  const [resendOtp, setResendOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null)
  const {jwtToken} = useSelector((state)=>state.crmUser)
  const dispatch = useDispatch()


  useEffect(() => {
    fetchToken()
  },[token,jwtToken])
  const fetchToken = async () => {
    const token = await AsyncStorage.getItem('jwtToken');
    setToken(token)
    if (token) {
      navigation.navigate('login');
    }
  }



  const handleRequestOtp = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    apiInstance.post(`/auth/generateOtp`, { email, password })
      .then((response) => {
        console.log('OTP generated:', response.data);
        Alert.alert(response.data)
        // Toast.success(response.data);
        setOtpSent(true);
        setRequestOtpForm(false);
        setResendOtp(true);
      })
      .catch((error) => {
        console.log('Error:', error);
        Alert.alert("OTP Generation Failed")
        Toast.error('OTP Generation Failed');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFinalLogin = async () => {
    setLoading(true);
    try {
      // Send login request
      const response = await apiInstance.post(`/auth/login`, { email, password, logInOtp: otp });
      console.log('OTP verified:', response);
  
      // Navigate and show success message
      navigation.navigate('Profile');
      Toast.success('Login successful');
  
      // Destructure the response data
      const { jwtToken, refreshToken, user } = response.data;
  
      // Dispatch user data to redux store
      dispatch(setUser({ jwtToken, refreshToken, user }));
  
      // Store data in AsyncStorage
      await AsyncStorage.setItem('jwtToken', jwtToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      // Handle errors
      console.log('Error:', error);
      Toast.error('OTP Verification Failed');
      setOtp(''); // Reset OTP input
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };
  

  return (
    <>
          {
            token ? (
              <WelcomePage/>
            ): (
              <ImageBackground
            source = {{ uri: 'https://img.freepik.com/free-photo/3d-vertical-background-with-abstract-style_23-2150641317.jpg?ga=GA1.1.59646563.1734164377&semt=ais_hybrid' }} // Replace with your image URL or local image file
          style={styles.container}
          >
          <View style={styles.overlay}>

            {/* Login Icon */}
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/128/295/295128.png' }}
              style={styles.icon}
            />

            {/* Email and Password Input */}
            {reqOtpForm && (
              <View style={{ padding: 10 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TouchableOpacity
                  style={styles.otpBtn}
                  onPress={handleRequestOtp}
                  disabled={loading}
                >
                  <Text style={{ textAlign: 'center', color: "#fff", fontSize: 16 }}>
                    {loading ? 'Requesting...' : 'Request OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* OTP Input */}
            {otpSent && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter OTP"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                />
                <TouchableOpacity
                  style={styles.otpBtn}
                  onPress={handleFinalLogin}
                  disabled={loading}
                >
                  <Text style={{ textAlign: 'center', color: "#fff", fontSize: 16 }}>{loading ? 'Wait...' : 'Login'}</Text>
                </TouchableOpacity >
              </View>
            )}

            {/* Resend OTP */}
            {resendOtp && (
              <Text
                onPress={handleRequestOtp}
                style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}
              >
                Resend OTP
              </Text>
            )}
          </View>
        </ImageBackground >
        )
      }
    </>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 18,
    borderRadius: 5
  },
  otpBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#8338ec',
    textAlign: 'center'
  },
  loading: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  icon: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
  },
});