import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const C = {
  primary: '#967BB6',
  darkPlum: '#52396F',
  onSurf: '#2C2F30',
  onSurfVar: '#595C5D',
  surfLow: '#EFF1F2',
  background: '#F5F6F7',
  cardBg: '#FFFFFF',
  gold: '#D97706',
  green: '#2E7D32',
};

export default function AgencyBookingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPkg, setExpandedPkg] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadBookings = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await api.getAgencyBookings();
      setPackages(data || []);
    } catch (err) {
      console.error('Error loading agency bookings:', err);
      setPackages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookings(false);
    }, [loadBookings])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookings(false);
  }, [loadBookings]);

  const togglePackage = (pkgId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPkg(expandedPkg === pkgId ? null : pkgId);
  };

  const handleContactTraveler = async (booking) => {
    // Navigate to ChatDetail or initiate chat
    Alert.alert('Initiating Chat', `Opening chat thread with ${booking.traveler_name}...`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={C.darkPlum} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Package Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[C.primary]}
            tintColor={C.primary}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 48 }} />
        ) : packages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-note" size={64} color="rgba(150, 123, 182, 0.3)" />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptySub}>
              Bookings for your posted travel packages will appear here once travelers book them.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {packages.map((pkg) => {
              const isExpanded = expandedPkg === pkg.package_id;
              return (
                <View key={pkg.package_id} style={styles.pkgGroupCard}>
                  {/* Package Header Row */}
                  <TouchableOpacity
                    style={styles.pkgHeaderRow}
                    activeOpacity={0.85}
                    onPress={() => togglePackage(pkg.package_id)}
                  >
                    <View style={styles.pkgHeaderLeft}>
                      <View style={styles.pkgIconWrap}>
                        <MaterialIcons name="luggage" size={22} color={C.darkPlum} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pkgTitle} numberOfLines={1}>
                          {pkg.package_title}
                        </Text>
                        <Text style={styles.pkgSub}>
                          {pkg.bookings.length} {pkg.bookings.length === 1 ? 'Booking' : 'Bookings'}
                        </Text>
                      </View>
                    </View>
                    <MaterialIcons
                      name={isExpanded ? 'expand-less' : 'expand-more'}
                      size={24}
                      color={C.onSurfVar}
                    />
                  </TouchableOpacity>

                  {/* Expanded Travelers list */}
                  {isExpanded && (
                    <View style={styles.travelerList}>
                      {pkg.bookings.map((booking) => {
                        const isSelected = selectedBooking?.booking_id === booking.booking_id;
                        return (
                          <View key={booking.booking_id} style={styles.bookingRowWrap}>
                            <TouchableOpacity
                              style={[styles.bookingItemRow, isSelected && styles.bookingItemRowSelected]}
                              activeOpacity={0.8}
                              onPress={() => setSelectedBooking(isSelected ? null : booking)}
                            >
                              <View style={styles.bookingLeft}>
                                <View style={styles.avatarWrap}>
                                  <Text style={styles.avatarTxt}>
                                    {booking.traveler_name.substring(0, 2).toUpperCase()}
                                  </Text>
                                </View>
                                <View>
                                  <Text style={styles.travelerName}>{booking.traveler_name}</Text>
                                  <Text style={styles.travelDate}>Date: {booking.travel_date || '—'}</Text>
                                </View>
                              </View>
                              <View style={styles.bookingRight}>
                                <Text style={styles.advancePaidVal}>
                                  PKR {booking.advance_paid.toLocaleString()}
                                </Text>
                                <Text style={styles.advanceLabel}>Advance Paid</Text>
                              </View>
                            </TouchableOpacity>

                            {/* Booking detailed financial breakdown */}
                            {isSelected && (
                              <View style={styles.detailsDropdown}>
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Email Address</Text>
                                  <Text style={styles.detailValue}>{booking.traveler_email}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Travelers Count</Text>
                                  <Text style={styles.detailValue}>
                                    {booking.num_travelers} ({booking.male_count} M / {booking.female_count} F)
                                  </Text>
                                </View>
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Total Trip Cost</Text>
                                  <Text style={styles.detailValue}>
                                    PKR {booking.total_price.toLocaleString()}
                                  </Text>
                                </View>
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Advance Deposit Paid</Text>
                                  <Text style={[styles.detailValue, { color: C.green, fontFamily: 'Epilogue_700Bold' }]}>
                                    PKR {booking.advance_paid.toLocaleString()}
                                  </Text>
                                </View>
                                <View style={styles.detailRow}>
                                  <Text style={styles.detailLabel}>Remaining Due</Text>
                                  <Text style={[styles.detailValue, { color: C.gold, fontFamily: 'Epilogue_700Bold' }]}>
                                    PKR {booking.remaining_due.toLocaleString()}
                                  </Text>
                                </View>

                                {/* Action bar */}
                                <View style={styles.actionsBar}>
                                  <TouchableOpacity
                                    style={styles.chatActionBtn}
                                    onPress={async () => {
                                      try {
                                        const conv = await api.createConversation(booking.package_id);
                                        navigation.navigate('ChatDetail', { conversation: conv });
                                      } catch (err) {
                                        console.error('Error starting conversation:', err);
                                      }
                                    }}
                                  >
                                    <MaterialIcons name="chat" size={18} color="#fff" />
                                    <Text style={styles.chatActionBtnTxt}>Message Traveler</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 47, 48, 0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: C.onSurf,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Groups
  list: {
    gap: 16,
  },
  pkgGroupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.04)',
  },
  pkgHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  pkgHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  pkgIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(150, 123, 182, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pkgTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 16,
    color: C.onSurf,
  },
  pkgSub: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: C.onSurfVar,
    marginTop: 2,
  },

  // Traveler List
  travelerList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: 'rgba(44, 47, 48, 0.06)',
  },
  bookingRowWrap: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.05)',
    overflow: 'hidden',
  },
  bookingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  bookingItemRowSelected: {
    backgroundColor: 'rgba(150, 123, 182, 0.05)',
  },
  bookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(82, 57, 111, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 12,
    color: C.darkPlum,
  },
  travelerName: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: C.onSurf,
  },
  travelDate: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: C.onSurfVar,
    marginTop: 2,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  advancePaidVal: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: C.green,
  },
  advanceLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: C.onSurfVar,
    marginTop: 2,
  },

  // Dropdown details
  detailsDropdown: {
    padding: 16,
    backgroundColor: '#FCFCFC',
    borderTopWidth: 1,
    borderTopColor: 'rgba(44, 47, 48, 0.04)',
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: C.onSurfVar,
  },
  detailValue: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: C.onSurf,
  },
  actionsBar: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(44, 47, 48, 0.06)',
    paddingTop: 12,
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 10,
  },
  chatActionBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#ffffff',
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: C.onSurf,
    marginTop: 16,
  },
  emptySub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: C.onSurfVar,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});
