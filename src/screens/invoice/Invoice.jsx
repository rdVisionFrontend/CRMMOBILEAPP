import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const user = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('jwtToken');
    const storedUser = JSON.parse(user);
    console.log('invoice user', JSON.parse(user));
    try {
      const response = await axios.get(
        `https://uatbackend.rdvision.tech/invoice/getInvoiceByUser/${storedUser?.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Invoice:', response.data);
      setInvoices(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = useCallback(invoiceId => {
    setExpandedCard(prev => (prev === invoiceId ? null : invoiceId));
  }, []);

  const renderInvoiceCard = ({item}) => {
    const isExpanded = expandedCard === item.invoiceId;

    return (
      <TouchableOpacity onPress={() => toggleAccordion(item.invoiceId)}>
        <View style={styles.card}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between', // Corrected the typo here
              alignItems: 'center',
            }}>
            <Text style={styles.title}>
              {item.customerName}{' '}
              <Text style={styles.subText}>({item.closerName})</Text>
            </Text>

            {item.verificationDate ? (
              <Image
                source={{
                  uri: 'https://cdn-icons-png.flaticon.com/128/2143/2143150.png',
                }}
                style={{width: 30, height: 30, marginLeft: 50}} // Adjust width, height, and margin as needed
              />
            ) : (
              <Image
                source={{
                  uri: ' https://cdn-icons-png.flaticon.com/128/6814/6814082.png',
                }}
                style={{width: 30, height: 30, marginLeft: 50}} // Adjust width, height, and margin as needed
              />
            )}
          </View>

          <Text>Email: {item.customerEmail || 'N/A'}</Text>
          <Text>Order Amount: ${item.orderAmount || '0.00'}</Text>
          <Text>Tracking Number: {item.trackingNumber || 'N/A'}</Text>
          <Text>Sale Date: {item.saleDate?.join('-') || 'N/A'}</Text>

          {isExpanded && (
            <View style={styles.expandedSection}>
              <Text style={styles.expandedText}>Product Details</Text>

              {/* Loop through productOrders and display each product's details */}
              {item.orderDto.productOrders[0].product.map((product, index) => (
                <View
                  key={index}
                  style={[styles.productDetailContainer, {width: '100%'}]}>
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
                      {item.orderDto.productOrders[0].quantity || 0}
                    </Text>
                  </View>
                  <View style={[styles.row, {borderBottomWidth: 1}]}>
                    <Text style={[styles.tableHeader, {flex: 1}]}>Price:</Text>
                    <Text style={[styles.tableCell, {flex: 2}]}>
                      {item.orderDto.productOrders[0].totalAmount || 0}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={invoices}
        renderItem={renderInvoiceCard}
        keyExtractor={item => item.invoiceId.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9ecef',
    padding: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  subText: {
    fontSize: 14,
    color: '#555',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  expandedSection: {
    backgroundColor: '#a4c3b2',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  expandedText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 2,
    textAlign: 'center',
  },
  productSection: {
    marginVertical: 5,
  },
  //   productDetailContainer:{
  //     borderWidth:1,
  //     borderColor:'black'
  //   },
  productDetailText: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    width: '100px',
  },

  productDetailContainer: {
    padding: 10,
    width: '100%',
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

export default Invoice;
