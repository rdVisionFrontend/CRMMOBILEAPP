import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import apiInstance from '../../../api';
import {useSelector} from 'react-redux';

const TodaySalesRepost = () => {
  const {userData} = useSelector(state => state.crmUser);
  const [todaySale, setToDaySale] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null); // To track which card is expanded

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await apiInstance.get(
        `/invoice/getInvoiceByUser/${userData.userId}`,
      );
      if (__DEV__) {
        console.log('Fetched invoices:', response.data);
      }
      setToDaySale(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = dateArray => {
    const [year, month, day] = dateArray;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;
    return `${formattedDay}-${formattedMonth}-${year}`;
  };

  const handleCardPress = index => {
    // Toggle the expanded state for the clicked card
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={styles.cardContainer}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: 15, fontWeight: '600'}}>Name</Text>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/14034/14034783.png',
                }}
                style={{width: 20, height: 20}}
              />
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: 15, fontWeight: '600'}}>Address</Text>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/14034/14034783.png',
                }}
                style={{width: 20, height: 20}}
              />
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: 15, fontWeight: '600'}}>Date</Text>
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/14034/14034783.png',
                }}
                style={{width: 20, height: 20}}
              />
            </View>
          </View>

          {todaySale &&
            todaySale.map((ele, index) => {
              const isExpanded = expandedIndex === index; // Check if the card is expanded
              return (
                <View style={styles.card} key={index}>
                  <TouchableOpacity onPress={() => handleCardPress(index)}>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text style={{width:'42%', fontWeight:'600'}}>{ele.customerName}</Text>
                      <Text style={{width:'42%', textTransform:'capitalize'}}>{ele.address?.landmark}</Text>
                      <Text style={{width:'42%', color:'#2f195f', fontWeight:'600'}}>{formatDate(ele.invoiceCreateDate)}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* If the card is expanded, show additional details */}
                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Text style={{fontSize: 16, fontWeight: '600'}}>
                          Doses :
                        </Text>
                        <Text style={{marginLeft: 5}}>
                          {ele.orderDto.productOrders[0].product.map(
                            (productItem, index) => (
                              <Text key={index}>
                                {productItem.strength}{' '}
                                {/* Replace 'productName' with the correct property */}
                              </Text>
                            ),
                          )}
                        </Text>
                      </View>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Text style={{fontSize: 16, fontWeight: '600'}}>
                          Amount :
                        </Text>
                        <Text
                          style={{
                            marginLeft: 5,
                          }}>{`INR ${ele.orderDto.totalPayableAmount} `}</Text>
                      </View>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                        <Text style={{fontSize: 16, fontWeight: '600'}}>
                          Address :
                        </Text>
                        <Text>{` ${ele.address?.city}, ${ele.address?.state}, ${ele.address?.country} , ${ele.address?.zipCode}`}</Text>
                      </View>
                      {ele.orderDto.productOrders[0].product.map(
                        (product, index) => (
                          <View
                            key={index}
                            style={[
                              styles.productDetailContainer,
                              {width: '100%'},
                            ]}>
                            <View style={[styles.row, {borderBottomWidth: 1}]}>
                              <Text style={[styles.tableHeader, {flex: 1}]}>
                                Product Name:
                              </Text>
                              <Text style={[styles.tableCell, {flex: 2}]}>
                                {product.name}
                              </Text>
                            </View>
                            <View style={[styles.row, {borderBottomWidth: 1}]}>
                              <Text style={[styles.tableHeader, {flex: 1}]}>
                                Quantity:
                              </Text>
                              <Text style={[styles.tableCell, {flex: 2}]}>
                                {ele.orderDto.productOrders[0].quantity || 0}
                              </Text>
                            </View>
                            <View style={[styles.row, {borderBottomWidth: 1}]}>
                              <Text style={[styles.tableHeader, {flex: 1}]}>
                                Price:
                              </Text>
                              <Text style={[styles.tableCell, {flex: 2}]}>
                                {ele.orderDto.productOrders[0].totalAmount || 0}
                              </Text>
                            </View>
                          </View>
                        ),
                      )}

                      {/* You can add more content here that should appear when the card is expanded */}
                    </View>
                  )}
                </View>
              );
            })}
        </View>
      </View>
    </View>
  );
};

export default TodaySalesRepost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2f4',
    width: '100%',
  },
  cardContainer: {
    width: '100%',
  },
  card: {
    margin: 'auto',
    width: '99%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  expandedContent: {
    padding: 10,
    marginTop: 10,
    backgroundColor: '#f9f4f5',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  productDetailContainer: {
    padding: 10,
    width: '100%',
    backgroundColor: '#94d1be',
    marginTop:10
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  tableHeader: {
    fontWeight: 'bold',
    paddingRight: 10,
  },
  tableCell: {
    paddingLeft: 10,
  },
});
