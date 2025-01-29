import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import React, { useState } from 'react';
import AddProductModal from './AddProductModal';
import apiInstance from '../../../api';

const AddProduct = () => {

    const [addproductModal,setAddProductModal] = useState(false)
    const [products,setProducts] = useState([])
    const [error,setError] = useState()



    

  const handleAddProduct = () => {
    setAddProductModal(true)
  };

  const closeProductModal = () => {
    setAddProductModal(false)
  };
  return (
    <View style={styles.container}>
      <View style={{paddingVertical:5}}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddProduct()}>
          <Text style={{color: '#fff', fontSize: 15}}>Add Product</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.emailModal}>
        {addproductModal && <AddProductModal closeModal={closeProductModal} />}
      </View>
    </View>
  );
};

export default AddProduct;

const styles = StyleSheet.create({
  container: {},
  addButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 12,
    paddingVertical: 5,
    color: '#fff',
    borderRadius:5,
    paddingVertical:8
  },
  emailModal: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
