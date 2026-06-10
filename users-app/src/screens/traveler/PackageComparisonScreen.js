import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Dimensions, ActivityIndicator, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { api } from '../../services/api';
import { Colors } from '../../theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = 180; // fixed width for each package column

export default function PackageComparisonScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { packageIds = [] } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    if (packageIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchPackages = async () => {
      try {
        setLoading(true);
        // Fetch details of all selected packages in parallel
        const results = await Promise.all(
          packageIds.map(async (id) => {
            try {
              const data = await api.getPackage(id);
              // Normalize data
              return {
                id: data.id,
                title: data.title,
                destination: data.destination,
                price: data.price,
                duration_days: data.duration_days,
                cover_image: data.cover_image,
                agency_name: data.agency_name || 'Odyssey Travels',
                deposit_percentage: data.deposit_percentage ?? 50,
                refund_deadline_days: data.refund_deadline_days ?? 7,
                rating: data.average_rating ? data.average_rating.toFixed(1) : '4.8',
                inclusions: (() => {
                  try {
                    return JSON.parse(data.included_services || '[]');
                  } catch {
                    return [];
                  }
                })()
              };
            } catch (err) {
              console.error(`Error fetching package ${id}:`, err);
              return null;
            }
          })
        );
        setPackages(results.filter(Boolean));
      } catch (err) {
        console.error('Error in comparative fetch:', err);
        Alert.alert('Error', 'Failed to load package details for comparison.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [packageIds]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#52396f" />
        <Text style={styles.loadingText}>Fetching package details...</Text>
      </View>
    );
  }

  if (packages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppHeader title="Compare Packages" navigation={navigation} />
        <View style={styles.emptyContent}>
          <MaterialIcons name="compare-arrows" size={64} color="rgba(82, 57, 111, 0.2)" />
          <Text style={styles.emptyTitle}>No packages to compare</Text>
          <Text style={styles.emptyDesc}>Select multiple packages on the Explore dashboard and tap Compare.</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calculate list of all unique inclusions across compared packages to construct rows
  const allInclusions = Array.from(
    new Set(packages.flatMap((pkg) => pkg.inclusions))
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Compare Packages" navigation={navigation} />

      {/* Background decoration orbs */}
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
          <View style={styles.table}>
            {/* Headers row: Cover Image, Title, Price */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.labelColumn, styles.headerLabelCell]} />
              {packages.map((pkg) => (
                <View key={pkg.id} style={[styles.cell, styles.columnCell]}>
                  <Image
                    source={{ uri: pkg.cover_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjWYJQBQnyHAXiKaPafNLz9RoJJ4ERL0A8Dahmc1zp00YyOiddKSt2qlHyo_Gilk6VCiaG_wu1VdHGgJBvzQVHPaPeE51A14ROsLSPhBQdmdtwW3C26Bz5dEwDfDfKZMQ80X5R3wnkRdmV4EsS9Bn6oRlYnN2A2xHfpIdJpzXnGP4WyhCij7OF7EIvQbO3d7nSpkGgOUCSCM-AcUFVI2GI96wJ9shX8ktKSOY0c1iwSsdP2JoWfphsh2MNKVwy5ErkqZGKYsGeTj15' }}
                    style={styles.pkgImg}
                  />
                  <Text style={styles.pkgTitle} numberOfLines={2}>{pkg.title}</Text>
                  <Text style={styles.pkgPrice}>
                    {pkg.price < 10000 ? `$${pkg.price}` : `PKR ${pkg.price.toLocaleString()}`}
                  </Text>
                  <Text style={styles.pkgAgency}>{pkg.agency_name}</Text>
                </View>
              ))}
            </View>

            {/* Destination Row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.labelColumn]}>
                <Text style={styles.rowLabel}>Destination</Text>
              </View>
              {packages.map((pkg) => (
                <View key={pkg.id} style={[styles.cell, styles.columnCell]}>
                  <Text style={styles.rowValue}>{pkg.destination}</Text>
                </View>
              ))}
            </View>

            {/* Duration Row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.labelColumn]}>
                <Text style={styles.rowLabel}>Duration</Text>
              </View>
              {packages.map((pkg) => (
                <View key={pkg.id} style={[styles.cell, styles.columnCell]}>
                  <Text style={styles.rowValue}>{pkg.duration_days} Days</Text>
                </View>
              ))}
            </View>

            {/* Rating Row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.labelColumn]}>
                <Text style={styles.rowLabel}>Rating</Text>
              </View>
              {packages.map((pkg) => (
                <View key={pkg.id} style={[styles.cell, styles.columnCell, styles.ratingCell]}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{pkg.rating}</Text>
                </View>
              ))}
            </View>

            {/* Policy: Deposit Row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.labelColumn]}>
                <Text style={styles.rowLabel}>Escrow Deposit</Text>
              </View>
              {packages.map((pkg) => (
                <View key={pkg.id} style={[styles.cell, styles.columnCell]}>
                  <Text style={styles.rowValue}>{pkg.deposit_percentage}% Advance</Text>
                </View>
              ))}
            </View>

            {/* Policy: Refund Window Row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.labelColumn]}>
                <Text style={styles.rowLabel}>Refund Limit</Text>
              </View>
              {packages.map((pkg) => (
                <View key={pkg.id} style={[styles.cell, styles.columnCell]}>
                  <Text style={styles.rowValue}>{pkg.refund_deadline_days} days before trip</Text>
                </View>
              ))}
            </View>

            {/* Inclusions Row Header */}
            <View style={[styles.row, styles.sectionHeaderRow]}>
              <View style={[styles.cell, styles.fullWidthLabelCell]}>
                <Text style={styles.sectionHeaderLabel}>Inclusions Breakdown</Text>
              </View>
            </View>

            {/* Inclusions Detail Rows */}
            {allInclusions.map((inclusion, idx) => (
              <View key={idx} style={styles.row}>
                <View style={[styles.cell, styles.labelColumn]}>
                  <Text style={styles.inclusionRowLabel} numberOfLines={2}>{inclusion}</Text>
                </View>
                {packages.map((pkg) => {
                  const hasInclusion = pkg.inclusions.includes(inclusion);
                  return (
                    <View key={pkg.id} style={[styles.cell, styles.columnCell, styles.checkCell]}>
                      <MaterialIcons
                        name={hasInclusion ? "check-circle" : "cancel"}
                        size={20}
                        color={hasInclusion ? "#2e7d32" : "#c62828"}
                      />
                    </View>
                  );
                })}
              </View>
            ))}

            {/* Actions Row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.labelColumn]} />
              {packages.map((pkg) => (
                <View key={pkg.id} style={[styles.cell, styles.columnCell, styles.actionCell]}>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => navigation.navigate('PackageDetail', { package: pkg })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewBtnText}>View Package</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EEF5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0EEF5',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#595c5d',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F0EEF5',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    color: '#191c1d',
  },
  emptyDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#4a454e',
    textAlign: 'center',
    lineHeight: 20,
  },
  backBtn: {
    backgroundColor: '#52396f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 8,
  },
  backBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#ffffff',
  },
  scrollContent: {
    paddingVertical: 16,
  },
  table: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.1)',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(171, 173, 174, 0.15)',
    alignItems: 'stretch',
  },
  cell: {
    padding: 16,
    justifyContent: 'center',
  },
  labelColumn: {
    width: 140,
    backgroundColor: '#F8F6FC',
    borderRightWidth: 1,
    borderRightColor: 'rgba(171, 173, 174, 0.15)',
  },
  columnCell: {
    width: COLUMN_WIDTH,
    alignItems: 'center',
  },
  headerLabelCell: {
    backgroundColor: '#F8F6FC',
  },
  pkgImg: {
    width: COLUMN_WIDTH - 32,
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },
  pkgTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: '#191c1d',
    textAlign: 'center',
    marginBottom: 4,
    height: 36,
  },
  pkgPrice: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: '#52396f',
    marginBottom: 2,
  },
  pkgAgency: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#7b757f',
  },
  rowLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#4a454e',
  },
  rowValue: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#191c1d',
    textAlign: 'center',
  },
  ratingCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#191c1d',
  },
  sectionHeaderRow: {
    backgroundColor: '#ede8f5',
  },
  fullWidthLabelCell: {
    flex: 1,
    paddingVertical: 10,
  },
  sectionHeaderLabel: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 13,
    color: '#52396f',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inclusionRowLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#4a454e',
  },
  checkCell: {
    alignItems: 'center',
  },
  actionCell: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  viewBtn: {
    backgroundColor: '#52396f',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  viewBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#ffffff',
  },
  // Background Orbs
  bgOrb1: {
    position: 'absolute',
    top: 100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#C9B8E8',
    opacity: 0.2,
    zIndex: -1,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 100,
    right: -80,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#b8baff',
    opacity: 0.15,
    zIndex: -1,
  },
});
