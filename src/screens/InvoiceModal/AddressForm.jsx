import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import CheckBox from 'react-native-checkbox';
import apiInstance from '../../../api';
import { useAuth } from '../../Authorization/AuthContext';

const AddressForm = ({ticketId}) => {
  const [shipping, setShipping] = useState({
    name: '',
    street: '',
    landmark: '',
    city: '',
    zip: '',
    state: '',
    country: '',
  });

  const [billing, setBilling] = useState({...shipping});
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [name,setName] = useState()
  const [house, setHouse] = useState();
  const [landmark, setLandMark] = useState();
  const [city, setCity] = useState();
  const [zip, setZip] = useState();
  const [state, setState] = useState();
  const [country, setCountry] = useState();
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState()
  const [submit,setSubmit] = useState(true)

  const handleshipSubmit = async () => {
    const {setRaiseInvoice} = useAuth()

    console.log(name,house,landmark,city,zip,state,country)
    // setLoading(true);

    try {
      if (!house || !landmark || !city || !zip || !name || !country || !state) {
        Alert.alert("Please fill all fields");
      }
      
      const response = await apiInstance.post('/address/createAddress', {
        houseNumber: house,
        landmark: landmark,
        city: city,
        zipCode: zip,
        state: state,
        country: country,
        ticketId: ticketId
      });
      console.log(response.data);   
      setSubmit(false)
      setRaiseInvoice(false)
      // fetchAddressDetails();
    } catch (err) {
      setError(err);
      Alert.alert('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  return (
   submit && <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Shipping to</Text>

      <TextInput
        style={styles.input}
        placeholder="Eg. Jane kapoor"
        value={name}
        onChangeText={text => setName(text)}
      />

      {/* Billing Address - Only shown if not same as shipping */}
      {!sameAsShipping && (
        <>
          <Text style={styles.title}>Shipping Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Eg. Jane kapoor"
            value={name}
            onChangeText={text => setName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="House No./ Street"
            value={house}
            onChangeText={text => setHouse(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Landmark"
            value={landmark}
            onChangeText={text =>setLandMark(text) }
          />
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '99%',
            }}>
            <TextInput
              style={styles.input1}
              placeholder="City"
              value={city}
              onChangeText={text => setCity(text)}
            />
            <TextInput
              style={styles.input1}
              placeholder="Zip Code"
              keyboardType="numeric"
              value={zip}
              onChangeText={text => setZip(text)}
            />
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '99%',
            }}>
            <TextInput
              style={styles.input1}
              placeholder="State"
              value={state}
              onChangeText={text => setState(text)}
            />
            <TextInput
              style={styles.input1}
              placeholder="Country"
              value={country}
              onChangeText={text => setCountry(text) }
            />
          </View>
        </>
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} 
      onPress={handleshipSubmit}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddressForm;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
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
  input1: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '48%',
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
