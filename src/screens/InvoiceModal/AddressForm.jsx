import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import CheckBox from 'react-native-checkbox';

const AddressForm = () => {
  const [shipping, setShipping] = useState({
    name: '',
    street: '',
    landmark: '',
    city: '',
    zip: '',
    state: '',
    country: '',
  });

  const [billing, setBilling] = useState({ ...shipping });
  const [sameAsShipping, setSameAsShipping] = useState(false);

  // Handle input changes
  const handleInputChange = (field, value, type = 'shipping') => {
    if (type === 'shipping') {
      setShipping({ ...shipping, [field]: value });
      if (sameAsShipping) {
        setBilling({ ...billing, [field]: value });
      }
    } else {
      setBilling({ ...billing, [field]: value });
    }
  };

  // Handle checkbox toggle
  const toggleSameAsShipping = () => {
    setSameAsShipping(!sameAsShipping);
    if (!sameAsShipping) {
      setBilling({ ...shipping });
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    Alert.alert('Submitted!', JSON.stringify({ shipping, billing }, null, 2));
  };

  return (
  
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Shipping to</Text>

      <TextInput
        style={styles.input}
        placeholder="Eg. Jane kapoor"
        value={shipping.name}
        onChangeText={(text) => handleInputChange('name', text)}
      />
     
     
      
      {/* Billing Address - Only shown if not same as shipping */}
      {!sameAsShipping && (
        <>
          <Text style={styles.title}>Shipping Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={billing.name}
            onChangeText={(text) => handleInputChange('name', text, 'billing')}
          />
          <TextInput
            style={styles.input}
            placeholder="House No./ Street"
            value={billing.street}
            onChangeText={(text) => handleInputChange('street', text, 'billing')}
          />
          <TextInput
            style={styles.input}
            placeholder="Landmark"
            value={billing.landmark}
            onChangeText={(text) => handleInputChange('landmark', text, 'billing')}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={billing.city}
            onChangeText={(text) => handleInputChange('city', text, 'billing')}
          />
          <TextInput
            style={styles.input}
            placeholder="Zip Code"
            keyboardType="numeric"
            value={billing.zip}
            onChangeText={(text) => handleInputChange('zip', text, 'billing')}
          />
          <TextInput
            style={styles.input}
            placeholder="State"
            value={billing.state}
            onChangeText={(text) => handleInputChange('state', text, 'billing')}
          />
          <TextInput
            style={styles.input}
            placeholder="Country"
            value={billing.country}
            onChangeText={(text) => handleInputChange('country', text, 'billing')}
          />
        </>
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddressForm;

const styles = StyleSheet.create({
  container: {
   width:"100%",
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
