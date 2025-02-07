import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { API_URL } from '../utils/api';
import { useNavigation } from '@react-navigation/native';

const ShopScreen = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // State for the selected product
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch products
    fetch(`${API_URL}/users/products`)
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      });
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lowerCaseQuery = query.toLowerCase();
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredProducts(filtered);
    }
  };

  const addToCart = async (productId) => {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('user_id');

    if (!token || !userId) {
      Toast.show({
        type: 'error',
        text1: 'Login Required',
        text2: 'You must be logged in to add items to the cart.',
      });
      navigation.navigate('Profile');
      return;
    }

    const quantity = 1; // Default quantity
    fetch(`${API_URL}/users/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        quantity,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Added to cart successfully') {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Product has been added to your cart.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Something went wrong. Please try again.',
          });
        }
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong. Please try again.',
        });
      });
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsModalVisible(false);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity onPress={() => openProductModal(item)} style={styles.productCard}>
      <Image source={{ uri: `${API_URL}${item.image_url}` }} style={styles.productImage} />
      <Text style={styles.productTitle}>{item.title}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.regularPrice}>${item.regular_price}</Text>
        <Text style={styles.offerPrice}>${item.offer_price}</Text>
      </View>
      <TouchableOpacity
      style={styles.addToCartButton}
      onPress={() => addToCart(item.id)} // Call the addToCart function with the product ID
    >
      <Text style={styles.buttonText}>Add to Cart</Text>
    </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productList}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />

      {/* Product Modal */}
      {selectedProduct && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeProductModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Image
                  source={{ uri: `${API_URL}${selectedProduct.image_url}` }}
                  style={styles.modalProductImage}
                />
                <Text style={styles.modalProductTitle}>{selectedProduct.title}</Text>
                <Text style={styles.productDescription}>{selectedProduct.description}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.regularPrice}>${selectedProduct.regular_price}</Text>
                  <Text style={styles.offerPrice}>${selectedProduct.offer_price}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={() => {
                    addToCart(selectedProduct.id);
                    closeProductModal();
                  }}
                >
                  <Text style={styles.buttonText}>Add to Cart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={closeProductModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  searchBar: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  productList: {
    paddingHorizontal: 10,
  },
  productCard: {
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  regularPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  offerPrice: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  modalProductImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalProductTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ShopScreen;
