import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import React, { useState } from 'react';
import AddProductModal from './AddProductModal';
import apiInstance from '../../../api';
import AddressForm from './AddressForm';

const AddProduct = ({ticketId }) => {

    const [addproductModal,setAddProductModal] = useState(false)
    const [products,setProducts] = useState([])
    const [error,setError] = useState()

    
 

  const closeProductModal = () => {
    setAddProductModal(false)
  };
  return (
    <View style={styles.container}>   
       <AddProductModal/> 
      <View style={styles.emailModal}>
        {addproductModal && <AddProductModal  ticketId={ticketId} closeModal={closeProductModal} />}
      </View>
      {/* <AddressForm/> */}
    </View>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  container: {
    backgroundColor:'#fff'
  },
  
  emailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
