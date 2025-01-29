import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import apiInstance from '../../../api';

const ProductInfo = () => {
  const [product, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchProductImages();
    console.log('product', product);
  }, []);
  const fetchProducts = async () => {
    try {
      const response = await apiInstance.get('/product/getAllProducts');

      if (response.data?.dtoList) {
        setProducts(response.data.dtoList);
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError(err.message || 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };
  const fetchProductImages = async productId => {
    try {
      const response = await apiInstance.get(`/images/getProductImages`);
      setImages(response.data);
      console.log('image', response.data);
    } catch (error) {
      setImages([]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={true}
        nestedScrollEnabled={true}>
        {product &&
          product.map((ele, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.row}>
                {images &&
                  images.map((img, index) => {
                    console.log(img)
                    // return (
                    //   <Image
                    //     key={index} // Make sure to add a unique key for each image
                    //     source={{
                    //       uri: `https://image.rdvision.in/images/image/${img}`,
                    //     }}
                    //     style={{width: 70, height: 70}}
                    //   />
                    // );
                  })}

                <View style={styles.tableContainer}>
                  {/* Table Data */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell1}>Name</Text>
                    <Text style={styles.tableCell2}>{ele.name}</Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell1}>Category</Text>
                    <Text style={styles.tableCell2}>{ele.category}</Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell1}>Generic Name</Text>
                    <Text style={styles.tableCell2}>{ele.genericName}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell1}>Brand</Text>
                    <Text style={styles.tableCell2}>{ele.brand}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell1}>Strength</Text>
                    <Text style={styles.tableCell2}>{ele.strength}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell1}> Packaging Sizes </Text>
                    <Text style={styles.tableCell2}>{ele.packagingSize}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell1}> Packaging Types</Text>
                    <Text style={styles.tableCell2}>{ele.packagingType}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell1}> Composition </Text>
                    <Text style={styles.tableCell2}>{ele.composition}</Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell1}> Treatment </Text>
                    <Text style={styles.tableCell2}>{ele.treatment}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
};

export default ProductInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf2f4',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableContainer: {
    flex: 1,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#e8e8e4',
    borderRadius: 5,
    overflow: 'hidden', // Ensures borders align properly
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e4',
  },
  tableHeader: {
    backgroundColor: '#25a18e',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#25a18e',
  },
  tableCell1: {
    flex: 1,
    padding: 6,
    textAlign: 'center',
    borderRightWidth: 1, // Vertical border
    borderRightColor: '#e8e8e4',
    fontWeight: 600,
    textAlign: 'left',
  },
  tableCell2: {
    flex: 1,
    padding: 6,
    textAlign: 'center',
    borderRightWidth: 1, // Vertical border
    borderRightColor: '#e8e8e4',
    textAlign: 'left',
  },
  tableCellLast: {
    borderRightWidth: 0, // Removes border from the last column
  },
});
