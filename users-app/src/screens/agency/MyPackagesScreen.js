import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

const C = {
  primary: '#967BB6',       // Lavender primary
  container: '#E8E1F0',     // Lavender container
  onSurf: '#2C2F30',
  onSurfVar: '#595C5D',
  surfLow: '#EFF1F2',
  background: '#F5F6F7',
  error: '#B41340',
  errBg: '#FFE4EC',
};

const CustomSwitch = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[
        styles.switchTrack,
        value ? styles.switchTrackActive : styles.switchTrackInactive,
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          value ? styles.switchThumbActive : styles.switchThumbInactive,
        ]}
      />
    </TouchableOpacity>
  );
};

export default function MyPackagesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPackages = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await api.getMyPackages();
      const normalized = data.map(p => ({
        id: p.id,
        title: p.title,
        tags: (() => { try { return JSON.parse(p.included_services || '[]'); } catch { return ['Package']; } })(),
        description: p.description,
        price: p.price?.toLocaleString() || '0',
        duration: String(p.duration_days || 1),
        status: p.is_active ? 'Published' : 'Draft',
        imageUrls: p.cover_image ? [p.cover_image] : [],
        raw: p,
      }));
      setPackages(normalized);
    } catch (err) {
      console.error('Error loading packages:', err);
      setPackages([]);
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

  const toggleStatus = async (pkg) => {
    const currentStatus = pkg.status;
    const newIsActive = currentStatus !== 'Published';

    if (newIsActive && pkg.raw?.is_takedown) {
      Alert.alert(
        "Action Blocked",
        `This package has been taken down by the administrator.\n\nReason: ${pkg.raw.takedown_reason || 'No reason provided.'}\n\nPlease open a support ticket to resolve this.`,
        [{ text: "OK" }]
      );
      return;
    }

    // Optimistic update
    setPackages(prev =>
      prev.map(p => p.id === pkg.id ? { ...p, status: newIsActive ? 'Published' : 'Draft' } : p)
    );
    try {
      await api.updatePackage(pkg.id, { is_active: newIsActive });
    } catch (err) {
      console.error('Error toggling status:', err);
      // Revert on failure
      setPackages(prev =>
        prev.map(p => p.id === pkg.id ? { ...p, status: currentStatus } : p)
      );
      Alert.alert("Error", err.message || "Failed to update package status.");
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this package?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            let originalPackages;
            setPackages(prev => {
              originalPackages = prev;
              return prev.filter(p => p.id !== id);
            });
            try {
              await api.deletePackage(id);
              Alert.alert("Success", "Package deleted successfully.");
            } catch (err) {
              console.error('Error deleting package:', err);
              if (originalPackages) {
                setPackages(originalPackages);
              } else {
                loadPackages(false);
              }
              const errMsg = err?.message || '';
              if (errMsg.toLowerCase().includes('locked') || errMsg.toLowerCase().includes('ticket')) {
                Alert.alert(
                  "Delete Blocked",
                  "This package is locked because it has confirmed bookings past the refund deadline. Direct deletions are not allowed. Please submit a support/compensation ticket in the edit screen.",
                  [{ text: "OK" }]
                );
              } else {
                Alert.alert("Error", err.message || "Failed to delete package.");
              }
            }
          }
        }
      ]
    );
  };


  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(pkg.tags) ? pkg.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) : false)
  );

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} />

      {/* Asymmetrical Background Elements */}
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />

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
        {/* Header Section */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Packages</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{packages.length}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={22} color={C.onSurfVar} style={[styles.searchIcon, { backgroundColor: 'transparent' }]} />
          <TextInput
            style={[styles.searchInput, { backgroundColor: 'transparent' }]}
            placeholder="Search your packages..."
            placeholderTextColor="rgba(89, 92, 93, 0.4)"
            underlineColorAndroid="transparent"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={[styles.tuneBtn, { backgroundColor: 'transparent' }]} activeOpacity={0.7}>
            <MaterialIcons name="tune" size={22} color={C.primary} style={{ backgroundColor: 'transparent' }} />
          </TouchableOpacity>
        </View>

        {/* Post Package CTA */}
        <TouchableOpacity
          style={styles.postBtn}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('PostPackageForm')}
        >
          <MaterialIcons name="add" size={22} color="#fff" />
          <Text style={styles.postBtnTxt}>Post New Package</Text>
        </TouchableOpacity>

        {/* Loading */}
        {loading ? (
          <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 48 }} />
        ) : filteredPackages.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <MaterialIcons name="inventory-2" size={56} color="rgba(150,123,182,0.25)" />
            <Text style={{ fontFamily: 'Epilogue_700Bold', fontSize: 18, color: C.onSurf, marginTop: 16 }}>
              {searchQuery ? 'No matches found' : 'No packages yet'}
            </Text>
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: C.onSurfVar, textAlign: 'center', marginTop: 8, paddingHorizontal: 32 }}>
              {searchQuery ? 'Try a different title or tag.' : 'Tap "Post New Package" to create your first package.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredPackages.map((pkg) => (
            <View key={pkg.id} style={styles.card}>
              {/* Image Banner */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: (pkg.imageUrls && pkg.imageUrls.length > 0) ? pkg.imageUrls[0] : pkg.image }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.75)']}
                  style={StyleSheet.absoluteFill}
                />
                
                {/* Approval Status Badge */}
                <View style={[
                  styles.approvalBadge, 
                  pkg.raw.has_pending_approval ? styles.approvalPending : styles.approvalLive
                ]}>
                  <Text style={styles.approvalBadgeTxt}>
                    {pkg.raw.has_pending_approval ? "PENDING APPROVAL" : "LIVE"}
                  </Text>
                </View>

                <View style={styles.imageOverlay}>
                  <View style={styles.tagsRow}>
                    {(Array.isArray(pkg.tags) ? pkg.tags : []).map((tag) => (
                      <View key={tag} style={styles.tagPill}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.cardTitle}>{pkg.title}</Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.cardDetails}>
                <Text style={styles.cardDesc}>{pkg.description}</Text>

                {/* Meta Rows */}
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <MaterialIcons name="payments" size={18} color={C.primary} style={{ backgroundColor: 'transparent' }} />
                    <Text style={styles.metaText}>Rs. {pkg.price}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <MaterialIcons name="schedule" size={18} color={C.primary} style={{ backgroundColor: 'transparent' }} />
                    <Text style={styles.metaText}>{pkg.duration} Days</Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Bottom Actions */}
                <View style={styles.actionRow}>
                  <View style={styles.statusWrap}>
                    <CustomSwitch
                      value={pkg.status === 'Published'}
                    onValueChange={() => toggleStatus(pkg)}
                    />
                    <Text style={styles.statusLabel}>{pkg.status}</Text>
                  </View>

                  <View style={styles.iconsWrap}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('PackageDetail', { package: pkg.raw })}
                    >
                      <MaterialIcons name="visibility" size={20} color={C.primary} style={{ backgroundColor: 'transparent' }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('PostPackageForm', { package: pkg.raw })}
                    >
                      <MaterialIcons name="edit" size={20} color={C.onSurfVar} style={{ backgroundColor: 'transparent' }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      activeOpacity={0.7}
                      onPress={() => handleDelete(pkg.id)}
                    >
                      <MaterialIcons name="delete" size={20} color={C.error} style={{ backgroundColor: 'transparent' }} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            ))}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // Background blur elements
  bgOrb1: {
    position: 'absolute',
    top: 100,
    left: -64,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#E8E1F0',
    opacity: 0.2,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 120,
    right: -64,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#cecdff',
    opacity: 0.3,
  },

  // Header Row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 32,
    color: C.onSurf,
  },
  badge: {
    backgroundColor: C.surfLow,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.08)',
  },
  badgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: C.primary,
  },

  // Search Bar
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    height: 54,
    paddingHorizontal: 20,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.04)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: C.onSurf,
    padding: 0,
  },
  tuneBtn: {
    padding: 4,
  },

  // Post Button
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 16,
    height: 56,
    gap: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 32,
  },
  postBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: '#ffffff',
  },

  // Packages list
  list: {
    gap: 28,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.04)',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 5,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 32,
    color: '#ffffff',
    lineHeight: 38,
  },

  // Card details
  cardDetails: {
    padding: 24,
  },
  cardDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: C.onSurfVar,
    lineHeight: 22,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surfLow,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  metaText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: C.onSurf,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(44, 47, 48, 0.08)',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: C.onSurfVar,
  },
  iconsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },

  // Switch styles
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: '#967BB6',
  },
  switchTrackInactive: {
    backgroundColor: '#E1E3E4',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    alignSelf: 'flex-start',
  },
  approvalBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  approvalPending: {
    backgroundColor: '#D97706', // Premium dark amber/yellow
  },
  approvalLive: {
    backgroundColor: '#059669', // Premium emerald/green
  },
  approvalBadgeTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
