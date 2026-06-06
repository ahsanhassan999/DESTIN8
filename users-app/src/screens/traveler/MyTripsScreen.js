import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

export default function MyTripsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await api.getMyBookings();
      const normalized = data.map(b => ({
        id: b.package_id,
        bookingId: b.id,
        title: b.package_title || b.package?.title || 'Booking',
        destination: b.package_destination || b.package?.destination || '—',
        duration: `${b.package_duration_days || b.package?.duration_days || '?'} Days`,
        price: b.package_price
          ? (b.package_price < 10000 ? `$${b.package_price}` : `PKR ${b.package_price.toLocaleString()}`)
          : '—',
        status: b.status === 'confirmed' ? 'Confirmed' : b.status === 'pending' ? 'Pending Review' : b.status,
        img: b.package_image || b.package?.cover_image || null,
        agency: b.agency_name || b.package?.agency_name || 'Unknown Agency',
        startDate: b.travel_date || b.package?.departure_date || 'TBD',
      }));
      setTrips(normalized);
    } catch (err) {
      console.error('Error loading trips:', err);
      setTrips([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips(false);
    }, [loadTrips])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrips(false);
  }, [loadTrips]);

  const filteredTrips = trips.filter(trip =>
    trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.agency.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <View style={styles.container}>
      <AppHeader title="My Trips" navigation={navigation} />

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
            colors={['#52396f']}
            tintColor="#52396f"
          />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.subtitle}>MY BOOKED JOURNEYS</Text>
          <Text style={styles.title}>Your Adventures</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="#7b757f" style={[styles.searchIcon, { backgroundColor: 'transparent' }]} />
          <TextInput
            style={[styles.searchInput, { backgroundColor: 'transparent' }]}
            placeholder="Search your journeys..."
            placeholderTextColor="rgba(123, 117, 127, 0.6)"
            underlineColorAndroid="transparent"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#52396f" />
          </View>
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={64} color="rgba(82, 57, 111, 0.2)" style={{ backgroundColor: 'transparent' }} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No matches found" : "No bookings yet"}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery 
                ? "Try searching with a different trip name, destination, or agency."
                : "You don't have any booked trips yet. Start exploring packages!"}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredTrips.map(trip => {
              const isConfirmed = trip.status === 'Confirmed';
              return (
                <TouchableOpacity
                  key={trip.bookingId}
                  style={styles.card}
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('PackageDetail', { package: trip })}
                >
                  <Image source={{ uri: trip.img }} style={styles.img} />
                  
                  <View style={styles.content}>
                    <View style={styles.headerRow}>
                      <Text style={styles.agency}>{trip.agency}</Text>
                      <View style={[styles.statusBadge, isConfirmed ? styles.badgeConfirmed : styles.badgePending]}>
                        <Text style={[styles.statusText, isConfirmed ? styles.textConfirmed : styles.textPending]}>
                          {trip.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.cardTitle}>{trip.title}</Text>
                    
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="location-on" size={14} color="#595c5d" style={{ backgroundColor: 'transparent' }} />
                        <Text style={styles.metaText}>{trip.destination}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="event" size={14} color="#595c5d" style={{ backgroundColor: 'transparent' }} />
                        <Text style={styles.metaText}>{trip.startDate}</Text>
                      </View>
                    </View>

                    <View style={styles.footerRow}>
                      <Text style={styles.duration}>{trip.duration}</Text>
                      <Text style={styles.price}>{trip.price}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EEF5' },
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
  scroll: { paddingTop: 20 },
  
  welcomeSection: { paddingHorizontal: 24, marginBottom: 28 },
  subtitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: '#52396f',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 32,
    color: '#2c2f30',
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 28,
    borderRadius: 32,
    height: 56,
    paddingHorizontal: 20,
    gap: 10,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.12)',
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
    backgroundColor: 'transparent',
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
    color: '#2c2f30',
  },
  emptyDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#595c5d',
    textAlign: 'center',
    lineHeight: 22,
  },

  list: { paddingHorizontal: 24, gap: 24 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.10)',
  },
  img: {
    width: '100%',
    height: 180,
  },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  agency: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#595c5d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeConfirmed: { backgroundColor: 'rgba(150, 123, 182, 0.15)' },
  badgePending: { backgroundColor: 'rgba(89, 92, 93, 0.1)' },
  statusText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  textConfirmed: { color: '#967BB6' },
  textPending: { color: '#595c5d' },

  cardTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    color: '#2c2f30',
    marginBottom: 12,
  },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#595c5d',
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(89, 92, 93, 0.08)' },
  duration: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#595c5d',
  },
  price: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: '#52396f',
  },
});
