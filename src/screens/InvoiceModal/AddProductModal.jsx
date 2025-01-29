import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import apiInstance from '../../../api';
const MyModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState();
  const [values, setValues] = useState({}); // State to store input values

  const handleInputChange = (text, index, field) => {
    setValues((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: text },
    }));
  };
  useEffect(() => {
    fetchProducts();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct=()=>{
    
    setModalVisible(false)
  }

  return (
    <View style={styles.container}>
      {/* Open Modal Button */}
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>

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
              <View style={{}}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Product Name"
                />
                <Text style={styles.label}>Select Currency</Text>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCurrency}
                    onValueChange={itemValue => setSelectedCurrency(itemValue)}
                    style={styles.picker}>
                    <Picker.Item label="INR - Indian Rupee" value="INR" />
                    <Picker.Item label="USD - US Dollar" value="USD" />
                    <Picker.Item label="GBP - British Pound" value="GBP" />
                    <Picker.Item label="EUR - Euro" value="EUR" />
                  </Picker>
                </View>
              </View>

              <FlatList
                data={products} // Pass products as data
                keyExtractor={(item, index) => index.toString()} // Ensure each item has a unique key
                renderItem={({item, index}) => (
                  <View style={styles.card}>
                    <Text style={styles.productName}>{item.name}</Text>

                    {/* First Input Field */}
                    <TextInput
                      style={styles.input}
                      placeholder="Enter first value"
                      value={values[index]?.first || ''}
                      onChangeText={text =>
                        handleInputChange(text, index, 'first')
                      }
                    />

                    {/* Second Input Field */}
                    <TextInput
                      style={styles.input}
                      placeholder="Enter second value"
                      value={values[index]?.second || ''}
                      onChangeText={text =>
                        handleInputChange(text, index, 'second')
                      }
                    />

                    <TouchableOpacity style={{backgroundColor:'green', padding:5}} onPress={()=>handleAddProduct()}>
                        <Text style={{textAlign:'center' ,color:'#fff'}}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            {/* Close Modal Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  openButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
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
    width: '95%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
  },
  input: {
    backgroundColor: 'white',
    width: '100%%',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalBody: {
    width: '80%',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 3, // For shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
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
});
