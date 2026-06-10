import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Dimensions, ImageBackground, Animated,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.85;

const CATEGORIES = [
  { id: 'mountains', label: 'Mountains', icon: 'landscape' },
  { id: 'beaches', label: 'Beaches', icon: 'beach-access' },
  { id: 'cultural', label: 'Cultural', icon: 'museum' },
  { id: 'solo', label: 'Solo Trips', icon: 'person' },
  { id: 'family', label: 'Family', icon: 'family-restroom' },
];

export default function TravelerDashboardScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('mountains');
  const [compareList, setCompareList] = useState(new Set());
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const loadPackages = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await api.getPackages();
      setPackages(data);
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPackages(false);
    }, [loadPackages])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPackages(false);
  }, [loadPackages]);

  const mappedPackages = React.useMemo(() => {
    return packages.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      destination: pkg.destination,
      duration: `${pkg.duration_days} Days`,
      price: pkg.price < 10000 ? `$${pkg.price}` : `PKR ${pkg.price.toLocaleString()}`,
      rating: pkg.average_rating ? pkg.average_rating.toFixed(1) : '4.8',
      img: pkg.cover_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjWYJQBQnyHAXiKaPafNLz9RoJJ4ERL0A8Dahmc1zp00YyOiddKSt2qlHyo_Gilk6VCiaG_wu1VdHGgJBvzQVHPaPeE51A14ROsLSPhBQdmdtwW3C26Bz5dEwDfDfKZMQ80X5R3wnkRdmV4EsS9Bn6oRlYnN2A2xHfpIdJpzXnGP4WyhCij7OF7EIvQbO3d7nSpkGgOUCSCM-AcUFVI2GI96wJ9shX8ktKSOY0c1iwSsdP2JoWfphsh2MNKVwy5ErkqZGKYsGeTj15',
      description: pkg.description,
      inclusions: JSON.parse(pkg.included_services || '[]'),
      itinerary: pkg.itinerary || '[]',
      agency: pkg.agency_name || 'Odyssey Travels',
      startDate: pkg.departure_date || 'Oct 12, 2026',
    }));
  }, [packages]);

  const filteredPackages = React.useMemo(() => {
    if (!searchQuery) return mappedPackages;
    return mappedPackages.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mappedPackages, searchQuery]);

  const featured = React.useMemo(() => {
    return filteredPackages.slice(0, 2);
  }, [filteredPackages]);

  const escapes = React.useMemo(() => {
    return filteredPackages.slice(2).map((item, idx) => ({
      ...item,
      info: `${item.duration} • Tour Included`,
      isGreyBg: idx % 2 === 1,
    }));
  }, [filteredPackages]);

  const packageImages = React.useMemo(() => {
    const list = mappedPackages.map(p => p.img).filter(Boolean);
    if (list.length === 0) {
      list.push('https://lh3.googleusercontent.com/aida-public/AB6AXuAjWYJQBQnyHAXiKaPafNLz9RoJJ4ERL0A8Dahmc1zp00YyOiddKSt2qlHyo_Gilk6VCiaG_wu1VdHGgJBvzQVHPaPeE51A14ROsLSPhBQdmdtwW3C26Bz5dEwDfDfKZMQ80X5R3wnkRdmV4EsS9Bn6oRlYnN2A2xHfpIdJpzXnGP4WyhCij7OF7EIvQbO3d7nSpkGgOUCSCM-AcUFVI2GI96wJ9shX8ktKSOY0c1iwSsdP2JoWfphsh2MNKVwy5ErkqZGKYsGeTj15');
    }
    return list;
  }, [mappedPackages]);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [nextImgIndex, setNextImgIndex] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (packageImages.length <= 1) return;

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentImgIndex(nextImgIndex);
        fadeAnim.setValue(0);
        setNextImgIndex((nextImgIndex + 1) % packageImages.length);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [nextImgIndex, packageImages.length]);

  const toggleCompare = (id) => {
    setCompareList(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} />

      {/* Asymmetrical Background Orbs */}
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />
      <View style={styles.bgOrb3} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#967BB6']}
            tintColor="#967BB6"
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          {/* Base current image */}
          <Image
            source={{ uri: packageImages[currentImgIndex] }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Overlaying next image that fades in */}
          {packageImages.length > 1 && (
            <Animated.Image
              source={{ uri: packageImages[nextImgIndex] }}
              style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(240,238,245,0.4)', '#F0EEF5']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Where to next, {'\n'}
              <Text style={{ fontFamily: 'Epilogue_700Bold', color: 'rgb(150, 123, 182)' }}>
                {user?.name?.split(' ')[0] || 'Ahmed'}?
              </Text>
            </Text>

            {/* Smart Search Bar */}
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={22} color="#595c5d" style={{ backgroundColor: 'transparent' }} />
              <TextInput
                style={[styles.searchInput, { backgroundColor: 'transparent' }]}
                placeholder="Search destinations or activities..."
                placeholderTextColor="rgba(89, 92, 93, 0.6)"
                underlineColorAndroid="transparent"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>

        {/* Category Quick-Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIconWrap, isActive && styles.categoryIconWrapActive]}>
                  <MaterialIcons
                    name={cat.icon}
                    size={24}
                    color={isActive ? '#52396f' : '#595c5d'}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </View>
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured for You Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured for You</Text>
            <TouchableOpacity style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredScroll}
            contentContainerStyle={styles.featuredContainer}
            snapToInterval={CARD_W + 24}
            decelerationRate="fast"
          >
            {featured.map(item => {
              const isCompared = compareList.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('PackageDetail', { package: item })}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: item.img }} style={styles.featuredImg} />
                  <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.95)']}
                    style={styles.featuredGradient}
                    start={{ x: 0, y: 0.4 }}
                    end={{ x: 0, y: 1 }}
                  />

                  {/* Compare Checkbox Overlay */}
                  <TouchableOpacity
                    style={styles.compareCheckboxWrap}
                    onPress={() => toggleCompare(item.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.checkboxRound}>
                      {isCompared && <MaterialIcons name="check" size={14} color="#52396f" style={{ backgroundColor: 'transparent' }} />}
                    </View>
                  </TouchableOpacity>
 
                  {/* Content Details */}
                  <View style={styles.featuredDetails}>
                    <View style={styles.badgeRow}>
                      <View style={styles.verifiedBadge}>
                        <MaterialIcons name="verified-user" size={12} color="#52396f" style={{ marginRight: 2, backgroundColor: 'transparent' }} />
                        <Text style={styles.verifiedText}>Verified Agency</Text>
                      </View>
                      <View style={styles.ratingRow}>
                        <MaterialIcons name="star" size={14} color="#903985" style={{ marginRight: 2, backgroundColor: 'transparent' }} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardInfo}>{item.duration} • {item.destination}</Text>
                    <Text style={styles.cardPrice}>
                      {item.price}<Text style={styles.perPerson}>/pp</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
 
        {/* Budget-Friendly Escapes */}
        <View style={[styles.section, { paddingBottom: 140 }]}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 24, marginBottom: 24 }]}>
            Budget-Friendly Escapes
          </Text>
          <View style={styles.escapesList}>
            {escapes.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.escapeCard, item.isGreyBg && styles.escapeCardGrey]}
                onPress={() => navigation.navigate('PackageDetail', { package: item })}
                activeOpacity={0.88}
              >
                <Image source={{ uri: item.img }} style={styles.escapeImg} />
                <View style={styles.escapeInfo}>
                  <Text style={styles.escapeTitle}>{item.title}</Text>
                  <Text style={styles.escapeDuration}>{item.info}</Text>
                  <Text style={styles.escapePrice}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
 
      {/* Floating Action Button (Compare selected items) */}
      {compareList.size > 0 && (
        <View style={styles.compareFabContainer}>
          <TouchableOpacity
            style={styles.compareFab}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('PackageComparison', { packageIds: Array.from(compareList) })}
          >
            <MaterialIcons name="compare-arrows" size={20} color="#52396f" style={{ backgroundColor: 'transparent' }} />
            <Text style={styles.compareFabText}>Compare ({compareList.size})</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EEF5' },
  bgOrb1: {
    position: 'absolute',
    top: 350,
    left: -85,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#C9B8E8',
    opacity: 0.35,
    zIndex: 0,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 250,
    right: -95,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#b8baff',
    opacity: 0.3,
    zIndex: 0,
  },
  bgOrb3: {
    position: 'absolute',
    top: '65%',
    left: '20%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#e0d5f7',
    opacity: 0.25,
    zIndex: 0,
  },
  scroll: { paddingTop: 0 },

  // Hero Section
  hero: {
    height: 480,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  heroTitle: {
    fontFamily: 'Epilogue_400Regular',
    fontSize: 40,
    color: '#2c2f30',
    lineHeight: 46,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    height: 56,
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.12)',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: '#2c2f30',
    padding: 0,
    backgroundColor: 'transparent',
  },

  // Category filters
  categoryScroll: { marginVertical: 32 },
  categoryContainer: { paddingHorizontal: 24, gap: 24 },
  categoryItem: { alignItems: 'center', gap: 12, minWidth: 72 },
  categoryIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.10)',
  },
  categoryIconWrapActive: {
    backgroundColor: '#cecdff',
    borderColor: '#b8baff',
  },
  categoryLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#595c5d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryLabelActive: {
    color: '#52396f',
  },

  // Sections
  section: { marginBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 24,
    color: '#2c2f30',
  },
  viewAllBtn: { padding: 4 },
  viewAllText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: '#52396f',
    letterSpacing: 0.5,
  },

  // Featured Carousel
  featuredScroll: { marginHorizontal: 0 },
  featuredContainer: { paddingHorizontal: 24, gap: 24, paddingBottom: 16 },
  featuredCard: {
    width: CARD_W,
    height: CARD_W * 1.05,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    position: 'relative',
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.10)',
  },
  featuredImg: {
    width: '100%',
    height: '66%',
  },
  featuredGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  compareCheckboxWrap: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 20,
  },
  checkboxRound: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  featuredDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 8,
  },
  badgeRow: { flexDirection: 'row', gap: 12, marginBottom: 8, alignItems: 'center' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff1f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  verifiedText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#52396f',
    textTransform: 'uppercase',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#2c2f30',
  },
  cardTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    color: '#2c2f30',
    marginBottom: 4,
  },
  cardInfo: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#595c5d',
    marginBottom: 12,
  },
  cardPrice: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    color: '#52396f',
  },
  perPerson: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#595c5d',
  },

  // Escapes List
  escapesList: { paddingHorizontal: 24, gap: 16 },
  escapeCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    gap: 16,
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.10)',
  },
  escapeCardGrey: {
    backgroundColor: 'rgba(239, 241, 242, 0.88)',
    shadowOpacity: 0,
    elevation: 0,
  },
  escapeImg: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  escapeInfo: { flex: 1, justifyContent: 'center', gap: 4 },
  escapeTitle: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 18,
    color: '#2c2f30',
  },
  escapeDuration: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#595c5d',
  },
  escapePrice: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#52396f',
  },

  // Compare FAB
  compareFabContainer: {
    position: 'absolute',
    bottom: 90, // Sit directly above custom bottom tab bar height (64 + padding)
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 40,
  },
  compareFab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    gap: 8,
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 5,
  },
  compareFabText: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: '#52396f',
  },
});
