import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  AsyncStorage,
  Image,
  Button,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ProfileScreen from './src/sidecreens/Profile';
import Ticket from './src/screens/Ticket';
import {useSelector} from 'react-redux';
import In_Nagociation from './src/screens/nagotiation/In_Nagociation';
import EmailModal from './src/screens/nagotiation/EmailModal';
import Invoice from './src/screens/invoice/Invoice';
import TodaySalesRepost from './src/screens/todaySales/TodaySalesRepost';
import AbcTicket from './src/screens/ABC/AbcTicket';
import InvoiceInfo from './src/screens/ASS/InvoiceInfo';
import ProductInfo from './src/screens/MIS_PRODUCT/ProductInfo';
import {Linking, Platform} from 'react-native';
import {useAuth} from './src/Authorization/AuthContext';
import {createStackNavigator} from '@react-navigation/stack';
import Note from './src/screens/Note';
import Clock from './src/screens/Clock';
import Login from './src/screens/Login';

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
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <TouchableOpacity
      onPress={openGmail}
      style={{borderWidth: 1, padding: 10, borderRadius: 2}}>
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
          style={{width: 20, height: 20}}
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
        drawerIcon: ({focused, size}) => (
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
        drawerIcon: ({focused, size}) => (
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
        drawerIcon: ({focused, size}) => (
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
        drawerIcon: ({focused, size}) => (
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
        drawerIcon: ({focused, size}) => (
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
        drawerIcon: ({focused, size}) => (
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
        drawerIcon: ({focused, size}) => (
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
        headerStyle: {backgroundColor: '#b1a7a6'},
        headerTintColor: '#0b2545',
        drawerIcon: ({focused, size}) => (
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
  const {isAuthenticated, setIsAuthenticated} = useAuth();
  const [token,setToken] = useState(null)
  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      console.log("Navigation Tokn",token)
      setToken(token)
    };
  });

  const Stack = createStackNavigator();
  const LoginNavigator = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    );
  };

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({color, size}) => {
              let iconUrl;
              if (route.name === 'Login') {
                iconUrl =
                  'https://cdn-icons-png.flaticon.com/128/8323/8323511.png';
              } else if (route.name === 'Dashboard') {
                iconUrl =
                  'https://cdn-icons-png.flaticon.com/128/1828/1828765.png';
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
                iconUrl = userImage
                  ? userImage
                  : 'https://cdn-icons-png.flaticon.com/128/1077/1077114.png';
              }

              return (
                <Image
                  source={{
                    uri: iconUrl.startsWith('data:image') ? iconUrl : iconUrl,
                  }}
                  style={{width: size, height: size, tintColor: color}}
                />
              );
            },
            tabBarActiveTintColor: '#219ebc',
            tabBarInactiveTintColor: '#2b2d42',
            tabBarStyle: {
              backgroundColor: '#fdf0d5',
              height: 58,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
              position: 'absolute',
              borderWidth: 1,
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
              tabBarLabelStyle: {fontSize: 16, fontWeight: 300},
            }}
          />
          <Tab.Screen
            name="Ticket"
            component={DrawerNavigator}
            options={{
              headerShown: false,
              tabBarLabelStyle: {fontSize: 16, fontWeight: 300},
            }}
          />
          <Tab.Screen
            name="Note"
            component={Note}
            options={{
              headerShown: false,
              tabBarLabelStyle: {fontSize: 16, fontWeight: 300},
            }}
          />
          <Tab.Screen
            name="Clock"
            component={Clock}
            options={{
              headerShown: false,
              tabBarLabelStyle: {fontSize: 16, fontWeight: 300},
            }}
          />
        </Tab.Navigator>
      ) : (
        <LoginNavigator />
      )}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
});
