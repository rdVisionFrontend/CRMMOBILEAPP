import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './src/sidecreens/Profile';
import Ticket from './src/screens/Ticket';
import In_Nagociation from './src/screens/nagotiation/In_Nagociation';
import Invoice from './src/screens/invoice/Invoice';
import TodaySalesRepost from './src/screens/todaySales/TodaySalesRepost';
import AbcTicket from './src/screens/ABC/AbcTicket';
import InvoiceInfo from './src/screens/ASS/InvoiceInfo';
import ProductInfo from './src/screens/MIS_PRODUCT/ProductInfo';
import Note from './src/screens/Note';
import Clock from './src/screens/Clock';
import Login from './src/screens/Login';
import { useAuth } from './src/Authorization/AuthContext';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const openGmail = () => {
  if (Platform.OS === 'android') {
    Linking.openURL('googlegmail://compose').catch(() =>
      Linking.openURL('mailto:'),
    );
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
        backgroundColor: '#fffcf2',
      },
    }}>
    <Drawer.Screen
      name="Ticket"
      component={Ticket}
      options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#b1a7a6',
        },
        headerTintColor: '#0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/432/432312.png',
            }}
            style={{
              width: size,
              height: size,
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
          backgroundColor: '#b1a7a6',
        },
        headerTintColor: '0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/1006/1006657.png',
            }}
            style={{
              width: size,
              height: size,
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
          backgroundColor: '#b1a7a6',
        },
        headerTintColor: '0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/11052/11052937.png',
            }}
            style={{
              width: size,
              height: size,
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
          backgroundColor: '#b1a7a6',
        },
        headerTintColor: '0b2545',
        drawerIcon: ({ focused, size }) => (
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/16859/16859716.png',
            }}
            style={{
              width: size,
              height: size,
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
          backgroundColor: '#b1a7a6',
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
          backgroundColor: '#b1a7a6',
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
          backgroundColor: '#b1a7a6',
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
);

const LoginNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      console.log('Navigation Token', token);
      setToken(token);
    };
    fetchToken();
  }, []);

  return (
    <NavigationContainer>
      
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconUrl;
              if (route.name === 'Login') {
                iconUrl =
                  'https://cdn-icons-png.flaticon.com/128/8323/8323511.png';
              } else if (route.name === 'Dashboard') {
                iconUrl =
                  'https://cdn-icons-png.flaticon.com/128/9070/9070895.png';
              } else if (route.name === 'Ticket') {
                iconUrl =
                  'https://cdn-icons-png.flaticon.com/128/389/389801.png';
              } else if (route.name === 'Logout') {
                iconUrl =
                  'https://cdn-icons-png.flaticon.com/128/1077/1077114.png';
              } else if (route.name === 'Note') {
                iconUrl = 'https://img.icons8.com/?size=50&id=25591&format=png';
              } else if (route.name === 'Clock') {
                iconUrl = 'https://img.icons8.com/?size=50&id=423&format=png';
              } else {
                iconUrl =
                  'https://cdn-icons-png.flaticon.com/128/1077/1077114.png';
              }

              return (
                <Image
                  source={{ uri: iconUrl }}
                  style={{ width: size, height: size, tintColor: color }}
                />
              );
            },
            tabBarActiveTintColor: '#097bff',
            tabBarInactiveTintColor: '#2b2d42',
            tabBarStyle: {
              backgroundColor: '#fff',
              height: 55,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              borderTopWidth: 2,
              shadowColor: 'transparent',
              elevation: 0,
            },
          })}>
          <Tab.Screen
            name="Dashboard"
            component={ProfileScreen}
            options={{
              headerShown: false,
              tabBarLabelStyle: { fontSize: 12, fontWeight: 300 },
            }}
          />
          <Tab.Screen
            name="Ticket"
            component={DrawerNavigator}
            options={{
              headerShown: false,
              tabBarLabelStyle: { fontSize: 12, fontWeight: 300 },
            }}
          />
          <Tab.Screen
            name="Note"
            component={Note}
            options={{
              headerShown: false,
              tabBarLabelStyle: { fontSize: 12, fontWeight: 300 },
            }}
          />
          <Tab.Screen
            name="Clock"
            component={Clock}
            options={{
              headerShown: false,
              tabBarLabelStyle: { fontSize: 12, fontWeight: 300 },
            }}
          />
        </Tab.Navigator>
      )
    </NavigationContainer>
  );
};

export default Navigation;