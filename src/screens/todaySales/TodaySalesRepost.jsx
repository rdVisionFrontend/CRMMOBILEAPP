import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useSelector } from 'react-redux';

const TodaySalesRepost = () => {
  const { userData } = useSelector(state => state.crmUser);
  const [todaySale, setToDaySale] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null); // To track which card is expanded

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true); // Start loading before fetching data
    const user = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('jwtToken');
    const storedUser = JSON.parse(user);

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
      console.log('Today sales data:', response.data);
      setToDaySale(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch invoices. Please try again.');
    } finally {
      setLoading(false); // Stop loading after data is fetched
    }
  };

  const formatDate = dateArray => {
    const [year, month, day] = dateArray;
    return `${day < 10 ? `0${day}` : day}-${month < 10 ? `0${month}` : month}-${year}`;
  };

  const handleCardPress = index => {
    // Toggle the expanded state for the clicked card
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* Show Loader while fetching data */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <HeaderItem title="Name" />
            <HeaderItem title="Address" />
            <HeaderItem title="Date" />
          </View>

          {todaySale.length > 0 ? (
            todaySale.map((ele, index) => {
              const isExpanded = expandedIndex === index; // Check if the card is expanded
              return (
                <View style={{alignItems: 'center'}}>
                  <View style={styles.card} key={index}>
                  <TouchableOpacity onPress={() => handleCardPress(index)}>
                    <View style={styles.cardRow}>
                      <Text style={styles.nameText}>{ele.customerName}</Text>
                      <Text style={styles.addressText}>{ele.address?.landmark}</Text>
                      <Text style={styles.dateText}>{formatDate(ele.invoiceCreateDate)}</Text>
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <DetailRow label="Doses" value={ele.orderDto.productOrders[0].product.map(product => product.strength).join(', ')} />
                      <DetailRow label="Amount" value={`INR ${ele.orderDto.totalPayableAmount}`} />
                      <DetailRow
                        label="Address"
                        value={`${ele.address?.city}, ${ele.address?.state}, ${ele.address?.country}, ${ele.address?.zipCode}`}
                      />

                      {ele.orderDto.productOrders[0].product.map((product, index) => (
                        <ProductDetails key={index} product={product} order={ele.orderDto.productOrders[0]} />
                      ))}
                    </View>
                  )}
                </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noDataText}>No sales data available.</Text>
          )}
        </View>
      )}
    </View>
  );
};

// Reusable Header Item Component
const HeaderItem = ({ title }) => (
  <View style={styles.headerItem}>
    <Text style={styles.headerText}>{title}</Text>
    <Image
      source={{ uri: 'https://cdn-icons-png.flaticon.com/128/14034/14034783.png' }}
      style={styles.headerIcon}
    />
  </View>
);

// Reusable Detail Row Component
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// Reusable Product Details Component
const ProductDetails = ({ product, order }) => (
  <View style={styles.productDetailContainer}>
    <DetailRow label="Product Name" value={product.name} />
    <DetailRow label="Quantity" value={order.quantity || 0} />
    <DetailRow label="Price" value={order.totalAmount || 0} />
  </View>
);

export default TodaySalesRepost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2f4',
    width: '100%',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerIcon: {
    width: 20,
    height: 20,
  },
  card: {
    width: '98%',
    padding: 10,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    elevation: 10
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  nameText: {
    width: '42%',
    fontWeight: '600',
  },
  addressText: {
    width: '42%',
    textTransform: 'capitalize',
  },
  dateText: {
    width: '42%',
    color: '#2f195f',
    fontWeight: '600',
    paddingRight: 5
  },
  expandedContent: {
    padding: 10,
    marginTop: 10,
    backgroundColor: '#f9f4f5',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailValue: {
    marginLeft: 5,
  },
  productDetailContainer: {
    padding: 10,
    width: '100%',
    backgroundColor: '#CDF5FD',
    marginTop: 10,
    borderRadius: 10
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#555',
  },
});
