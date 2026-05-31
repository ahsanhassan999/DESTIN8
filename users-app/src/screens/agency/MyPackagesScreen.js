import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/AppHeader';

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
  const [packages, setPackages] = useState([
    {
      id: '1',
      title: 'Autumn Splendor Expedition',
      tags: ['Adventure', 'Luxury'],
      description: 'Experience the ethereal beauty of Hunza valley as it turns golden under the autumn sun. A curated high-altitude retreat.',
      price: '45,000',
      duration: '5',
      status: 'Published',
      imageUrls: [
        'https://lh3.googleusercontent.com/aida/ADBb0uigouzg6XqCbiRm8DdvWkha3BTvxc-cQuf13paZdSSqs-_Q_k8tupor81o6BP3fP5ZZbg3NeFPP9zxX5Juu93UAHYrtiCRjTuLQs2yFx393Tj69XECdUYwISFgNoD6uFmDdENnwc48OoRLjpuXz8q4TpBrJFl3I0AljsPSKTnPrVXClBxMrwv-Hm_WuwZKBxcUtyrNsvs84nL2Kvth0D9Yv92-dSDUud0ZOeuVMOyeKv1s8HsWTmDaMIHQG',
      ],
    },
    {
      id: '2',
      title: 'Coastal Serenity Getaway',
      tags: ['Relaxation'],
      description: 'Untouched beaches and crystal clear waters of Ormara. A minimal luxury escape for those seeking absolute silence.',
      price: '28,500',
      duration: '3',
      status: 'Draft',
      imageUrls: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC_AXSD8dR4gKvzwZejbPVEV6AuIb3Z1CTV1Pp0RPE62Hif33zj43V_ObdAywd44nfM9c9EZ9cz1n0J-RJ6kxZiFi68pa2ldr7ngj255UTZk5mDLNWvcZtYOwQKnfKGhUFdMu1oPVwzkWCABlXaBx_379Ip64flB2bFasveKQRsObxz6dF0jZgOwWI06k_gZfbOV5tQH9TjeLytOdRMUWy15EmI9YAq6aej6Zb4I_MszxvUk01Ua7nkQIu81wxPYgPRGqw775hC1ItT',
      ],
    },
  ]);

  const toggleStatus = (id) => {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: p.status === 'Published' ? 'Draft' : 'Published',
          };
        }
        return p;
      })
    );
  };

  const handleDelete = (id) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <MaterialIcons name="search" size={22} color={C.onSurfVar} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your packages..."
            placeholderTextColor="rgba(89, 92, 93, 0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.tuneBtn} activeOpacity={0.7}>
            <MaterialIcons name="tune" size={22} color={C.primary} />
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

        {/* Packages List */}
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
                <View style={styles.imageOverlay}>
                  <View style={styles.tagsRow}>
                    {pkg.tags.map((tag) => (
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
                    <MaterialIcons name="payments" size={18} color={C.primary} />
                    <Text style={styles.metaText}>Rs. {pkg.price}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <MaterialIcons name="schedule" size={18} color={C.primary} />
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
                      onValueChange={() => toggleStatus(pkg.id)}
                    />
                    <Text style={styles.statusLabel}>{pkg.status}</Text>
                  </View>

                  <View style={styles.iconsWrap}>
                    <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
                      <MaterialIcons name="edit" size={20} color={C.onSurfVar} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      activeOpacity={0.7}
                      onPress={() => handleDelete(pkg.id)}
                    >
                      <MaterialIcons name="delete" size={20} color={C.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
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
});
