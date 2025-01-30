import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import apiInstance from '../../../api';
import {useSelector} from 'react-redux';
import AddressForm from './AddressForm';
import {useAuth} from '../../Authorization/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';

const MyModal = ({ticketId}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState();
  const [productStates, setProductStates] = useState({}); // State to store input values for each product
  const {userData} = useSelector(state => state.crmUser);

  const [addressForm, setAddressForm] = useState(false);
  const {setApiCall} = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (productId) => {
    if(!selectedCurrency){
      Alert.alert("Please select Currency")
      return;
    }
    const productState = productStates[productId];
    if (!productState || !productState.qty || !productState.price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const orderData = {
      quantity: productState.qty,
      productId: productId,
      ticketId: ticketId,
      userId: userData.userId,
      price: productState.price,
      currency: selectedCurrency,
    };

    try {
      const response = await apiInstance.post('/order/addToOrder', orderData);
      Alert.alert('Added to order successfully!');
      console.log('qty,price updated', response);
      setApiCall(true);
      setModalVisible(false);
      setAddressForm(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to add order');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiInstance.get('/product/getAllProducts');
      console.log('sdfgh', response);

      if (response.data?.dtoList) {
        setProducts(response.data.dtoList);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError(err.message || 'Error fetching products');
    }
  };

  const handleInputChange = (productId, field, value) => {
    setProductStates(prevState => ({
      ...prevState,
      [productId]: {
        ...prevState[productId],
        [field]: value,
      },
    }));
  };

  return (
    <View style={styles.container}>
      {/* Open Modal Button */}
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Address</Text>
      </TouchableOpacity> */}

      {/* Modal Component */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // For Android back button
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalBody}>
              <View>
                <View style={styles.inputContainer}>
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/954/954591.png',
                    }} // URL of the search icon
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.inputSearch}
                    placeholder="Enter Product Name"
                    placeholderTextColor="#999"
                  />
                </View>
                <Text style={styles.label}>Select Currency</Text>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCurrency}
                    onValueChange={itemValue => setSelectedCurrency(itemValue)}
                    style={styles.picker}>
                    <Picker.Item label="Select currency"  />
                    <Picker.Item label="INR - Indian Rupee" value="INR" />
                    <Picker.Item label="USD - US Dollar" value="USD" />
                    <Picker.Item label="GBP - British Pound" value="GBP" />
                    <Picker.Item label="EUR - Euro" value="EUR" />
                  </Picker>
                </View>
              </View>

              <FlatList
                data={products} // Pass products as data
                keyExtractor={item => item.productId.toString()} // Ensure each item has a unique key
                renderItem={({item}) => (
                  <View style={styles.card}>
                    <Text style={styles.productName}>{item.name}</Text>

                    {/* Quantity Input Field */}
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Quantity"
                      value={productStates[item.productId]?.qty || ''}
                      keyboardType="numeric"
                      onChangeText={text =>
                        handleInputChange(item.productId, 'qty', text)
                      }
                    />

                    {/* Price Input Field */}
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Price"
                      value={productStates[item.productId]?.price || ''}
                      keyboardType="numeric"
                      onChangeText={text =>
                        handleInputChange(item.productId, 'price', text)
                      }
                    />

                    <TouchableOpacity
                      style={{backgroundColor: 'green', padding: 5}}
                      onPress={() => handleAddProduct(item.productId)}>
                      <Text style={{textAlign: 'center', color: '#fff'}}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            {/* Close Modal Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View>{addressForm && <AddressForm ticketId={ticketId} />}</View>
    </View>
  );
};

export default MyModal;

const styles = StyleSheet.create({
  container: {
    width:'100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  openButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBody: {
    width: '100%',
  },
  card: {
    width:'95%',
    backgroundColor: '#f5ebe0',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 3, // For shadow effect
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputSearch: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  icon: {
    width: 20, // Set the width of the icon
    height: 20, // Set the height of the icon
    resizeMode: 'contain', // Ensure the image scales properly
  },
});
