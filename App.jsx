import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Navigation from './Navigation'
import AuthProvider from './src/Authorization/AuthContext'


const App = () => {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>)
}

export default App

const styles = StyleSheet.create({})