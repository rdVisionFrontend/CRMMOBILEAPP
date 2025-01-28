import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',    
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
  },
});