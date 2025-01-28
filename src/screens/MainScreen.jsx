import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Homescreen from '../sidecreens/Profile';
import Ticket from './Ticket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const MainScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwtToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      Toast.success('Logout Successful');
      navigation.replace('Splash');
    } catch (error) {
      console.log("Logout failed", error);
    }
  };

  return (
    <>
      <Drawer.Navigator>
        {/* Home Screen with Image Icon */}
        <Drawer.Screen
          name="Home"
          component={Homescreen}
          options={{
            headerShown: true,
            drawerIcon: ({ focused, size }) => (
              <Image
                source={{
                  uri: focused
                    ? 'https://cdn-icons-png.flaticon.com/128/609/609803.png'
                    : 'https://cdn-icons-png.flaticon.com/128/609/609804.png',
                }}
                style={{ width: 20, height: 20 }}
              />
            ),
            headerRight: () => (
              <TouchableOpacity onPress={handleLogout} style={{ paddingRight: 20 }}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/128/4436/4436954.png' }}
                  style={{ width: 25, height: 25 }}
                />
              </TouchableOpacity>
            ),
          }}
        />
        {/* Ticket Screen */}
        <Drawer.Screen
          name="Ticket"
          component={Ticket}
          options={{
            headerShown: true,
            drawerIcon: ({ focused, size }) => (
              <Image
                source={{
                  uri: focused
                    ? 'https://cdn-icons-png.flaticon.com/128/432/432312.png'
                    : 'https://cdn-icons-png.flaticon.com/128/432/432313.png',
                }}
                style={{ width: 20, height: 20 }}
              />
            ),
          }}
        /> 
        
      </Drawer.Navigator>
      

    </>
  );
};

export default MainScreen;