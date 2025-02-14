import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Toast} from 'toastify-react-native';
import apiInstance from '../../api';
import {useSelector} from 'react-redux';

const Email = ({data, closeModal}) => {
  const {width, height} = Dimensions.get('window'); // Get full screen dimensions
  const [productdata, setProductData] = useState([]);
  const [text, setText] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]); // New state for selected product IDs
  const [userId, setUserId] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const {userData} = useSelector(state => state.crmUser);

  useEffect(() => {
    console.log('New Email:', data);
    fetchAllProducts();
  }, [width, height]);

  const fetchAllProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        Alert.alert('Plase Login');
        return;
      }
      console.log('email token:', token);
      setToken(token);
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user); // ✅ Corrected parsing
      
      setUserId(parsedUser.userId);
      const response = await apiInstance.get('/product/getAllProducts');
      console.log('Products:', response);
      setProductData(response.data.dtoList);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const toggleSelection = productId => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const sendEmail = async () => {
    try {
      setLoading(true); 
      const storedUser = await  AsyncStorage.getItem('user');
      const user = JSON.parse(storedUser);

      const response = await apiInstance.post('/email/sendsugetionmail', {
        ticket: {
          uniqueQueryId: data.uniqueQueryId,
        },
        text: text,
        temp: selectedTheme, // Use selectedTheme instead of temp
        productsIds: selectedProducts,
        userId:user.userId,
      });
      Alert.alert("Email has been sent")
      console.log('Email sent successfully:', response);
      setLoading(false); // Set loading to false when email is sent
      closeModal();
    } catch (error) {
      console.error(
        'Error sending email:',
        error.response ? error.response.data : error.message,
      );
      setLoading(false); // Set loading to false in case of an error
    }
  };

  return (
    <View style={[styles.container, {width: width, height: height}]}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 5,
          paddingVertical: 20,
        }}>
        <TouchableOpacity onPress={() => setSelectedTheme('1')}>
          <Image
            source={{
              uri: 'https://img.freepik.com/free-vector/ecommerce-email-templates-with-photo_23-2148714843.jpg?semt=ais_hybrid',
            }}
            style={{
              height: 100,
              width: 150,
              borderWidth: selectedTheme === '1' ? 3 : 0, // Green border if selected
              borderColor: selectedTheme === '1' ? 'green' : 'transparent',
              borderRadius: 5,
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelectedTheme('2')}>
          <Image
            source={{
              uri: 'https://img.freepik.com/free-vector/pack-blogger-email-template-with-photos_23-2148730559.jpg',
            }}
            style={{
              height: 100,
              width: 150,
              borderWidth: selectedTheme === '2' ? 3 : 0, // Green border if selected
              borderColor: selectedTheme === '2' ? 'green' : 'transparent',
              borderRadius: 5,
            }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <Text style={{fontSize: 15, fontWeight: 'bold', marginVertical: 10}}>
          Products:
        </Text>
        <View style={styles.cardContainer}>
          {productdata &&
            productdata.map((ele, i) => (
              <View key={i} style={styles.card}>
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/5290/5290058.png',
                  }}
                  style={styles.image}
                />
                <View style={styles.cardText}>
                  <Text style={{fontSize: 10}}>
                    Name: {ele.brand ? ele.brand : 'NA'}
                  </Text>
                  <Text style={{fontSize: 10}}>
                    Price: {ele.price ? ele.price : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    {
                      backgroundColor: selectedProducts.includes(ele.productId)
                        ? 'green'
                        : 'gray',
                    },
                  ]}
                  onPress={() => toggleSelection(ele.productId)}>
                  <Text style={styles.selectText}>
                    {selectedProducts.includes(ele.productId)
                      ? 'Deselect'
                      : 'Select'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
        <Text style={{fontSize: 15, fontWeight: 'bold', marginTop: 10}}>
          Your Message :
        </Text>
        <View>
          <TextInput
            multiline={true}
            numberOfLines={8}
            onChangeText={e => setText(e)}
            value={text}
            style={styles.textInput}
            placeholder="Write something"
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => closeModal()}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={sendEmail}>
            <Text style={styles.emailButton}>
              {loading ? 'Sending...' : 'Send Email'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d8f3dc',
    padding: 10,
    justifyContent: 'start',
    alignItems: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 10,
    borderColor: 'lightgray',
    borderWidth: 1,
    padding: 2,
    borderRadius: 5,
  },
  card: {
    width: '25%',
    height: 150,
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    margin: '2%',
    overflow: 'hidden',
  },
  image: {
    height: 40,
    width: 40,
    marginBottom: 10,
    alignSelf: 'center',
  },
  cardText: {
    flexDirection: 'column',
    gap: 2,
  },
  selectButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectText: {
    color: '#fff',
    fontSize: 10,
  },
  textInput: {
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 5,
    height: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
    height: 100,
  },
  footer: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  closeButton: {
    backgroundColor: '#da5552',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 100,
    paddingVertical: 10,
  },
  emailButton: {
    backgroundColor: '#006400',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 100,
    paddingVertical: 10,
  },
});

export default Email;
