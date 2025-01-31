import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  Image,
  Button,
  TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Login from './src/screens/Login';
import ProfileScreen from './src/sidecreens/Profile';
import Ticket from './src/screens/Ticket';
import { useSelector } from 'react-redux';
import In_Nagociation from './src/screens/nagotiation/In_Nagociation';
import EmailModal from './src/screens/nagotiation/EmailModal';
import Invoice from './src/screens/invoice/Invoice';
import TodaySalesRepost from './src/screens/todaySales/TodaySalesRepost';
import AbcTicket from './src/screens/ABC/AbcTicket';
import InvoiceInfo from './src/screens/ASS/InvoiceInfo';
import ProductInfo from './src/screens/MIS_PRODUCT/ProductInfo';
import { Linking, Platform } from 'react-native';
import { useAuth } from './src/Authorization/AuthContext';
import { createStackNavigator } from '@react-navigation/stack';

const Drawer = createDrawerNavigator();
const openGmail = () => {
  if (Platform.OS === 'android') {
    Linking.openURL('googlegmail://compose').catch(() =>
      Linking.openURL('mailto:'),
    ); // Fallback to default mail app
  } else {
    Linking.openURL('mailto:');
  }
};

const EmailScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <TouchableOpacity
      onPress={openGmail}
      style={{ borderWidth: 1, padding: 10, borderRadius: 2 }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
        }}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/128/5968/5968534.png',
          }}
          style={{ width: 20, height: 20 }}
        />
        <Text>OPEN GMAIL</Text>
      </View>
    </TouchableOpacity>
  </View>
);





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
        headerTintColor: '#0b2545', // Change text color in header
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/432/432312.png',
            }}
            style={{
              width: size, // Set the icon size
              height: size, // Set the icon size

            }}
          />
        ),
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
        headerTintColor: '0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/1006/1006657.png',
            }}
            style={{
              width: size, // Set the icon size
              height: size, // Set the icon size

            }}
          />
        ),
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
        headerTintColor: '0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/11052/11052937.png',
            }}
            style={{
              width: size, // Set the icon size
              height: size, // Set the icon size

            }}
          />
        ),
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
        headerTintColor: '0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/16859/16859716.png',
            }}
            style={{
              width: size, // Set the icon size
              height: size, // Set the icon size

            }}
          />
        ),
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
        headerTintColor: '0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/3031/3031708.png',
            }}
            style={{
              width: 20,
              height: 20,

            }}
          />
        ),
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
        headerTintColor: '0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/27/27130.png',
            }}
            style={{
              width: 20,
              height: 20,

            }}
          />
        ),
      }}
    />

    <Drawer.Screen
      name="Product Information"
      component={ProductInfo}
      options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b1a7a6', // Change header background color
        },
        headerTintColor: '0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/10608/10608943.png',
            }}
            style={{
              width: 20,
              height: 20,

            }}
          />
        ),
      }}
    />

    <Drawer.Screen
      name="Email"
      component={EmailScreen}
      options={{
        headerShown: true,
        headerStyle: { backgroundColor: '#b1a7a6' },
        headerTintColor: '#0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/5968/5968534.png',
            }}
            style={{
              width: 20,
              height: 20,

            }}
          />
        ),
      }}
    />
  </Drawer.Navigator>

  // Admin Login menu

);








// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [token, setToken] = useState(null);

  const { jwtToken } = useSelector(state => state.crmUser);

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
  const Stack = createStackNavigator();
  const { isAuthenticated, setIsAuthenticated } = useAuth()

  const LoginNavigator = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name='Login'
          component={Login}
          options={{headerShown:false}}
        />
      </Stack.Navigator>
    )
  }

  const {userData} = useSelector(state => state.crmUser);
console.log(userData)

  return (
    <NavigationContainer>
     {isAuthenticated? <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconUrl;
            if (route.name === 'Login') {
              iconUrl =
                'https://cdn-icons-png.flaticon.com/128/8323/8323511.png'; 
            } else if (route.name === 'Dashboard') {
              iconUrl =
                'https://cdn-icons-png.flaticon.com/128/1077/1077063.png'; 
            } else if (route.name === 'Ticket') {
              iconUrl = 'https://cdn-icons-png.flaticon.com/128/389/389801.png'; 
            } else if (route.name === 'Logout') {
              iconUrl =
                'https://cdn-icons-png.flaticon.com/128/9208/9208320.png'; 
            }
        
            return (
              <Image
                source={{ uri: iconUrl }}
                style={{ width: size, height: size, tintColor: color }}
              />
            );
          },
          tabBarActiveTintColor: 'black', 
          tabBarInactiveTintColor: 'red', 
          tabBarStyle: {
            backgroundColor: '#8d99ae',
            height: 60,
            borderTopLeftRadius: 20, // Apply top-left border radius
            borderTopRightRadius: 20, // Apply top-right border radius
            position: 'absolute', // Required to make border radius work
            left: 0,
            right: 0,
            bottom: 0,
           
          },
        })}
        >
        <Tab.Screen
          name={jwtToken ? 'Logout' : 'Login'}
          component={Login}
          options={{
            headerShown: false,
            tabBarLabelStyle: {
              fontSize: 16, // Increase the font size
              fontWeight: 300 // Optional: Make it bold

            },
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={ProfileScreen}
          options={{
            headerShown: false,
            tabBarLabelStyle: {
              fontSize: 16, // Increase the font size
              fontWeight: 300 // Optional: Make it bold

            },
          }}
        />

        <Tab.Screen
          name="Ticket"
          component={DrawerNavigator}
          options={{
            headerShown: false,
            tabBarLabelStyle: {
              fontSize: 16, // Increase the font size
              fontWeight: 300 // Optional: Make it bold

            },
          }}
        />
      </Tab.Navigator>:<LoginNavigator/>}
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
