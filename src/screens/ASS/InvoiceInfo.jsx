import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import InvoiceInfoTab from './InvoiceInfoTab';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const InvoiceInfo = () => {
  const {userData} = useSelector(state => state.crmUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceDataTab, setInvoiceDataTab] = useState([]);

  useEffect(() => {
    fetchInvoiceData();
    fetchInvoices();
  }, []);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      // Retrieve user data and token from AsyncStorage
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('jwtToken');

      if (!user || !token) {
        throw new Error('User data or token not found');
      }

      const userData = JSON.parse(user);

      const response = await axios.get(
        `https://uatbackend.rdvision.tech/invoice/invoideCOunt/${
          userData.roleDto.roleName === 'Closer' ? userData.userId : 0
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Invoice Data:', response.data); // Log response to verify structure
      setInvoiceData(response.data);
    } catch (err) {
      setError('Failed to fetch invoice data');
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('jwtToken');
      const user = await AsyncStorage.getItem('user');
      const userData = JSON.parse(user);

      if (!token) {
        console.error('No authentication token found');
        setError('Authentication token missing');
        return;
      }

      // Make API request with the token in headers
      const response = await axios.get(
        `https://uatbackend.rdvision.tech/invoice/invoideCOunt/invoice/getAssInvoice/${userData.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in request
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Invoices:', response.data);
      setInvoiceDataTab(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to fetch invoices');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardRow}>
        {/* First Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: '#caf0f8',
              justifyContent: 'flex-start',
              alignItems: 'left',
              paddingHorizontal: 12,
            },
          ]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
            }}>
            <View style={{}}>
              <Text style={{fontWeight: 600, fontSize: 12}}>
                Total Invoices
              </Text>
              <Text style={styles.textNumber}>
                {invoiceData?.totalInvoices || 'N/A'}
              </Text>
            </View>
            <FontAwesome6 size={18} name="file-invoice" />
          </View>
        </View>

        {/* second card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: '#ece4db',
              justifyContent: 'flex-start',
              alignItems: 'left',
              paddingHorizontal: 12,
            },
          ]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
            }}>
            <View style={{}}>
              <Text style={{fontWeight: 600, fontSize: 12}}>Paid Invoices</Text>
              <Text style={styles.textNumber}>
                {invoiceData && invoiceData.totalPaidInvoices}
              </Text>
            </View>
            <FontAwesome6 size={18} name="file-invoice-dollar" />
          </View>
        </View>
        {/* third card */}

        <View
          style={[
            styles.card,
            {
              backgroundColor: '#ece4db',
              justifyContent: 'flex-start',
              alignItems: 'left',
              paddingHorizontal: 12,
            },
          ]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
            }}>
            <View style={{}}>
              <Text style={{fontWeight: 600, fontSize: 12}}>
                Pending Invoices
              </Text>
              <Text style={styles.textNumber}>
                {invoiceData && invoiceData.totalPendingInvoices}
              </Text>
            </View>
            <FontAwesome6 name="file-invoice-dollar" size={20} />
          </View>
        </View>

        {/* fourth card */}

        <View
          style={[
            styles.card,
            {
              backgroundColor: '#caf0f8',
              justifyContent: 'flex-start',
              alignItems: 'left',
              paddingHorizontal: 12,
            },
          ]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 4,
            }}>
            <View style={{}}>
              <Text style={{fontSize: 12, fontWeight: 600}}>
                Awaiting Tracking
              </Text>
              <Text style={styles.textNumber}>
                {invoiceData && invoiceData.totalAwaitingPaidInvoices}
              </Text>
            </View>
            <FontAwesome6 name="circle-notch" size={20} />
          </View>
        </View>
      </View>
      <InvoiceInfoTab />
    </View>
  );
};

export default InvoiceInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2f4',
    alignItems: 'center', // Center horizontally
    paddingTop: 20, // Push content to the top
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '100%',
    position: 'fixed',
    gap: 10,
  },
  card: {
    width: '45%', // Slightly less than 25% to allow spacing
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textNumber: {
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 0, // Remove extra horizontal padding
    paddingVertical: 0, // Remove extra vertical padding
    borderRadius: 50, // Half the size of width/height for a perfect circle
    fontSize: 12,
    width: 20, // Set a fixed width for the circle
    height: 20, // Equal height to match the width
    lineHeight: 20, // Center the text vertically
    backgroundColor: '#013a63',
    color: '#fff',
    marginLeft: 8,
  },
});
