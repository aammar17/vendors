// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Import your screen components
import HomeScreen from './screens/HomeScreen';
import ShopScreen from './screens/ShopScreen';
import CartScreen from './screens/CartScreen';
import ProfileScreen from './screens/ProfileScreen';
import VendorScreen from './screens/VendorScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  const [userRole, setUserRole] = useState(null);

  // Function to load the user role from AsyncStorage
  const loadRole = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role);
    } catch (err) {
      console.error('Error loading role', err);
    }
  };

  // Optionally, load the role on mount
  useEffect(() => {
    loadRole();
  }, []);

  return (
    <NavigationContainer onStateChange={loadRole}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Shop') iconName = 'pricetag';
            else if (route.name === 'Cart') iconName = 'cart';
            else if (route.name === 'Profile') iconName = 'person';
            else if (route.name === 'Vendor') iconName = 'briefcase';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Shop" component={ShopScreen} />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        {userRole === 'vendor' && (
          <Tab.Screen name="Vendor" component={VendorScreen} />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
