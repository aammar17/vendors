import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Fetch cart items from API
  const fetchCartItems = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/users/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => setCartItems(data))
        .catch(error => console.error('Error fetching cart items:', error));
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [])
  );

  // Handle update cart quantity (increment or decrement)
  const updateCartQuantity = async (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    const token = await AsyncStorage.getItem('token');
    fetch(`${API_URL}/users/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        cart_id: cartId,
        quantity: newQuantity,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Cart updated successfully') {
          const updatedCart = cartItems.map(item => 
            item.cart_id === cartId ? { ...item, quantity: newQuantity } : item
          );
          setCartItems(updatedCart);
        } else {
          Alert.alert('Error', 'Could not update cart item');
        }
      })
      .catch(error => console.error('Error updating cart quantity:', error));
  };

  // Handle removing item from cart
  const removeFromCart = async (cartId) => {
    const token = await AsyncStorage.getItem('token');
    fetch(`${API_URL}/users/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        cart_id: cartId,
        quantity: 0,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Item removed from cart') {
          const filteredCart = cartItems.filter(item => item.cart_id !== cartId);
          setCartItems(filteredCart);
        } else {
          Alert.alert('Error', 'Could not remove item');
        }
      })
      .catch(error => console.error('Error removing item:', error));
  };

  // Handle checkout
  const handleCheckout = async () => {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('user_id');

    if (!address || !phone || !email) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    // Prepare checkout data
    const checkoutData = {
      user_id: userId,
      address,
      phone,
      email,
    };

    fetch(`${API_URL}/users/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(checkoutData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Order placed successfully') {
          Toast.show({
            type: 'success',
            text1: 'Order placed successfully!',
            text2: 'Your order has been successfully completed.',
          });
          setCartItems([]); // Clear cart after checkout
          setModalVisible(false); // Close checkout modal
        } else {
          Alert.alert('Error', 'Something went wrong during checkout');
        }
      })
      .catch(error => {
        console.error('Checkout error:', error);
        Alert.alert('Error', 'Something went wrong during checkout');
      });
  };

  // Calculate the total price
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  // Render each cart item
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.cartItemTitle}>{item.product_name}</Text>
      <Text style={styles.cartItemPrice}>${item.price}</Text>

      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => updateCartQuantity(item.cart_id, item.quantity - 1)}>
          <Ionicons name="remove-circle" size={24} color="red" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => updateCartQuantity(item.cart_id, item.quantity + 1)}>
          <Ionicons name="add-circle" size={24} color="green" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.cart_id)}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={item => item.cart_id.toString()}
      />

      <Text style={styles.totalPrice}>Total: ${calculateTotalPrice()}</Text>

      <TouchableOpacity style={styles.checkoutButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
      </TouchableOpacity>

      {/* Checkout Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Enter your address"
              style={styles.input}
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              placeholder="Enter your phone number"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleCheckout}
            >
              <Text style={styles.confirmButtonText}>Confirm Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast Notifications */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingLeft: 15,
    marginBottom: 10,
  },
  cartItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
  },
  cartItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 16,
    color: '#888',
    marginVertical: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#f44336',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    paddingLeft: 10,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});


export default CartScreen;