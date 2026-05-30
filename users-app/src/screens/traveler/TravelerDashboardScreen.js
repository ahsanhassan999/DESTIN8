import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Dimensions, ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.85;

const FEATURED = [
  {
    id: 'f1',
    title: 'The Inca Trail Expedition',
    destination: 'Cusco, Peru',
    duration: '7 Days',
    price: '$1,250',
    rating: '4.9',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIFbc5TnN4FwTNMowikr9ltfn6zwXoP0NgqH7Mwnp2P0tdMs3jisyfLrWh8fvMfhbJzQU9YIMdq0dXdoymev2fxSWP1SE89OLk25HOaD2mCP_dXOhBeYtxNeK3XjaM_qVGgQiCvns-_Mrra4dX2GPnZZbd97qQP4fgQOl2uSLB9hOn7FN4LzZTRDmCIGC0nzjXwvVd4VdJshdeQBrUdJR_OCVPp4s2AtPMEYFNbQsShx_JKdk9j2-sPt6iueBznT_kSjlmlGR-OE7_',
  },
  {
    id: 'f2',
    title: 'Alpine Wellness Retreat',
    destination: 'Zermatt, CH',
    duration: '5 Days',
    price: '$2,400',
    rating: '4.8',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4RHt0feVWS_UhZrCcU07rVmfJOKus1ameQXsuCa4KSgOYMcJgGGechG-26aBS0tktVCTAlJxzqQopKpK-DhJJM7uwIPLcM8lvbzTcvGuDIhU_Pd0M0PcwKQWxcFGG5DsgBDlPxP5pHkxPsRuYDB1xDNEzSScCrssvtyWnWGcGQFhNF6PJ6_rRYlAtuA6iLfsTdZIVqdwwY_cA0qBq4ovwmWAqt8Mi1RpFr3SZ3ZXqozUlMxVXHr2t71yloo1HAqA5B4rkbicdYTqK',
  },
];

const ESCAPES = [
  {
    id: 'e1',
    title: 'Lisbon City Break',
    info: '3 Days • Flights Inc.',
    price: '$450',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtkHjw5OgUuKnPpk9Kq69OHqa8Wou08cBxX7J7kW7duMpqdgj5M-TT2EAhXMxXTJV8skguspv1DD9r18C-qAoCpYl5BzyUKQcpRYCYmLx2Pe-IsWVAe_XsXhARv_jyFORO8VW1_t7RTESV0HMUNTAY9TZQsAiTzuDVcVlRee-szO2gNsOJrBhC52bGd-EU-FtNHa-UE4fehUuI9BHhvuFGnX8lSWMJqPeQHFc4SBqLMgwWU0V-gSiDccl2E1jzrSMNNol4zJtoEHNT',
  },
  {
    id: 'e2',
    title: 'Istanbul Express',
    info: '4 Days • Cultural Tour',
    price: '$520',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHlw9xWL6flQPDcb_3H0EJRb3Br12WWz8VJd5IuV-qDM7jJskmBnzKLHMTPPC_HPTZyu07hQhmpy9QNSOiWZqzEuRSrP5ztsOQNxpdMsxla5noJKXT1kSFCrzDM1xZkCpHK-FrdM42_pqR5Id0508Bfky17ZaTnzMxdBnX9ojj1PCNX5Q7avsi_ZYJYFKy_kN-neg9BmmAW0IuUpzwmdH4ZjPTUMirC_u9hqydXWPBNqkxW4oADwcht2ArjGgyfoULDIgN4ezkTJ00',
    isGreyBg: true,
  },
  {
    id: 'e3',
    title: 'London Weekend',
    info: '2 Days • City Center',
    price: '$380',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB71ZTezulqn-dQN778X6XLjdYxICv21qJ-gqYvFnTTrIKf-UH4fQRLCk_e9UV79TME-u6mjyI3nE7dvYiL596nH13Gxm0eQEDRuDPJ4tDW-zl5v_eLTs-lHAlJSJCIpwwiHvGG6sDqinVNoBW5FhA2Ion0GeskfRg9eJvIV7XLykGCoaDUkB8pV9GcYh4dKMQryA1pyYHcjMQ1suwRAgqDliPDN_ONLkV54ghjqJIjsBhTPcCQEOGfy7ItoBB4lGDp55EU8DZUx3w1',
  },
];

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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjWYJQBQnyHAXiKaPafNLz9RoJJ4ERL0A8Dahmc1zp00YyOiddKSt2qlHyo_Gilk6VCiaG_wu1VdHGgJBvzQVHPaPeE51A14ROsLSPhBQdmdtwW3C26Bz5dEwDfDfKZMQ80X5R3wnkRdmV4EsS9Bn6oRlYnN2A2xHfpIdJpzXnGP4WyhCij7OF7EIvQbO3d7nSpkGgOUCSCM-AcUFVI2GI96wJ9shX8ktKSOY0c1iwSsdP2JoWfphsh2MNKVwy5ErkqZGKYsGeTj15' }}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['transparent', 'rgba(245,246,247,0.4)', '#f5f6f7']}
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
              <MaterialIcons name="search" size={22} color="#595c5d" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destinations or activities..."
                placeholderTextColor="rgba(89, 92, 93, 0.6)"
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
                    color={isActive ? '#0149e6' : '#595c5d'}
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
            {FEATURED.map(item => {
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
                      {isCompared && <MaterialIcons name="check" size={14} color="#0149e6" />}
                    </View>
                  </TouchableOpacity>

                  {/* Content Details */}
                  <View style={styles.featuredDetails}>
                    <View style={styles.badgeRow}>
                      <View style={styles.verifiedBadge}>
                        <MaterialIcons name="verified-user" size={12} color="#0149e6" style={{ marginRight: 2 }} />
                        <Text style={styles.verifiedText}>Verified Agency</Text>
                      </View>
                      <View style={styles.ratingRow}>
                        <MaterialIcons name="star" size={14} color="#903985" style={{ marginRight: 2 }} />
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
            {ESCAPES.map(item => (
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
          >
            <MaterialIcons name="compare-arrows" size={20} color="#0149e6" />
            <Text style={styles.compareFabText}>Compare ({compareList.size})</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f7' },
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: '#2c2f30',
    padding: 0,
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
  },
  categoryIconWrapActive: {
    backgroundColor: '#cecdff', // secondary-container (#cecdff) which matches primary-container in styling
  },
  categoryLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#595c5d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryLabelActive: {
    color: '#0149e6',
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
    color: '#0149e6',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
    color: '#0149e6',
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
    color: '#0149e6',
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
  },
  escapeCardGrey: {
    backgroundColor: '#eff1f2',
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
    color: '#0149e6',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    color: '#0149e6',
  },
});
