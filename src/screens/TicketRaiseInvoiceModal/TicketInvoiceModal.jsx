import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import {useSelector} from 'react-redux';
import {Modal} from 'react-native';
import {TextInput} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useAuth} from '../../Authorization/AuthContext';
import apiInstance from '../../../api';

const InvoiceModal = ({data, closeModal}) => {
  const {width, height} = Dimensions.get('window'); // Get full screen dimensions
  const [loading, setLoading] = useState(false);
  const [orderdetails, setOrderDetails] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const {apicall, raiseInoice, setRaiseInvoice} = useAuth();
  const [addressData, setAddressData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState();
  const [productStates, setProductStates] = useState({}); // State to store input values for each product
  const {userData} = useSelector(state => state.crmUser);
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [name, setName] = useState();
  const [house, setHouse] = useState();
  const [landmark, setLandMark] = useState();
  const [city, setCity] = useState();
  const [zip, setZip] = useState();
  const [state, setState] = useState();
  const [country, setCountry] = useState();
  const [search, setSearch] = useState('');

  console.log('New invoice', data);
  useEffect(() => {
    fatchaddedproduct();
    fetchAddressDetails();
    fetchProducts();
    if (raiseInoice) {
      fetchAddressDetails();
      // closeModal();
    }
    if (apicall) {
      fetchAddressDetails();
    }
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInputChange = (productId, field, value) => {
    setProductStates(prevState => ({
      ...prevState,
      [productId]: {
        ...prevState[productId],
        [field]: value,
      },
    }));
  };

  const fatchaddedproduct = () => {
    if (data.uniqueQueryId) {
      const fetchOrderDetails = async () => {
        try {
          const response = await apiInstance.get(
            `/order/getOrder/${data.uniqueQueryId}`,
          );
          setOrderDetails(response.data.dtoList);

          console.log('update product', response);
        } catch (err) {
          console.error('Error fetching order details:', err);
        }
      };
      fetchOrderDetails();
    }
  };
  const handleDeleteProduct = async productOrderId => {
    const response = await apiInstance.delete(
      `/order/deleteProductOrder/${productOrderId}`,
    );
    if (response.data === 'deleted') {
      console.log('deleetd');
      fatchaddedproduct();
    }
  };
  const fetchAddressDetails = async () => {
    try {
      const response = await apiInstance.get(
        `/address/getAddress/${data.uniqueQueryId}`,
      );
      setAddressData(response.data.dto);
      console.log('Addredd 2', response);
      fatchaddedproduct();
      setRaiseInvoice(false);
    } catch (err) {
      console.error('Error fetching address details:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiInstance.get('/product/getAllProducts');
      console.log('All Products', response);

      if (response.data?.dtoList) {
        setProducts(response.data.dtoList);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError(err.message || 'Error fetching products');
    }
  };

  const handleAddProduct = async productId => {
    console.log(productId, data.uniqueQueryId, userData && userData.userId);
    if (!selectedCurrency) {
      Alert.alert('Please select Currency');
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
      ticketId: data.uniqueQueryId,
      userId: userData.userId,
      price: productState.price,
      currency: selectedCurrency,
    };

    try {
      const response = await apiInstance.post('/order/addToOrder', orderData);
      Alert.alert('Added to order successfully!');
      fatchaddedproduct();
      console.log('qty,price updated', response);

      if (response.data.success.message == 'success') {
        fetchAddressDetails();
        fatchaddedproduct();
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to add order');
    }
  };

  const handleshipSubmit = async () => {
    // Alert.alert('clicked address');
    console.log(name, house, landmark, city, zip, state, country);
    setLoading(true);
    try {
      if (!house || !landmark || !city || !zip || !name || !country || !state) {
        Alert.alert('Please fill all fields');
      }
      setLoading(true);
      const response = await apiInstance.post('/address/createAddress', {
        houseNumber: house,
        landmark: landmark,
        city: city,
        zipCode: zip,
        state: state,
        country: country,
        ticketId: data.uniqueQueryId,
      });
      console.log(response.data);
      Alert.alert('Address Added');
      fetchAddressDetails();
      setLoading(false);
    } catch (err) {
      setError(err);
      Alert.alert('Failed to add address');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      <View style={[styles.container, {width: width, height: height}]}>
        <Text style={{fontSize: 20}}>Create Invoice</Text>
       
        <View style={{width: '100%', paddingVertical: 5}}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 5,
            }}>
            <View style={{borderWidth: 1, padding: 5, width: '45%'}}>
              <Text>Customer details</Text>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text style={{fontWeight: 'bold'}}>Name :</Text>
                <Text style={{paddingHorizontal: 11}}>
                  {data.senderName || data.firstName}
                </Text>
              </View>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text style={{fontWeight: 'bold'}}>Email :</Text>
                <Text
                  style={{
                    paddingHorizontal: 11,
                    flexWrap: 'wrap',
                    width: '80%',
                  }}>
                  {data.senderEmail || data.email}
                </Text>
              </View>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text style={{fontWeight: 'bold'}}>Mobile :</Text>
                <Text style={{paddingHorizontal: 11}}>
                  {data.senderMobile || data.mobileNumber}
                </Text>
              </View>
            </View>
            <View
              style={{
                borderWidth: 1,
                padding: 5,
                width: '45%',
                marginRight: 25,
              }}>
              <Text>Address details</Text>
              <View style={{display: 'flex', flexDirection: 'column'}}>
                <Text
                  style={{
                    paddingHorizontal: 11,
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                  }}>
                  {data.queryMcatName || data.productEnquiry}
                </Text>
                {addressData ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                    }}>
                    <Image
                      source={{
                        uri: 'https://cdn-icons-png.flaticon.com/128/1865/1865269.png',
                      }}
                      style={{width: 20, height: 20}} // Adjust size as needed
                    />
                    <View style={{width: '95%'}}>
                      <Text style={{flexWrap: 'wrap'}}>
                        {addressData.houseNumber}, {addressData.landmark},{' '}
                        {addressData.city}, {addressData.state},{' '}
                        {addressData.zipCode}, {addressData.country}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text>No address</Text>
                )}
              </View>
            </View>
          </View>
        </View>
        {/* all added product */}
        <View style={{width: '80%'}}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Brand</Text>
            <Text style={styles.headerCell}>Size</Text>
            <Text style={styles.headerCell}>QTY</Text>
            <Text style={styles.headerCell}>Price</Text>
            <Text style={styles.headerCell}>Action</Text>
          </View>

          {orderdetails?.productOrders?.length > 0 ? (
            orderdetails.productOrders.map((productOrder, index) =>
              productOrder.product && productOrder.product[0] ? (
                <View
                  key={productOrder.productorderId}
                  style={styles.tableBody}>
                  <Text style={styles.headerCell}>
                    {productOrder.product[0].name}
                  </Text>
                  <Text style={styles.headerCell}>
                    {productOrder.product[0].brand}
                  </Text>
                  <Text style={styles.headerCell}>
                    {productOrder.product[0].packagingSize}
                  </Text>
                  <Text style={styles.headerCell}>{productOrder.quantity}</Text>
                  <Text style={styles.headerCell}>
                    {productOrder.totalAmount}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleDeleteProduct(productOrder.productorderId)
                    }>
                    <Image
                      source={{
                        uri: 'https://cdn-icons-png.flaticon.com/128/6861/6861362.png',
                      }}
                      style={{width: 20, height: 20}} // Adjust size as needed
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View key={index}>
                  <Text>Product details not available</Text>
                </View>
              ),
            )
          ) : (
            <Text style={{textAlign: 'center', marginTop: 10}}>
              No products found
            </Text>
          )}
        </View>
        {/* <AddProduct ticketId={data.uniqueQueryId} /> */}
        {/* Added Product */}

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
                        value={search}
                        onChangeText={text => setSearch(text)} // Update search query
                      />
                    </View>
                    <Text style={styles.label}>Select Currency</Text>

                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedCurrency}
                        onValueChange={itemValue =>
                          setSelectedCurrency(itemValue)
                        }
                        style={styles.picker}>
                        <Picker.Item label="Select currency" />
                        <Picker.Item label="INR - Indian Rupee" value="INR" />
                        <Picker.Item label="USD - US Dollar" value="USD" />
                        <Picker.Item label="GBP - British Pound" value="GBP" />
                        <Picker.Item label="EUR - Euro" value="EUR" />
                      </Picker>
                    </View>
                  </View>

                  {/* FlatList to display filtered products */}
                  <FlatList
                    data={filteredProducts} // Use filtered products based on the search query
                    keyExtractor={item => item.productId.toString()}
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

          {/* Adrress form */}
          <View style={{marginRight: 20}}>
            <Text style={styles.title}>Shipping to</Text>
            <TextInput
              style={styles.input}
              placeholder="Eg. Jane kapoor"
              value={name}
              onChangeText={text => setName(text)}
            />

            {/* Billing Address - Only shown if not same as shipping */}
            {!sameAsShipping && (
              <View>
                <Text style={styles.title}>Shipping Address</Text>
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
                  onChangeText={text => setLandMark(text)}
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
                    onChangeText={text => setCountry(text)}
                  />
                </View>
              </View>
            )}

            {/* Submit Button */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                marginTop: 10,
              }}>
              <TouchableOpacity
                style={[styles.SubmitButton, loading && {opacity: 0.5}]}
                onPress={handleshipSubmit}
                disabled={loading}>
                <Text style={styles.buttonTextSubmit}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default InvoiceModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d8e2dc',
    paddingHorizontal: 10,
    justifyContent: 'start',
    alignItems: 'center',
    marginRight: 5,
    height:'100%',
    oveflow:'auto'
  },
  SubmitButton: {
    backgroundColor: '#52b788',
    paddingHorizontal: 4,
    paddingVertical: 10,
    width: 100,
  },
  closeButton: {
    backgroundColor: '#ef233c',
    paddingHorizontal: 4,
    paddingVertical: 10,
    width: 100,
  },
  closeButtonText: {
    textAlign: 'center',
  },
  buttonTextSubmit: {
    textAlign: 'center',
  },

  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#778da9',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  headerCell: {
    width: 50,
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
    width: '95%',
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
    borderColor: '#d8e2dc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
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
  input1: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '48%',
  },
});
