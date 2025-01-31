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
import apiInstance from '../../api';
import {useAuth} from '../Authorization/AuthContext';
import {useSelector} from 'react-redux';
import {Modal} from 'react-native';
import {TextInput} from 'react-native';
import {Picker} from '@react-native-picker/picker';

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
  

  console.log('invoice', data);
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
  }, [ ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
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
      console.log('qty,price updated', response);
      fetchAddressDetails();
      fatchaddedproduct();
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
        <Text style={{fontSize: 20}}>Raise Invoice</Text>

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}>
          <TouchableOpacity disabled={true}>
            <Text style={styles.emailButton}>
              {loading ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeModal}>
            <Text style={styles.closeButtonTop}>Close</Text>
          </TouchableOpacity>
        </View>
        <View style={{width: '100%', paddingVertical: 5}}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 5,
            }}>
            <View style={{borderWidth: 1, padding: 5, width: '50%'}}>
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
            <View style={{borderWidth: 1, padding: 5, width: '50%'}}>
              <View style={{display: 'flex', flexDirection: 'column'}}>
                <Text
                  style={{
                    paddingHorizontal: 11,
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                  }}>
                  {data.queryMcatName || data.productEnquiry}
                </Text>
                {addressData && (
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
                    <View>
                      <Text>
                        {addressData.houseNumber}, {addressData.landmark},
                        {addressData.city}, {addressData.state},{' '}
                        {addressData.zipCode}, {addressData.country}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
        {/* all added product */}
        <View style={{width: '100%'}}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Brand</Text>
            <Text style={styles.headerCell}>Size</Text>
            <Text style={styles.headerCell}>Quantity</Text>
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
          <View>
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
            <TouchableOpacity
              style={styles.SubmitButton}
              onPress={handleshipSubmit}
              disabled={loading}>
              <Text style={styles.buttonTextSubmit}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default InvoiceModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 10,
    width: '100%',
    justifyContent: 'start',
    alignItems: 'center',
    flex: 1,
  },
  SubmitButton: {
    backgroundColor: 'green',
    borderRadius: 5,
  },
  buttonTextSubmit: {
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 8,
    fontWeight: 600,
  },
  closeButton: {
    backgroundColor: '#da5552',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButtonTop: {
    backgroundColor: '#da5552',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
  },
  emailButton: {
    backgroundColor: '#006400',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
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
