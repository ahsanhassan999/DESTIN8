import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { mockPackages, mockWishlist } from '../../store/mockData';
import { Colors } from '../../theme';
import AppHeader from '../../components/AppHeader';

const { width } = Dimensions.get('window');

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState(mockWishlist);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter packages based on wishlist state
  const saved = mockPackages.filter(p => wishlist.includes(p.id));

  const filteredSaved = saved.filter(pkg => 
    pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    pkg.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader title="My Wishlist" navigation={navigation} />

      {/* Asymmetrical Background Orbs */}
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />
      <View style={styles.bgOrb3} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Page Title Section */}
        <View style={styles.headerSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>My Wishlist</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{saved.length} saved</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Your saved travel dreams</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="#7b757f" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved packages..."
            placeholderTextColor="rgba(123, 117, 127, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Wishlist Content */}
        {filteredSaved.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="favorite-border" size={64} color="rgba(82, 57, 111, 0.2)" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No matches found" : "No saved trips yet"}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery 
                ? "Try searching for a different destination or package title." 
                : "Tap the heart icon on any package to save it here."}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Explore')}
                style={styles.exploreBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.exploreBtnText}>Explore Packages</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredSaved.map(pkg => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('PackageDetail', { package: pkg })}
              >
                <Image source={{ uri: pkg.image }} style={styles.cardImg} />
                
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {pkg.title}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {pkg.destination} · {pkg.duration} Days
                  </Text>
                  <Text style={styles.cardPrice}>
                    ${pkg.price ? (pkg.price / 100).toFixed(0) : '1,250'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleWishlist(pkg.id)}
                  style={styles.removeBtn}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="favorite" size={24} color="#ba1a1a" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Suggestion Section */}
        <View style={styles.suggestionSection}>
          <Text style={styles.suggestionTitle}>Based on your dreams</Text>
          <View style={styles.suggestionCard}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLcOL5_Md5WsCR1-4sEBqmH7uckkSerjpIzQ_5ggTe_VGVYv9kcvUERbTzSArXBi89ouiKLq2Vxz_6EN6MKfnfYYalUSqFgrYhR7dsouwmcoh5k3Jty8YDZnahU57q6RS8oXOXfkcNUN6cDUfgYhIZi0NDg15ZxfSpfZUpDv4tFQUQYXeg7iyHhEJ6GpjeYhtwfNqqBjbjdm69kd7IG1K2ep1hT6xC3l3GLGDvAs2Ymj0OBMurinZ4fFRbm2rzh7gwuZUSjrbQ8p3x' }}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 0, y: 1 }}
            />
            
            <View style={styles.suggestionContent}>
              <View style={styles.suggestionBadge}>
                <Text style={styles.suggestionBadgeText}>Trending Gem</Text>
              </View>
              <Text style={styles.suggestionCardTitle}>Secret Lagoon Sanctuary</Text>
              <Text style={styles.suggestionCardSub}>Discover the untouched architecture of nature.</Text>
              
              <TouchableOpacity style={styles.viewDestBtn} activeOpacity={0.85}>
                <Text style={styles.viewDestText}>View Destination</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EEF5',
  },
  // Orb backgrounds
  bgOrb1: {
    position: 'absolute',
    top: 150,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#C9B8E8',
    opacity: 0.35,
    zIndex: 0,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 200,
    right: -80,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#b8baff',
    opacity: 0.3,
    zIndex: 0,
  },
  bgOrb3: {
    position: 'absolute',
    top: '55%',
    left: '25%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#e0d5f7',
    opacity: 0.25,
    zIndex: 0,
  },
  scroll: {
    paddingTop: 24,
  },

  // Page Title
  headerSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 32,
    color: '#191c1d',
  },
  countBadge: {
    backgroundColor: 'rgba(178, 156, 207, 0.2)', // lavender-light/20
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  countText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#52396f', // primary
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#4a454e',
    marginTop: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 18,
    color: '#191c1d',
  },
  emptyDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#4a454e',
    textAlign: 'center',
    lineHeight: 22,
  },
  exploreBtn: {
    backgroundColor: '#52396f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
  },
  exploreBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#ffffff',
  },

  // List of Saved Items
  list: {
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.10)',
  },
  cardImg: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 16,
    color: '#191c1d',
    marginBottom: 4,
  },
  cardMeta: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#4a454e',
    marginBottom: 6,
  },
  cardPrice: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#52396f',
  },
  removeBtn: {
    padding: 8,
  },

  // Suggestion Section
  suggestionSection: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  suggestionTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 24,
    color: '#191c1d',
    marginBottom: 20,
  },
  suggestionCard: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 4,
  },
  suggestionContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    gap: 12,
  },
  suggestionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  suggestionBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  suggestionCardTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 28,
    color: '#ffffff',
  },
  suggestionCardSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  viewDestBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#52396f',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 9999,
    gap: 8,
    shadowColor: 'rgba(106, 81, 136, 0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 4,
  },
  viewDestText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.10)',
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: '#191c1d',
    padding: 0,
  },
});
