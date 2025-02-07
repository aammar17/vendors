// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = () => {
  // Toggle between buyer and vendor modes
  const [userType, setUserType] = useState('buyer'); // 'buyer' or 'vendor'
  // Toggle between login and registration forms
  const [isRegistering, setIsRegistering] = useState(false);
  // Track whether the user is logged in
  const [loggedIn, setLoggedIn] = useState(false);
  // Toggle edit mode (for updating profile information)
  const [editMode, setEditMode] = useState(false);
  const navigation = useNavigation();

  // --- Buyer State ---
  const [buyerUsername, setBuyerUsername] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [buyerName, setBuyerName] = useState('');

  // --- Vendor State ---
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorDokanName, setVendorDokanName] = useState('');

  // On mount, load profile info from AsyncStorage if logged in
  useEffect(() => {
    const loadProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setLoggedIn(true);
        const role = await AsyncStorage.getItem('role');
        setUserType(role);
        const storedName = await AsyncStorage.getItem('user_name');
        if (role === 'buyer') {
          setBuyerUsername(storedName || '');
          setBuyerName(storedName || '');
        } else if (role === 'vendor') {
          setVendorName(storedName || '');
          const storedEmail = await AsyncStorage.getItem('vendor_email');
          const storedPhone = await AsyncStorage.getItem('vendor_phone');
          const storedDokanName = await AsyncStorage.getItem('vendor_dokanName');
          if (storedEmail) setVendorEmail(storedEmail);
          if (storedPhone) setVendorPhone(storedPhone);
          if (storedDokanName) setVendorDokanName(storedDokanName);
        }
      }
    };
    loadProfile();
  }, [loggedIn]);

  // ===== Buyer Login / Registration =====
  const handleBuyerLogin = () => {
    fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: buyerUsername, password: buyerPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          AsyncStorage.setItem('token', data.token);
          AsyncStorage.setItem('user_id', data.user_id.toString());
          AsyncStorage.setItem('user_name', data.username);
          AsyncStorage.setItem('role', 'buyer');
          setLoggedIn(true);
          navigation.navigate('Home');
        } else {
          Alert.alert('Login failed', 'Please check your credentials');
        }
      })
      .catch((error) => {
        console.error('Buyer Login Error:', error);
        Alert.alert('Login failed', 'An error occurred while logging in');
      });
  };

  const handleBuyerRegister = () => {
    fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: buyerName, username: buyerUsername, password: buyerPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'User registered successfully') {
          Alert.alert('Registration successful', 'Please log in.');
          setIsRegistering(false);
        } else {
          Alert.alert('Registration failed', 'Username already exists.');
        }
      })
      .catch((error) => {
        console.error('Buyer Registration Error:', error);
        Alert.alert('Registration failed', 'An error occurred during registration');
      });
  };

  // ===== Vendor Login / Registration =====
  const handleVendorLogin = () => {
    fetch(`${API_URL}/vendors/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: vendorEmail, password: vendorPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Since the backend returns only a token, we rely on the form inputs for vendor details.
        if (data.token) {
          AsyncStorage.setItem('token', data.token);
          // Note: Since the backend does not return vendor details, we use the current state values.
          // It is recommended that you update your backend to return full vendor details.
          AsyncStorage.setItem('user_id', ''); // Vendor ID not available from login response
          AsyncStorage.setItem('user_name', vendorName || vendorEmail);
          AsyncStorage.setItem('role', 'vendor');
          AsyncStorage.setItem('vendor_email', vendorEmail);
          AsyncStorage.setItem('vendor_phone', vendorPhone);
          AsyncStorage.setItem('vendor_dokanName', vendorDokanName);
          setLoggedIn(true);
          navigation.navigate('Home');
        } else {
          Alert.alert('Login failed', 'Invalid credentials');
        }
      })
      .catch((error) => {
        console.error('Vendor Login Error:', error);
        Alert.alert('Login failed', 'An error occurred while logging in');
      });
  };

  const handleVendorRegister = () => {
    fetch(`${API_URL}/vendors/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendor_name: vendorName,
        phone: vendorPhone,
        dokan_name: vendorDokanName,
        email: vendorEmail,
        password: vendorPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Vendor registered successfully') {
          Alert.alert('Registration successful', 'Please log in.');
          setIsRegistering(false);
        } else {
          Alert.alert('Registration failed', 'Vendor already exists.');
        }
      })
      .catch((error) => {
        console.error('Vendor Registration Error:', error);
        Alert.alert('Registration failed', 'An error occurred during registration');
      });
  };

  // ===== Logout =====
  const handleLogout = () => {
    AsyncStorage.multiRemove([
      'token',
      'user_id',
      'user_name',
      'role',
      'vendor_email',
      'vendor_phone',
      'vendor_dokanName',
    ]);
    setLoggedIn(false);
    setEditMode(false);
    navigation.navigate('Home');
    Alert.alert('Logged out', 'You have logged out successfully!');
  };

  // ===== Save Profile Updates =====
  const handleSaveProfile = async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (userType === 'buyer') {
      fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: buyerName, username: buyerUsername }),
      })
        .then((response) => response.json())
        .then(() => {
          Alert.alert('Profile updated successfully');
          AsyncStorage.setItem('user_name', buyerName);
          setEditMode(false);
        })
        .catch((error) => {
          console.error('Error updating buyer profile:', error);
          Alert.alert('Error updating profile');
        });
    } else if (userType === 'vendor') {
      fetch(`${API_URL}/vendors/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_name: vendorName,
          phone: vendorPhone,
          dokan_name: vendorDokanName,
          email: vendorEmail,
          password: vendorPassword, // include if you want to update the password
        }),
      })
        .then((response) => response.json())
        .then(() => {
          Alert.alert('Profile updated successfully');
          AsyncStorage.setItem('user_name', vendorName);
          AsyncStorage.setItem('vendor_email', vendorEmail);
          AsyncStorage.setItem('vendor_phone', vendorPhone);
          AsyncStorage.setItem('vendor_dokanName', vendorDokanName);
          setEditMode(false);
        })
        .catch((error) => {
          console.error('Error updating vendor profile:', error);
          Alert.alert('Error updating profile');
        });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Icon name="user-circle" size={50} color="#007BFF" style={styles.icon} />
      </View>
      {!loggedIn ? (
        <View style={styles.authForm}>
          {/* Toggle between Buyer and Vendor */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'buyer' && styles.selectedUserType]}
              onPress={() => setUserType('buyer')}
            >
              <Text style={styles.userTypeText}>Buyer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'vendor' && styles.selectedUserType]}
              onPress={() => setUserType('vendor')}
            >
              <Text style={styles.userTypeText}>Vendor</Text>
            </TouchableOpacity>
          </View>
          {userType === 'buyer' ? (
            <>
              {isRegistering ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={buyerName}
                    onChangeText={setBuyerName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={buyerUsername}
                    onChangeText={setBuyerUsername}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={buyerPassword}
                    onChangeText={setBuyerPassword}
                  />
                  <TouchableOpacity style={styles.submitButton} onPress={handleBuyerRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsRegistering(false)}>
                    <Text style={styles.switchFormText}>Already have an account? Log in</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={buyerUsername}
                    onChangeText={setBuyerUsername}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={buyerPassword}
                    onChangeText={setBuyerPassword}
                  />
                  <TouchableOpacity style={styles.submitButton} onPress={handleBuyerLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsRegistering(true)}>
                    <Text style={styles.switchFormText}>Don't have an account? Register here</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <>
              {isRegistering ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Vendor Name"
                    value={vendorName}
                    onChangeText={setVendorName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    value={vendorPhone}
                    onChangeText={setVendorPhone}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Dokan Name"
                    value={vendorDokanName}
                    onChangeText={setVendorDokanName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={vendorEmail}
                    onChangeText={setVendorEmail}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={vendorPassword}
                    onChangeText={setVendorPassword}
                  />
                  <TouchableOpacity style={styles.submitButton} onPress={handleVendorRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsRegistering(false)}>
                    <Text style={styles.switchFormText}>Already have an account? Log in</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={vendorEmail}
                    onChangeText={setVendorEmail}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={vendorPassword}
                    onChangeText={setVendorPassword}
                  />
                  <TouchableOpacity style={styles.submitButton} onPress={handleVendorLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsRegistering(true)}>
                    <Text style={styles.switchFormText}>Don't have an account? Register here</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      ) : (
        <View style={styles.profileInfo}>
          {!editMode ? (
            <>
              {userType === 'buyer' ? (
                <View>
                  <Text style={styles.profileText}>Full Name: {buyerName}</Text>
                  <Text style={styles.profileText}>Username: {buyerUsername}</Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.profileText}>Vendor Name: {vendorName}</Text>
                  <Text style={styles.profileText}>Email: {vendorEmail}</Text>
                  <Text style={styles.profileText}>Phone: {vendorPhone}</Text>
                  <Text style={styles.profileText}>Dokan Name: {vendorDokanName}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {userType === 'buyer' ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={buyerName}
                    onChangeText={setBuyerName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={buyerUsername}
                    onChangeText={setBuyerUsername}
                  />
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Vendor Name"
                    value={vendorName}
                    onChangeText={setVendorName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={vendorEmail}
                    onChangeText={setVendorEmail}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    value={vendorPhone}
                    onChangeText={setVendorPhone}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Dokan Name"
                    value={vendorDokanName}
                    onChangeText={setVendorDokanName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={vendorPassword}
                    onChangeText={setVendorPassword}
                  />
                </>
              )}
              <TouchableOpacity style={styles.submitButton} onPress={handleSaveProfile}>
                <Text style={styles.buttonText}>Save Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={() => setEditMode(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  authForm: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#FF4D4D',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  switchFormText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
    color: '#007BFF',
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  userTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedUserType: {
    backgroundColor: '#007BFF',
  },
  userTypeText: {
    color: '#fff',
    fontSize: 16,
  },
  profileInfo: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  profileText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default ProfileScreen;
