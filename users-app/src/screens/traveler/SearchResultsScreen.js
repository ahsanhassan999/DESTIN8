import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Image, SafeAreaView, Dimensions, ActivityIndicator, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 36) / 2;

const SORT_OPTIONS = [
  { id: 'best', label: 'Best Match' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'price_asc', label: 'Price ↑' },
  { id: 'price_desc', label: 'Price ↓' },
];

const FILTER_CHIPS = [
  { id: 'verified', label: 'Verified Agency' },
  { id: 'budget', label: 'Budget Friendly' },
  { id: 'mountains', label: 'Mountains' },
  { id: 'beaches', label: 'Beaches' },
  { id: 'family', label: 'Family Tours' },
];

export default function SearchResultsScreen({ navigation, route }) {
  const initialQuery = route?.params?.query || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState('best');
  const [selectedFilters, setSelectedFilters] = useState(new Set());

  const fetchPackages = useCallback(async (queryToSearch) => {
    try {
      setLoading(true);
      const q = queryToSearch !== undefined ? queryToSearch : searchQuery;
      const data = await api.getPackages(q);
      setPackages(data || []);
    } catch (e) {
      console.error('Error searching packages:', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPackages(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = () => {
    if (!searchQuery || !searchQuery.trim()) return;
    fetchPackages(searchQuery.trim());
  };

  const toggleFilter = (id) => {
    setSelectedFilters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const mappedPackages = useMemo(() => {
    return packages.map(pkg => ({
      id: pkg.id,
      title: pkg.title,
      destination: pkg.destination,
      duration: `${pkg.duration_days} Days`,
      priceRaw: pkg.price,
      priceFormatted: pkg.price < 10000 ? `$${pkg.price}` : `PKR ${pkg.price.toLocaleString()}`,
      rating: pkg.average_rating ? pkg.average_rating.toFixed(1) : '4.8',
      img: pkg.cover_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjWYJQBQnyHAXiKaPafNLz9RoJJ4ERL0A8Dahmc1zp00YyOiddKSt2qlHyo_Gilk6VCiaG_wu1VdHGgJBvzQVHPaPeE51A14ROsLSPhBQdmdtwW3C26Bz5dEwDfDfKZMQ80X5R3wnkRdmV4EsS9Bn6oRlYnN2A2xHfpIdJpzXnGP4WyhCij7OF7EIvQbO3d7nSpkGgOUCSCM-AcUFVI2GI96wJ9shX8ktKSOY0c1iwSsdP2JoWfphsh2MNKVwy5ErkqZGKYsGeTj15',
      description: pkg.description,
      inclusions: JSON.parse(pkg.included_services || '[]'),
      itinerary: pkg.itinerary || '[]',
      agency: pkg.agency_name || 'Odyssey Travels',
      startDate: pkg.departure_date || 'Oct 12, 2026',
    }));
  }, [packages]);

  const filteredAndSortedPackages = useMemo(() => {
    let list = [...mappedPackages];

    // Filter Chips
    if (selectedFilters.size > 0) {
      list = list.filter(item => {
        if (selectedFilters.has('verified') && item.agency !== 'Verified Agency' && !item.agency) {
          return false;
        }
        if (selectedFilters.has('budget') && item.priceRaw > 50000) {
          return false;
        }
        if (selectedFilters.has('mountains') && !item.destination.toLowerCase().includes('mountain') && !item.destination.toLowerCase().includes('hunza') && !item.destination.toLowerCase().includes('skardu') && !item.title.toLowerCase().includes('mountain') && !item.title.toLowerCase().includes('k2')) {
          return false;
        }
        if (selectedFilters.has('beaches') && !item.destination.toLowerCase().includes('beach') && !item.title.toLowerCase().includes('beach') && !item.destination.toLowerCase().includes('gwadar')) {
          return false;
        }
        if (selectedFilters.has('family') && !item.description.toLowerCase().includes('family') && !item.title.toLowerCase().includes('family')) {
          return false;
        }
        return true;
      });
    }

    // Sort Options
    if (activeSort === 'rating') {
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (activeSort === 'price_asc') {
      list.sort((a, b) => a.priceRaw - b.priceRaw);
    } else if (activeSort === 'price_desc') {
      list.sort((a, b) => b.priceRaw - a.priceRaw);
    }

    return list;
  }, [mappedPackages, selectedFilters, activeSort]);

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => navigation.navigate('PackageDetail', { package: item })}
      activeOpacity={0.88}
    >
      <View style={styles.imgContainer}>
        <Image source={{ uri: item.img }} style={styles.cardImg} resizeMode="cover" />
        <View style={styles.verifiedBadge}>
          <MaterialIcons name="verified" size={12} color="#ffffff" style={{ marginRight: 2 }} />
          <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
        </View>
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={12} color="#ffb800" style={{ marginRight: 2 }} />
          <Text style={styles.ratingBadgeText}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.locationRow}>
          <MaterialIcons name="place" size={13} color="#858c8e" />
          <Text style={styles.locationText} numberOfLines={1}>{item.destination} • {item.duration}</Text>
        </View>
        <Text style={styles.cardPrice}>{item.priceFormatted}</Text>
        <Text style={styles.voucherText}>Voucher applied</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="#2c2f30" />
        </TouchableOpacity>

        <View style={styles.searchBoxOuter}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search packages..."
            placeholderTextColor="rgba(133, 140, 142, 0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearTextBtn}>
              <MaterialIcons name="cancel" size={18} color="#858c8e" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearchSubmit} activeOpacity={0.85}>
            <Text style={styles.searchSubmitText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sorting Options Bar */}
      <View style={styles.sortBar}>
        {SORT_OPTIONS.map(opt => {
          const isActive = activeSort === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.sortTab, isActive && styles.sortTabActive]}
              onPress={() => setActiveSort(opt.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sortTabText, isActive && styles.sortTabTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterBarWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_CHIPS}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.filterBarContainer}
          renderItem={({ item }) => {
            const isSelected = selectedFilters.has(item.id);
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => toggleFilter(item.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Grid Results Body */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#52396f" />
        </View>
      ) : filteredAndSortedPackages.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="search-off" size={48} color="#967BB6" />
          <Text style={styles.emptyTitle}>No products match your search</Text>
          <Text style={styles.emptySub}>Try adjusting your keywords or filters.</Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSearchQuery('');
              setSelectedFilters(new Set());
              fetchPackages('');
            }}
          >
            <Text style={styles.resetBtnText}>Clear Search & Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredAndSortedPackages}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f7',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  searchBoxOuter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#967BB6',
    borderRadius: 8,
    height: 42,
    paddingLeft: 10,
    paddingRight: 3,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#2c2f30',
  },
  clearTextBtn: {
    padding: 4,
    marginRight: 4,
  },
  searchSubmitBtn: {
    backgroundColor: '#52396f',
    borderRadius: 6,
    paddingHorizontal: 14,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSubmitText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#ffffff',
  },

  // Sort Bar
  sortBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sortTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  sortTabActive: {
    borderBottomColor: '#52396f',
  },
  sortTabText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#595c5d',
  },
  sortTabTextActive: {
    fontFamily: 'Manrope_700Bold',
    color: '#52396f',
  },

  // Filter Bar
  filterBarWrap: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  filterBarContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#f0eef5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterChipSelected: {
    backgroundColor: '#e0d5f7',
    borderWidth: 1,
    borderColor: '#967BB6',
  },
  filterChipText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#595c5d',
  },
  filterChipTextSelected: {
    fontFamily: 'Manrope_700Bold',
    color: '#52396f',
  },

  // Grid
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imgContainer: {
    width: '100%',
    height: COLUMN_WIDTH * 0.9,
    position: 'relative',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(82, 57, 111, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 9,
    color: '#ffffff',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#ffffff',
  },

  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#2c2f30',
    lineHeight: 18,
    height: 36,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  locationText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#858c8e',
    marginLeft: 2,
  },
  cardPrice: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 15,
    color: '#52396f',
  },
  voucherText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 10,
    color: '#903985',
    marginTop: 2,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: '#2c2f30',
    marginTop: 12,
  },
  emptySub: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#858c8e',
    marginTop: 4,
    marginBottom: 16,
  },
  resetBtn: {
    backgroundColor: '#52396f',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#ffffff',
  },
});
