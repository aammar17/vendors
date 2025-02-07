// VendorScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

// Replace with your actual backend URL
import { API_URL } from '../utils/api';

const VendorScreen = () => {
  const navigation = useNavigation();

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  // Modal visibility states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [completeOrderModalOpen, setCompleteOrderModalOpen] = useState(false);

  // For category management
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // For product add/edit form
  const [productData, setProductData] = useState({
    id: '',
    title: '',
    description: '',
    regular_price: '',
    offer_price: '',
    category_id: '',
    stock_quantity: '',
    image: null, // image picked via ImagePicker
  });

  // Helper: Get the token from AsyncStorage (make sure your login stores it under 'authToken')
  const getToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  };

  // ---------------------- API CALLS ----------------------

  // Fetch products list
  const fetchProducts = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products.');
    }
  };

  // Fetch categories list
  const fetchCategories = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/categories`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories.');
    }
  };

  // Fetch pending orders
  const fetchOrders = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/orders`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        Alert.alert("Error", "Orders data is not an array: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders.');
    }
  };

  // Fetch completed orders
  const fetchCompletedOrders = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/complete-orders`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCompletedOrders(data);
      } else {
        Alert.alert("Error", "Completed orders data is not an array: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      Alert.alert('Error', 'Failed to fetch completed orders.');
    }
  };

  // ---------------------- EFFECTS ----------------------

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ---------------------- LOGOUT ----------------------

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    Alert.alert('Logged Out', 'Logged out successfully!');
    navigation.navigate('Login'); // Update with your login screen name
  };

  // ---------------------- CATEGORY MANAGEMENT ----------------------

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Category name cannot be empty.');
      return;
    }
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/categories/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Category added successfully.');
        setNewCategoryName('');
        fetchCategories();
      } else {
        Alert.alert('Error', data.message || 'Failed to add category.');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'An error occurred while adding category.');
    }
  };

  // Edit an existing category
  const handleEditCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      Alert.alert('Error', 'Category name cannot be empty.');
      return;
    }
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Category updated successfully.');
        setNewCategoryName('');
        setEditingCategory(null);
        fetchCategories();
      } else {
        Alert.alert('Error', data.message || 'Failed to update category.');
      }
    } catch (error) {
      console.error('Error editing category:', error);
      Alert.alert('Error', 'An error occurred while updating category.');
    }
  };

  // Delete a category
  const handleDeleteCategory = async (id) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchCategories();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to delete category.');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'An error occurred while deleting category.');
    }
  };

  // ---------------------- PRODUCT MANAGEMENT ----------------------

  // Submit product form (add or edit)
  const handleProductSubmit = async () => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('title', productData.title);
    formData.append('description', productData.description);
    formData.append('regular_price', productData.regular_price);
    formData.append('offer_price', productData.offer_price);
    formData.append('category_id', productData.category_id);
    formData.append('stock_quantity', productData.stock_quantity);

    if (productData.image) {
      const uriParts = productData.image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('image', {
        uri: productData.image.uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
      let response;
      if (productData.id) {
        // Edit product
        response = await fetch(`${API_URL}/products/${productData.id}`, {
          method: 'PUT',
          headers: {
            // Let fetch auto-set the multipart/form-data header
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // Add product
        response = await fetch(`${API_URL}/products/add`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Product saved successfully.');
        setProductModalOpen(false);
        fetchProducts();
      } else {
        Alert.alert('Error', data.message || 'Failed to save product.');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'An error occurred while saving product.');
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchProducts();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to delete product.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'An error occurred while deleting product.');
    }
  };

  // Open product modal for adding or editing
  const openProductModal = (product = {}) => {
    setProductData({
      id: product.id || '',
      title: product.title || '',
      description: product.description || '',
      regular_price: product.regular_price ? String(product.regular_price) : '',
      offer_price: product.offer_price ? String(product.offer_price) : '',
      category_id: product.category_id ? String(product.category_id) : '',
      stock_quantity: product.stock_quantity ? String(product.stock_quantity) : '',
      image: null,
    });
    setProductModalOpen(true);
  };

  // Pick image using Expo ImagePicker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Permission to access media library is needed.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.cancelled) {
      setProductData({ ...productData, image: result });
    }
  };

  // ---------------------- ORDER MANAGEMENT ----------------------

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Order status updated successfully.');
        fetchOrders();
      } else {
        Alert.alert('Error', data.message || 'Failed to update order.');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'An error occurred while updating order status.');
    }
  };

  // ---------------------- RENDER ----------------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Vendor Dashboard</Text>
      
      {/* Top Row Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => openProductModal()}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setCategoryModalOpen(true)}>
          <Text style={styles.buttonText}>Manage Categories</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => {
          setOrderModalOpen(true);
          fetchOrders();
        }}>
          <Text style={styles.buttonText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => {
          setCompleteOrderModalOpen(true);
          fetchCompletedOrders();
        }}>
          <Text style={styles.buttonText}>Completed Orders</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Vendor')}>
          <Text style={styles.buttonText}>Vendor</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <ScrollView vartical style={styles.productList}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Text style={styles.productText}>ID: {product.id}</Text>
            <Text style={styles.productText}>Title: {product.title}</Text>
            <Text style={styles.productText}>Quantity: {product.stock_quantity}</Text>
            {product.image_url ? (
              <Image source={{ uri: `${API_URL}${product.image_url}` }} style={styles.productImage} />
            ) : (
              <Text style={styles.productText}>No Image</Text>
            )}
            <Text style={styles.productText}>Price: ${product.regular_price}</Text>
            <Text style={styles.productText}>Offer: ${product.offer_price}</Text>
            <View style={styles.productButtonRow}>
              <TouchableOpacity style={styles.smallButton} onPress={() => openProductModal(product)}>
                <Text style={styles.smallButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton} onPress={() => handleDeleteProduct(product.id)}>
                <Text style={styles.smallButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ---------------------- CATEGORY MODAL ---------------------- */}
      <Modal visible={categoryModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Manage Categories</Text>
            <ScrollView style={styles.modalScroll}>
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryRow}>
                  <Text style={styles.categoryText}>{category.name}</Text>
                  <View style={styles.categoryButtonRow}>
                    <TouchableOpacity
                      style={styles.categoryButton}
                      onPress={() => {
                        setEditingCategory(category);
                        setNewCategoryName(category.name);
                      }}
                    >
                      <Text style={styles.categoryButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.categoryButton}
                      onPress={() => handleDeleteCategory(category.id)}
                    >
                      <Text style={styles.categoryButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TextInput
              style={styles.input}
              placeholder={editingCategory ? 'Edit Category' : 'Add Category'}
              value={newCategoryName}
              onChangeText={(text) => setNewCategoryName(text)}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={editingCategory ? handleEditCategory : handleAddCategory}
            >
              <Text style={styles.modalButtonText}>
                {editingCategory ? 'Save Changes' : 'Add Category'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton]}
              onPress={() => {
                setCategoryModalOpen(false);
                setEditingCategory(null);
                setNewCategoryName('');
              }}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------------------- PRODUCT MODAL ---------------------- */}
     <Modal visible={productModalOpen} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <ScrollView>
        <Text style={styles.modalHeader}>
          {productData.id ? 'Edit Product' : 'Add Product'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={productData.title}
          onChangeText={(text) => setProductData({ ...productData, title: text })}
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Description"
          value={productData.description}
          onChangeText={(text) => setProductData({ ...productData, description: text })}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Regular Price"
          keyboardType="numeric"
          value={productData.regular_price}
          onChangeText={(text) => setProductData({ ...productData, regular_price: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Offer Price"
          keyboardType="numeric"
          value={productData.offer_price}
          onChangeText={(text) => setProductData({ ...productData, offer_price: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Category ID"
          keyboardType="numeric"
          value={productData.category_id}
          onChangeText={(text) => setProductData({ ...productData, category_id: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Stock Quantity"
          keyboardType="numeric"
          value={productData.stock_quantity}
          onChangeText={(text) => setProductData({ ...productData, stock_quantity: text })}
        />
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>
            {productData.image ? 'Change Image' : 'Pick Image'}
          </Text>
        </TouchableOpacity>
        {productData.image && (
          <Image source={{ uri: productData.image.uri }} style={styles.imagePreview} />
        )}
        <TouchableOpacity style={styles.modalButton} onPress={handleProductSubmit}>
          <Text style={styles.modalButtonText}>
            {productData.id ? 'Save Changes' : 'Add Product'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, styles.modalCloseButton]}
          onPress={() => setProductModalOpen(false)}
        >
          <Text style={styles.modalButtonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </View>
</Modal>


      {/* ---------------------- ORDERS MODAL ---------------------- */}
      <Modal visible={orderModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '80%' }]}>
            <ScrollView>
              <Text style={styles.modalHeader}>Orders</Text>
              {orders.length === 0 ? (
                <Text>No orders found.</Text>
              ) : (
                orders.map((order) => (
                  <View key={order.id} style={styles.orderRow}>
                    <Text style={styles.orderText}>Order ID: {order.id}</Text>
                    <Text style={styles.orderText}>User: {order.username || order.user_id}</Text>
                    <Text style={styles.orderText}>Total: ${order.total_amount}</Text>
                    <Text style={styles.orderText}>Address: {order.address}</Text>
                    <Text style={styles.orderText}>Phone: {order.phone}</Text>
                    <Text style={styles.orderText}>Email: {order.email}</Text>
                    <Text style={styles.orderText}>Status: {order.status}</Text>
                    <View style={styles.orderButtonRow}>
                      <TouchableOpacity style={styles.smallButton} onPress={() => handleUpdateStatus(order.id, 'pending')}>
                        <Text style={styles.smallButtonText}>Pending</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.smallButton} onPress={() => handleUpdateStatus(order.id, 'accepted')}>
                        <Text style={styles.smallButtonText}>Accepted</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.smallButton} onPress={() => handleUpdateStatus(order.id, 'delivered')}>
                        <Text style={styles.smallButtonText}>Delivered</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton]}
              onPress={() => setOrderModalOpen(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------------------- COMPLETED ORDERS MODAL ---------------------- */}
      <Modal visible={completeOrderModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '80%' }]}>
            <ScrollView>
              <Text style={styles.modalHeader}>Completed Orders</Text>
              {completedOrders.length === 0 ? (
                <Text>No completed orders found.</Text>
              ) : (
                completedOrders.map((order) => (
                  <View key={order.id} style={styles.orderRow}>
                    <Text style={styles.orderText}>Order ID: {order.id}</Text>
                    <Text style={styles.orderText}>User: {order.user_id}</Text>
                    <Text style={styles.orderText}>
                      Total: ${Number(order.total_amount).toFixed(2)}
                    </Text>
                    <Text style={styles.orderText}>Address: {order.address}</Text>
                    <Text style={styles.orderText}>Phone: {order.phone}</Text>
                    <Text style={styles.orderText}>Email: {order.email}</Text>
                    <Text style={styles.orderText}>Status: {order.status}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton]}
              onPress={() => setCompleteOrderModalOpen(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#00aced',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
productList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16, // Padding on both sides
    marginVertical: 16,
  },
 productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16, // Space between products
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
   imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 14,
  },
  productInfo: {
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
  productOffer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  productStock: {
    fontSize: 14,
    color: '#27AE60',
  },
  productButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallButton: {
    backgroundColor: '#888',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalScroll: {
    maxHeight: 200,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  categoryButtonRow: {
    flexDirection: 'row',
  },
  categoryButton: {
    backgroundColor: '#00aced',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  modalButton: {
    backgroundColor: '#00aced',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#888',
  },
  imagePreview: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 12,
  },
  orderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },
  orderText: {
    fontSize: 12,
  },
  orderButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
});

export default VendorScreen;
