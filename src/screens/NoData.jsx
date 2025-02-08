import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';

const Nodata = () => {
  return (
    <View style={styles.container}>
      {/* Display Image */}
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/128/4076/4076373.png' }}
        style={styles.image}
      />
      <Text style={styles.text}>No Data Available</Text>
    </View>
  );
};

export default Nodata;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes full height & width of the screen
    justifyContent: 'center', // Centers vertically
    alignItems: 'center', // Centers horizontally
    backgroundColor: '#f9f9f9', // Optional: Light background
  },
  image: {
    width: 120, // Increased size for better visibility
    height: 120,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
  },
});
