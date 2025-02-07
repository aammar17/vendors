import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper'; // Import Swiper
import { useNavigation } from '@react-navigation/native';

const banners = [
  'https://static.vecteezy.com/system/resources/thumbnails/011/871/820/small_2x/online-shopping-on-phone-buy-sell-business-digital-web-banner-application-money-advertising-payment-ecommerce-illustration-search-vector.jpg',
  'https://www.shutterstock.com/image-vector/3d-yellow-great-discount-sale-260nw-2056851839.jpg',
  'https://www.zilliondesigns.com/blog/wp-content/uploads/Perfect-Ecommerce-Sales-Banner-1280x720.jpg',
];

const marketingCards = [
  { id: 1, title: 'Best Sellers', image: 'https://storage.googleapis.com/gcs-cockpit-prod/uploads/530/1654253525.png', navigateTo: 'Shop' },
  { id: 2, title: 'New Arrivals', image: 'https://png.pngtree.com/png-clipart/20210801/original/pngtree-new-arrival-poster-png-image_6593505.jpg', navigateTo: 'Shop' },
  { id: 3, title: 'Discount Deals', image: 'https://i.pinimg.com/1200x/20/33/82/203382dd496fd81ece3ea88cbc9d9a8d.jpg', navigateTo: 'Shop' },
  { id: 4, title: 'Top Rated', image: 'https://t3.ftcdn.net/jpg/00/91/65/36/360_F_91653664_J0p1wW5eT9h6T581dpJk21anj6jURNQb.jpg', navigateTo: 'Shop' },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Sliding Banner */}
      <View style={styles.bannerSlider}>
        <Swiper
          autoplay
          autoplayTimeout={3}
          showsPagination
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
        >
          {banners.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.bannerImage} />
          ))}
        </Swiper>
      </View>

      {/* Marketing Section */}
      <View style={styles.marketingContainer}>
        {marketingCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => navigation.navigate(card.navigateTo)}
          >
            <Image source={{ uri: card.image }} style={styles.cardImage} />
            <Text style={styles.cardText}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Shop Now Button */}
      <TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate('Shop')}>
        <Text style={styles.shopNowButtonText}>Shop Now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bannerSlider: {
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  dot: {
    backgroundColor: '#ccc',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007BFF',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  marketingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shopNowButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    margin: 20,
  },
  shopNowButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
