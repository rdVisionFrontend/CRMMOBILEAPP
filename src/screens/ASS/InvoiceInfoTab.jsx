import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const InvoiceInfoTab = () => {
  const { userData } = useSelector(state => state.crmUser);
  const [invoiceDataTab, setInvoiceDataTab] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null); // For managing accordion state

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Retrieve user data and token from AsyncStorage
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('jwtToken');

      if (!user || !token) {
        throw new Error('User data or token not found');
      }

      const userData = JSON.parse(user);

      const response = await axios.get(
        `https://uatbackend.rdvision.tech/invoice/getAssInvoice/${userData.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Fetched Invoices:', response.data); // Log response for verification
      setInvoiceDataTab(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const formatDate = dateArray => {
    const [year, month, day] = dateArray;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;
    return `${formattedDay}-${formattedMonth}-${year}`;
  };

  const toggleAccordion = index => {
    setExpandedIndex(expandedIndex === index ? null : index); // Toggle the accordion
  };

  const renderInvoiceCard = ({ item, index }) => {
    const isExpanded = expandedIndex === index;
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleAccordion(index)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.customerName}</Text>
            <Text>{formatDate(item.invoiceCreateDate)}</Text>
            <Text style={styles.cardTitle}>{item.countryIso}</Text>
          </View>
          <Text style={styles.textNumber}>{index + 1}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.accordionContent}>
            <View style={styles.accordionInner}>
              <View>
                <Text style={{ marginVertical: 5, fontSize: 15 }}>Total Amount -: INR {item.orderAmount}</Text>
                <Text style={{ marginVertical: 5, fontSize: 15 }}>Tracking Number -: {item.orderDto.trackingNumber}</Text>

              </View>
              <View style={{ marginRight: 10 }}>
                <Image
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/455/455705.png',
                  }}
                  style={{ height: 20, width: 20 }}
                />
              </View>
            </View>
            <View style={styles.gradientContainer}>
              <LinearGradient colors={['#E8F9FF', '#D1F8EF']} style={{borderRadius: 10,margin: 5}}>
                {item.orderDto.productOrders[0].product.map((product, index) => (
                  <View key={index} style={styles.productDetailContainer}>
                    <View style={[styles.row, styles.borderBottom]}>
                      <Text style={[styles.tableHeader, { flex: 1 }]}>Product Name:</Text>
                      <Text style={[styles.tableCell, { flex: 2 }]}>{product.name}</Text>
                    </View>
                    <View style={[styles.row, styles.borderBottom]}>
                      <Text style={[styles.tableHeader, { flex: 1 }]}>Quantity:</Text>
                      <Text style={[styles.tableCell, { flex: 2 }]}>
                        {item.orderDto.productOrders[0].quantity || 0}
                      </Text>
                    </View>
                    <View style={[styles.row, styles.borderBottom]}>
                      <Text style={[styles.tableHeader, { flex: 1 }]}>Price:</Text>
                      <Text style={[styles.tableCell, { flex: 2 }]}>
                        {item.orderDto.productOrders[0].totalAmount || 0}
                      </Text>
                    </View>
                  </View>
                ))}
              </LinearGradient>
            </View>

          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={invoiceDataTab}
        keyExtractor={item => item.invoiceId.toString()}
        renderItem={renderInvoiceCard}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default InvoiceInfoTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2f4',
    padding: 10,
    marginTop: 10,
    width: '100%',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    width: '99%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between', // Space between elements
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  accordionContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#A1E3F9',
    padding: 5,
    borderRadius: 10
  },
  accordionInner: {
    width: '99%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between', // Space elements evenly
    alignItems: 'center',
  },
  textNumber: {
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 50,
    fontSize: 16,
    width: 20,
    height: 20,
    lineHeight: 20,
    backgroundColor: '#4c956c',
    color: '#fff',
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
