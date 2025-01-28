import { StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './src/Redux/features/crmSlice';
import Login from './src/screens/Login';

const WelcomePage = ({ navigation }) => {

  const [login, setLogin] = useState(true)
  const [loginPage, setLoginPage] = useState(false)
  const [welPage, setWelPage] = useState(true)
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.crmUser)

  useEffect(() => {
    console.log('Welcome Page' , user);
  }, [user,navigation]);

  const handleLogout = () => {
    dispatch(logout())
      .then(() => {
        console.log('Logout successful');
        setLogin(false)
        navigation.replace('Login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  const handleLogin = () => {
    setLoginPage(true)
    setWelPage(false)
  }



  return (
    <>
      {welPage && <ImageBackground
        source={{ uri: 'https://img.freepik.com/free-photo/abstract-gradient-colorful-background_23-2149025199.jpg?size=626&ext=jpg' }}
        style={styles.container}
      >
        <View style={styles.overlay}>
          {/* Logo or Icon */}
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3003/3003897.png' }}
            style={styles.logo}
          />

          {/* Welcome Text */}

          <Text></Text>
          <Text style={styles.title}>Welcome to Our App!</Text>
          <Text style={styles.subtitle}>Your journey starts here. Let’s get started!</Text>

          {/* Buttons */}
          {
            login ?
              <TouchableOpacity onPress={handleLogout} style={styles.button}>
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
              :

              <TouchableOpacity onPress={handleLogin} style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
          }
        </View>
      </ImageBackground>}

      {loginPage && <Login />}


    </>
  );
};

export default WelcomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});