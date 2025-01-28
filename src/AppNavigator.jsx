import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './screens/Login';
import MainScreen from './screens/MainScreen';
import BottomTabNavigator from './screens/bottom/BottomTabNavigator'


const Stack = createStackNavigator();  

const AppNavigator = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Login'
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='MainScreen'
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>

    </NavigationContainer>
  );
}

export default AppNavigator;

const styles = StyleSheet.create({});