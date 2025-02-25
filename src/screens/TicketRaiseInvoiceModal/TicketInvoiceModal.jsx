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
  Modal,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {Picker} from '@react-native-picker/picker';
import {useAuth} from '../../Authorization/AuthContext';
import apiInstance from '../../../api';

const InvoiceModal = ({data, closeModal, visible}) => {
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
    <Modal
      visible={visible} // Control visibility of the modal
      animationType="slide" // Slide animation
      transparent={false} // Make the modal non-transparent
      onRequestClose={closeModal} // Handle Android back button
    >
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
          <Text style={styles.closeButtonText}>x</Text>
        </TouchableOpacity>

        {/* Main Content */}
        <ScrollView style={styles.scrollView}>
          <Text style={styles.headerText}>Create Invoice</Text>

          {/* Customer Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.customerDetails}>
              <Text style={styles.detailsTitle}>Customer Details</Text>
              <Text>Name: {data.senderName || data.firstName}</Text>
              <Text>Email: {data.senderEmail || data.email}</Text>
              <Text>Mobile: {data.senderMobile || data.mobileNumber}</Text>
            </View>
            <View style={styles.addressDetails}>
              <Text style={styles.detailsTitle}>Address Details</Text>
              {addressData ? (
                <Text>
                  {addressData.houseNumber}, {addressData.landmark},{' '}
                  {addressData.city}, {addressData.state}, {addressData.zipCode}
                  , {addressData.country}
                </Text>
              ) : (
                <Text>No address</Text>
              )}
            </View>
          </View>

          {/* Product List */}
          <View style={styles.productList}>
            <Text style={styles.sectionTitle}>Products</Text>
            <View style={{display:'flex', flexDirection:'row', justifyContent:'space-around' , alignItems:'center', width:'100%', backgroundColor:'#f9dcc4', paddingVertical:5}}>
              <Text style={{width:50}}>Name</Text>
              <Text>Brand</Text>
              <Text>PKg SZ</Text>
              <Text>QTY</Text>
              <Text>AMT</Text>
              <Text>ACT</Text>
            </View>
            {orderdetails?.productOrders?.length > 0 ? (
              orderdetails.productOrders.map((productOrder, index) =>
                productOrder.product && productOrder.product[0] ? (
                  <View
                    key={productOrder.productorderId}
                    style={styles.productItem}>
                    <Text style={{width:50}}>{productOrder.product[0].name}</Text>
                    <Text>{productOrder.product[0].brand}</Text>
                    <Text>{productOrder.product[0].packagingSize}</Text>
                    <Text>{productOrder.quantity}</Text>
                    <Text>{productOrder.totalAmount}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        handleDeleteProduct(productOrder.productorderId)
                      }>
                      <Image
                        source={{
                          uri: 'https://cdn-icons-png.flaticon.com/128/6861/6861362.png',
                        }}
                        style={styles.deleteIcon}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text key={index}>Product details not available</Text>
                ),
              )
            ) : (
              <Text style={styles.noProductsText}>No products found</Text>
            )}
          </View>

          {/* Add Product Button */}
          <TouchableOpacity
            style={styles.addProductButton}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Add Product</Text>
          </TouchableOpacity>

          {/* Add Product Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalBody}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search Product"
                    value={search}
                    onChangeText={setSearch}
                  />
                  <Picker
                    selectedValue={selectedCurrency}
                    onValueChange={setSelectedCurrency}>
                    <Picker.Item label="Select Currency" value="" />
                    <Picker.Item label="INR" value="INR" />
                    <Picker.Item label="USD" value="USD" />
                    <Picker.Item label="EUR" value="EUR" />
                  </Picker>
                  <FlatList
                    data={filteredProducts}
                    keyExtractor={item => item.productId.toString()}
                    renderItem={({item}) => (
                      <View style={styles.productCard}>
                        <Text>{item.name}</Text>
                        <TextInput
                          style={styles.addProductInput}
                          placeholder="Quantity"
                          value={productStates[item.productId]?.qty || ''}
                          onChangeText={text =>
                            handleInputChange(item.productId, 'qty', text)
                          }
                        />
                        <TextInput
                          placeholder="Price"
                          style={styles.addProductInput}
                          value={productStates[item.productId]?.price || ''}
                          onChangeText={text =>
                            handleInputChange(item.productId, 'price', text)
                          }
                        />
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleAddProduct(item.productId)}>
                          <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Shipping Address Form */}
          <View style={styles.shippingForm}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="House No./ Street"
              value={house}
              onChangeText={setHouse}
            />
            <TextInput
              style={styles.input}
              placeholder="Landmark"
              value={landmark}
              onChangeText={setLandMark}
            />
            <View style={styles.row}>
              <TextInput
                style={styles.halfInput}
                placeholder="City"
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={styles.halfInput}
                placeholder="Zip Code"
                value={zip}
                onChangeText={setZip}
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={styles.halfInput}
                placeholder="State"
                value={state}
                onChangeText={setState}
              />
              <TextInput
                style={styles.halfInput}
                placeholder="Country"
                value={country}
                onChangeText={setCountry}
              />
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleshipSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ef233c',
    padding: 10,
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Ensure it's above other content
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
  },
  customerDetails: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 5,
  },
  addressDetails: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#fcd5ce',
    padding: 10,
    borderRadius: 5,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: 500,
    marginBottom: 10,
  },
  productList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  deleteIcon: {
    width: 20,
    height: 20,
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 10,
  },
  productList: {
    maxHeight: 200,
    overflow: 'hidden',
  },
  addProductButton: {
    backgroundColor: '#52b788',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addProductInput: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'gray',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    height: '95%',
    overflow: 'hidden',
    paddingBottom: 150,
  },
  modalBody: {
    width: '100%',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  productCard: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#52b788',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: '#ef233c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  shippingForm: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#52b788',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
});

export default InvoiceModal;
