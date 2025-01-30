import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AddressForm from './InvoiceModal/AddressForm';
import AddProduct from './InvoiceModal/AddProduct';
import apiInstance from '../../api';
import {useAuth} from '../Authorization/AuthContext';

const InvoiceModal = ({data, closeModal}) => {
  const {width, height} = Dimensions.get('window'); // Get full screen dimensions
  const [loading, setLoading] = useState(false);
  const [orderdetails, setOrderDetails] = useState([]);
  const {apicall, raiseInoice} = useAuth();
  const [addressData, setAddressData] = useState([]);
  console.log('invoice', data);
  useEffect(() => {
    fatchaddedproduct();
    fetchAddressDetails();
    if (raiseInoice ) {
      fetchAddressDetails();
      // closeModal();
    }
    if(apicall){
      fetchAddressDetails()
    }
  }, [apicall, raiseInoice]);

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
    } catch (err) {
      console.error('Error fetching address details:', err);
    }
  };

  return (
    <ScrollView >
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
          <TouchableOpacity disabled={loading}>
            <Text style={styles.emailButton}>
              {loading ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeModal}>
            <Text style={styles.closeButton}>Close</Text>
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
                <Text style={{paddingHorizontal: 11}}>{data.senderName}</Text>
              </View>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text style={{fontWeight: 'bold'}}>Email :</Text>
                <Text
                  style={{
                    paddingHorizontal: 11,
                    flexWrap: 'wrap',
                    width: '80%',
                  }}>
                  {data.senderEmail}
                </Text>
              </View>
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text style={{fontWeight: 'bold'}}>Mobile :</Text>
                <Text style={{paddingHorizontal: 11}}>{data.senderMobile}</Text>
              </View>
            </View>
            <View style={{borderWidth: 1, padding: 5, width: '50%'}}>
              <View style={{display: 'flex', flexDirection: 'column'}}>
                <Text style={{paddingHorizontal: 11 ,textTransform:'capitalize', fontWeight:'bold'}}>
                  {data.queryMcatName}
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

        <AddProduct ticketId={data.uniqueQueryId} />
        {/* address form */}
        {/* <AddressForm  /> */}
      </View>
    </ScrollView>
  );
};

export default InvoiceModal;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 10,
    justifyContent: 'start',
    alignItems: 'center',
    paddingBottom: 50, // Add this
  },

  closeButton: {
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
});
