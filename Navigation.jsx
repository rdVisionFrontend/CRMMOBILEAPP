import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, AsyncStorage, Image} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Login from './src/screens/Login';
import ProfileScreen from './src/sidecreens/Profile';
import Ticket from './src/screens/Ticket';
import {useSelector} from 'react-redux';
import In_Nagociation from './src/screens/nagotiation/In_Nagociation';
import EmailModal from './src/screens/nagotiation/EmailModal';
import Invoice from './src/screens/invoice/Invoice';
import TodaySalesRepost from './src/screens/todaySales/TodaySalesRepost';
import AbcTicket from './src/screens/ABC/AbcTicket';
import InvoiceInfo from './src/screens/ASS/InvoiceInfo';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{
      drawerType: 'front',
      drawerStyle: {
        width: '60%',
        backgroundColor: '#fffcf2', // Set your desired background color here
      },
    }}>
    <Drawer.Screen
      name="Ticket"
      component={Ticket}
      options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b1a7a6', // Change header background color
        },
        headerTintColor: '0b2545', // Optional: Change text color in header
      }}
    />
    <Drawer.Screen
      name="In-Nagociation"
      component={In_Nagociation}
      options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b1a7a6', // Change header background color
        },
        headerTintColor: '0b2545', // Optional: Change text color in header
      }}
    />

    <Drawer.Screen
      name="Invoice"
      component={Invoice}
      options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b1a7a6', // Change header background color
        },
        headerTintColor: '0b2545', // Optional: Change text color in header
      }}
    />

    <Drawer.Screen
      name="Today Sales"
      component={TodaySalesRepost}
      options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b1a7a6', // Change header background color
        },
        headerTintColor: '0b2545', // Optional: Change text color in header
      }}
    />
    <Drawer.Screen
      name="ABC"
      component={AbcTicket}
      options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b1a7a6', // Change header background color
        },
        headerTintColor: '0b2545', // Optional: Change text color in header
      }}
    />
    <Drawer.Screen
      name="ASS"
      component={InvoiceInfo}
      options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b1a7a6', // Change header background color
        },
        headerTintColor: '0b2545', // Optional: Change text color in header
      }}
    />

    
  </Drawer.Navigator>
);
// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [token, setToken] = useState(null);

  const {jwtToken} = useSelector(state => state.crmUser);

  useEffect(() => {
    FetchToken();
    console.log('get', isLoggedIn);
  }, [isLoggedIn, jwtToken]);

  // Check if token exists in local storage
  const FetchToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setToken(token);
      setIsLoggedIn(!!token); // Update state based on token existence
      console.log(token);
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({color, size}) => {
            let iconUrl;
            if (route.name === 'Login') {
              iconUrl =
                'https://cdn-icons-png.flaticon.com/128/1946/1946488.png'; // Login icon URL
            } else if (route.name === 'Profile') {
              iconUrl =
                'https://cdn-icons-png.flaticon.com/128/1077/1077063.png'; // Profile icon URL
            } else if (route.name === 'Ticket') {
              iconUrl = 'https://cdn-icons-png.flaticon.com/128/389/389801.png'; // Ticket icon URL
            } else if (route.name === 'Logout') {
              iconUrl =
                'https://cdn-icons-png.flaticon.com/128/9208/9208320.png'; // Logout icon URL (add your own if you need)
            }

            return (
              <Image
                source={{uri: iconUrl}}
                style={{width: size, height: size, tintColor: color}}
              />
            );
          },
          tabBarActiveTintColor: 'black', // Active icon color
          tabBarInactiveTintColor: 'red', // Inactive icon color
          tabBarStyle: {
            backgroundColor: '#ffffff', // Change navbar background color
            height: 60, // Adjust height if needed
          },
        })}>
        <Tab.Screen
          name={jwtToken ? 'Logout' : 'Login'}
          options={{headerShown: false}}
          component={Login}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{headerShown: false}}
        />
        {/* <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        headerShown: false,
                        tabBarButton: (props) => null, // This will disable the tab by not rendering the tab button
                    }}
                /> */}
        <Tab.Screen
          name="Ticket"
          component={DrawerNavigator}
          options={{headerShown: false}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;

// Styles
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
