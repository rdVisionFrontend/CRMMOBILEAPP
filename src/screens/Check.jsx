import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const Check = () => {
  const [min, setMin] = useState(false);
  const [ plugin,setTPlugin] = useState(true)

  // Toggle the 'min' state
  const toggleMinMax = () => {
    setMin(!min);
    setTPlugin(!plugin)
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>WebView Control</Text>
        <TouchableOpacity onPress={toggleMinMax} style={styles.button}>
          <Text style={styles.buttonText}>{min ? 'Maximize' : 'Minimize'}</Text>
        </TouchableOpacity>
      </View>

      {/* WebView Section */}
     { plugin && <View style={[styles.webviewContainer, min && styles.minimized]}>
        <WebView
          source={{ uri: 'https://ccn.cloud-connect.in/Agent_plugin' }}
          style={styles.webview}
        />
      </View>}
    </SafeAreaView>
  );
};

export default Check;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  buttonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  webviewContainer: {
    flex: 1,
    marginTop: 10,
  },
  minimized: {
    flex: 0.3, // Reduce the height when minimized
  },
  webview: {
    flex: 1,
  },
});