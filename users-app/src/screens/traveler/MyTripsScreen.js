import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';

const { width } = Dimensions.get('window');

const MY_TRIPS = [
  {
    id: 't1',
    title: 'The Inca Trail Expedition',
    destination: 'Cusco, Peru',
    duration: '7 Days',
    price: '$1,250',
    status: 'Confirmed',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIFbc5TnN4FwTNMowikr9ltfn6zwXoP0NgqH7Mwnp2P0tdMs3jisyfLrWh8fvMfhbJzQU9YIMdq0dXdoymev2fxSWP1SE89OLk25HOaD2mCP_dXOhBeYtxNeK3XjaM_qVGgQiCvns-_Mrra4dX2GPnZZbd97qQP4fgQOl2uSLB9hOn7FN4LzZTRDmCIGC0nzjXwvVd4VdJshdeQBrUdJR_OCVPp4s2AtPMEYFNbQsShx_JKdk9j2-sPt6iueBznT_kSjlmlGR-OE7_',
    agency: 'Odyssey Travels',
    startDate: 'Oct 12, 2026',
  },
  {
    id: 't2',
    title: 'Alpine Wellness Retreat',
    destination: 'Zermatt, Switzerland',
    duration: '5 Days',
    price: '$2,400',
    status: 'Pending Review',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4RHt0feVWS_UhZrCcU07rVmfJOKus1ameQXsuCa4KSgOYMcJgGGechG-26aBS0tktVCTAlJxzqQopKpK-DhJJM7uwIPLcM8lvbzTcvGuDIhU_Pd0M0PcwKQWxcFGG5DsgBDlPxP5pHkxPsRuYDB1xDNEzSScCrssvtyWnWGcGQFhNF6PJ6_rRYlAtuA6iLfsTdZIVqdwwY_cA0qBq4ovwmWAqt8Mi1RpFr3SZ3ZXqozUlMxVXHr2t71yloo1HAqA5B4rkbicdYTqK',
    agency: 'Alpine Wellness Group',
    startDate: 'Dec 05, 2026',
  },
];

export default function MyTripsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <AppHeader title="My Trips" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.subtitle}>MY BOOKED JOURNEYS</Text>
          <Text style={styles.title}>Your Adventures</Text>
        </View>

        <View style={styles.list}>
          {MY_TRIPS.map(trip => {
            const isConfirmed = trip.status === 'Confirmed';
            return (
              <TouchableOpacity
                key={trip.id}
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
                      <MaterialIcons name="location-on" size={14} color="#595c5d" />
                      <Text style={styles.metaText}>{trip.destination}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="event" size={14} color="#595c5d" />
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
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f7' },
  scroll: { paddingTop: 20 },
  
  welcomeSection: { paddingHorizontal: 24, marginBottom: 28 },
  subtitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: '#0149e6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 32,
    color: '#2c2f30',
  },

  list: { paddingHorizontal: 24, gap: 24 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 4,
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
    color: '#0149e6',
  },
});
