import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import apiInstance from '../../../api';
import InvoiceInfoTab from './InvoiceInfoTab';

const InvoiceInfo = () => {
  const {userData} = useSelector(state => state.crmUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceDataTab,setInvoiceDataTab] = useState([])

  useEffect(() => {
    fetchInvoiceData();
    fetchInvoices()
  }, []);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      const response = await apiInstance.get(
        `/invoice/invoideCOunt/${
          userData.roleDto.roleName === 'Closer' ? userData.userId : 0
        }`,
      );
      console.log('Invoice Data:', response.data); // Log response to verify structure
      setInvoiceData(response.data);
    } catch (err) {
      setError('Failed to fetch invoice data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await apiInstance.get(
        `/invoice/getAssInvoice/${ userData.userId}`
      );
      console.log(response.data);
      setInvoiceDataTab(response.data)
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Failed to fetch invoices");
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
              backgroundColor: '#90e0ef',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <Text style={{textAlign:'center', fontWeight: 600 , fontSize:16 }}>Total      Invoices</Text>
          <Text style={styles.textNumber}>{invoiceData?.totalInvoices || 'N/A'}</Text>
        </View>
        {/* Second Card */}
        <View
          style={[
            styles.card,
            {
                backgroundColor: '#c38e70',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <Text style={{textAlign:'center', fontWeight:600 ,fontSize:16}}>Paid     Invoices</Text>
          <Text style={styles.textNumber}>{invoiceData && invoiceData.totalPaidInvoices}</Text>
        </View>
        {/* Third Card */}
        <View
          style={[
            styles.card,
            {
          
              backgroundColor: '#ffccd5',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <Text style={{textAlign:'center', fontWeight:600 ,fontSize:16}}>Pending Invoices</Text>
          <Text style={styles.textNumber}>{invoiceData && invoiceData.totalPendingInvoices}</Text>
        </View>
        {/* Fourth Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: '#805b10',
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <Text style={{fontSize:16}}>Awaiting Tracking</Text>
          <Text style={styles.textNumber}>
            {invoiceData && invoiceData.totalAwaitingPaidInvoices}
          </Text>
        </View>
      </View>
      <InvoiceInfoTab/>
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
    justifyContent: 'space-evenly',
    width: '100%',
    position:'fixed'
  },
  card: {
    width: '22%', // Slightly less than 25% to allow spacing
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textNumber: {
    textAlign: 'center',
    marginTop: 2,   
    paddingHorizontal: 0, // Remove extra horizontal padding
    paddingVertical: 0, // Remove extra vertical padding
    borderRadius: 50, // Half the size of width/height for a perfect circle
    fontSize: 16,
    width: 30, // Set a fixed width for the circle
    height: 30, // Equal height to match the width
    lineHeight: 30, // Center the text vertically
    backgroundColor:'#013a63',
    color:'#fff'
  },
  
});
