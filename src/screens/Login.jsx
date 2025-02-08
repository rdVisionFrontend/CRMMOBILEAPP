import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,

} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import apiInstance from '../../api';
import {useAuth} from '../Authorization/AuthContext';


const Login = ({navigation}) => {
  const [email, setEmail] = useState('rajanprajapati743@gmail.com');
  const [password, setPassword] = useState('9795189922');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [reqOtpForm, setRequestOtpForm] = useState(true);
  const [resendOtp, setResendOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const {setIsAuthenticated} = useAuth();

 
  

  const handleRequestOtp = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);
    apiInstance
      .post(`/auth/generateOtp`, { email, password })
      .then(response => {
        console.log('OTP generated:', response.data);
        // Extract the message from the response
        const message = response.data.message || 'OTP sent successfully';
        Alert.alert('Success', message); // Pass the message as a string
        setOtpSent(true);
        setRequestOtpForm(false);
        setResendOtp(true);
      })
      .catch(error => {
        console.log('Error:', error);
        Alert.alert('Error', 'OTP Generation Failed'); // Provide a fallback message
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFinalLogin = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.post(`/auth/login`, {
        email,
        password,
        logInOtp: otp,
      });
      console.log('OTP verified:', response);    
      setIsAuthenticated(true);   
      await AsyncStorage.setItem('jwtToken', response.data.jwtToken);   
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      const sessionDuration = 60 * 60; // 1 hour in seconds
      await AsyncStorage.setItem(
        'sessionDuration',
        JSON.stringify(sessionDuration),
      );
      console.log('Session duration set:', sessionDuration);
    } catch (error) {
      console.log('Error:', error);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>    
        <View style={styles.container}>
          <Text style={styles.LoginText}>
            {otpSent ? 'Verify Otp' : 'Login'}
          </Text>
          <View style={styles.circle}></View>
          <View style={styles.circle2}></View>

          <View style={styles.overlay}>
            {/* Login Icon */}

            {/* Email and Password Input */}
            {reqOtpForm && (
              <View style={{padding: 10}}>
                <View style={styles.emailContainer}>
                  {/* Email Icon */}
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/646/646094.png',
                    }}
                    style={styles.emailIcon}
                  />
                  {/* Email Input */}
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.passwordContainer}>
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/2889/2889676.png',
                    }}
                    style={styles.PasswordIcon}
                  />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword} // Toggle secureTextEntry
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Image
                      source={
                        showPassword
                          ? {
                              uri: 'https://cdn-icons-png.flaticon.com/128/709/709612.png',
                            }
                          : {
                              uri: 'https://cdn-icons-png.flaticon.com/128/2767/2767146.png',
                            }
                      }
                      style={{height: 20, width: 20}}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.otpBtn}
                  onPress={handleRequestOtp}
                  disabled={loading}>
                  <Text
                    style={{textAlign: 'center', color: '#fff', fontSize: 20, fontWeight:600}}>
                    {loading ? 'Requesting...' : 'Request OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* OTP Input */}
            {otpSent && (
              <View style={{position: 'relative'}}>
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/159/159478.png',
                  }}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '20%',
                    transform: [{translateY: -10}],
                    width: 20,
                    height: 20,
                    zIndex: 20,
                  }}
                />
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
                  disabled={loading}>
                  <Text
                    style={{textAlign: 'center', color: '#fff', fontSize: 20, fontWeight:600}}>
                    {loading ? 'Wait...' : 'Login'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Resend OTP */}
            {resendOtp && (
              <Text
                onPress={handleRequestOtp}
                style={{color: '#1d3557', textAlign: 'center', marginTop: 20}}>
                Resend OTP
              </Text>
            )}
          </View>
        </View>
   
    </>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#DAE4E8',
    position: 'relative',
  },
  overlay: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    backdropFilter: 'blur(10px)',
    borderRadius: 15,
    paddingVertical: 50,
  },
  emailContainer: {
    position: 'relative',
    width: '100%',
  },
  LoginText: {
    position: 'absolute',
    top: 50,
    left: 60,
    zIndex: 10,
    fontSize: 35,
    fontWeight: 600,
    color: '#fff',
  },
  circle: {
    width: 600,
    height: 600,
    backgroundColor: '#0088FF',
    borderRadius: 600,
    position: 'absolute',
    top: -420,
    left: -160,
    zIndex: 5,
  },
  circle2: {
    width: 600,
    height: 600,
    backgroundColor: '#0088FF',
    borderRadius: 600,
    position: 'absolute',
    bottom: -430,
    right: -152,
  },
  emailIcon: {
    position: 'absolute',
    left: 10,
    top: '40%',
    transform: [{translateY: -10}], // Center vertically
    width: 20,
    height: 20,
    zIndex: 20,
  },
  PasswordIcon: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: [{translateY: -10}], // Center vertically
    width: 20,
    height: 20,
    zIndex: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 40, // Space for the icon
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 18,
    borderRadius: 40,
    color: '#415a77',
    paddingHorizontal: 5,
    paddingVertical:10, 
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 40,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingLeft: 10,
    fontSize: 18,
    color: '#415a77',
    paddingHorizontal: 5,
    marginLeft: 40,
    shadowColor: '#000',
   
  },
  eyeIcon: {
    padding: 10,
  },
  otpBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#0088FF',
    textAlign: 'center',
    borderRadius: 40,
  },
  icon: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
