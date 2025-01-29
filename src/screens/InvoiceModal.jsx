import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import AddressForm from './InvoiceModal/AddressForm';
import AddProduct from './InvoiceModal/AddProduct';

const InvoiceModal = ({data, closeModal}) => {
  const {width, height} = Dimensions.get('window'); // Get full screen dimensions
  const [loading, setLoading] = useState(false);
  console.log('invoice', data);
  return (
    <ScrollView>
      <View style={[styles.container, {width: width, height: height}]}>
        <Text style={{textAlign: 'center', fontSize: 20}}>Raise Invoice</Text>
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
              <View style={{display: 'flex', flexDirection: 'row'}}>
                <Text style={{paddingHorizontal: 11}}>
                  {data.queryMcatName}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {/* add product */}
        <AddProduct />
        {/* address form */}
        <AddressForm />

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={closeModal}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={loading}>
            <Text style={styles.emailButton}>
              {loading ? 'Updating...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
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
});
