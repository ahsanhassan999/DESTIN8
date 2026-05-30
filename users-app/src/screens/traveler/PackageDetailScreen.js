import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function PackageDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const pkg = route.params?.package || {};
  const [wishlisted, setWishlisted] = useState(false);

  // Dynamic fallbacks to support custom user packages and match the exact HTML designs
  const image = pkg.img || pkg.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoCMJq2ZMf1oriN3XfyINSBW0uuiY_bxTzKEAlNXNqyGV55wx2BrDJV3j9XaZsKxPl4zg0HXeKElrN_tK2blgKq50DDrDUP3IA6WBLCytK7dr8VLQ28fsiUG9_uoDOsNc44rDPdSX_mXZci6e4D74-Z4-De8jvDL5zeDp1MCVVA9dml_HMtMSVCodqvWOJX3iOKYpz1QvqIc9TjfAw2e-z_5xjDNeza9Hn2VufdJKQSboLUfwlOHPTtLh6gZzRj7rXvADElHvOIkFA';
  const title = pkg.title || 'Autumn Splendor Expedition';
  const agencyName = pkg.agency || 'Odyssey Travels';
  const duration = pkg.duration || '7 Days';
  const price = pkg.price || 'PKR 45,000';
  const destination = pkg.destination || 'HUNZA, PAKISTAN';
  const description = pkg.description || 'Experience the breathtaking transformation of the Hunza Valley as it turns into a vibrant tapestry of gold and crimson. This curated expedition offers an exclusive retreat into the Karakoram range, blending architectural discovery with high-altitude serenity. From private orchard walks to stays in historic stone retreats, every moment is designed for the discerning traveler seeking profound beauty.';
  const inclusions = pkg.inclusions || ['Luxury Accommodation', 'Gourmet Organic Meals', 'Private 4x4 Transport', 'Professional Historian Guide'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Image source={{ uri: image }} style={styles.heroImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.45)']}
            style={StyleSheet.absoluteFillObject}
          />
          
          {/* Navigation Overlays */}
          <View style={[styles.heroNav, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
            <TouchableOpacity
              style={styles.glassBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.glassBtn}
              onPress={() => setWishlisted(!wishlisted)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={wishlisted ? 'favorite' : 'favorite-border'}
                size={24}
                color={wishlisted ? '#ba1a1a' : '#ffffff'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Canvas */}
        <View style={styles.content}>
          {/* Identity Section */}
          <View style={styles.identity}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified Agency</Text>
            </View>
            <Text style={styles.titleText}>{title}</Text>
            <View style={styles.agencyRow}>
              <MaterialIcons name="domain" size={18} color="#52396f" />
              <Text style={styles.agencyNameText}>{agencyName}</Text>
            </View>
          </View>

          {/* Info Chips */}
          <View style={styles.chipsContainer}>
            <View style={styles.chip}>
              <MaterialIcons name="schedule" size={18} color="#52396f" />
              <Text style={styles.chipText}>{duration.toUpperCase()}</Text>
            </View>
            <View style={styles.chip}>
              <MaterialIcons name="payments" size={18} color="#52396f" />
              <Text style={styles.chipText}>{price.toUpperCase()}</Text>
            </View>
            <View style={styles.chip}>
              <MaterialIcons name="location-on" size={18} color="#52396f" />
              <Text style={styles.chipText}>{destination.toUpperCase()}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Package</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>

          {/* Inclusions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Included</Text>
            <View style={styles.inclusionsGrid}>
              {inclusions.map((inc, index) => (
                <View key={index} style={styles.inclusionCard}>
                  <View style={styles.checkWrap}>
                    <MaterialIcons name="check-circle" size={18} color="#52396f" />
                  </View>
                  <Text style={styles.inclusionText}>{inc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Agency Profile Card */}
          <View style={styles.agencyCard}>
            <View style={styles.agencyCardLeft}>
              <View style={styles.agencyLogoWrap}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO_vPmNe2XQwno3QVmaOZ-7udhLHCkNLy2oQKJ2zNVW6y70Lx-weUO67_9UvVL6EY7-P-YJoRsbTOSFWss5sPmauzQGtlNcjIYQiA6tCjITiQT5nAsA1fn9ZkCbgRx3O5DYaYnfFhX5nxAvB8X5XaJ1dFdGPrr39JFyvaGH1IySQw-GUo9hkvjIC3bCJzX9W7KRyTzTBphsIsO5NkznQyUTJlhh7bgh01a2FRJolZ6fn4WgA_kvx1CbZ61AFViKlw3l_xaJD55ZrFM' }}
                  style={styles.agencyLogo}
                />
              </View>
              <View style={styles.agencyCardMeta}>
                <Text style={styles.agencyCardTitle}>{agencyName}</Text>
                <Text style={styles.agencyCardSub}>Premier High-Altitude Specialist</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewProfileBtn} activeOpacity={0.8}>
              <Text style={styles.viewProfileText}>VIEW PROFILE</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.bottomCTA, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaButtonText}>Enquire Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  hero: { height: height * 0.45, position: 'relative' },
  heroImage: { width: '100%', height: '100%', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  heroNav: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: 20, marginTop: 24 },

  // Identity Section
  identity: { gap: 12 },
  verifiedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(82, 57, 111, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(82, 57, 111, 0.1)',
  },
  verifiedText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#52396f',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  titleText: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 28,
    color: '#191c1d',
    lineHeight: 34,
  },
  agencyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  agencyNameText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: '#52396f',
  },

  // Info Chips
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 9999,
    gap: 8,
  },
  chipText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#191c1d',
    letterSpacing: 0.5,
  },

  // Descriptions / Sections
  section: { marginTop: 36 },
  sectionTitle: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 20,
    color: '#191c1d',
    marginBottom: 16,
  },
  descriptionText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: '#4a454e',
    lineHeight: 26,
  },

  // Inclusions Grid
  inclusionsGrid: { gap: 12 },
  inclusionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#edeeef',
    gap: 12,
  },
  checkWrap: {
    backgroundColor: 'rgba(82, 57, 111, 0.08)',
    padding: 6,
    borderRadius: 9999,
  },
  inclusionText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: '#191c1d',
  },

  // Agency Card
  agencyCard: {
    marginTop: 36,
    backgroundColor: '#f3f4f5',
    borderRadius: 16,
    padding: 24,
    gap: 20,
  },
  agencyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  agencyLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e7e8e9',
    overflow: 'hidden',
  },
  agencyLogo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  agencyCardMeta: { flex: 1, gap: 4 },
  agencyCardTitle: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 18,
    color: '#191c1d',
  },
  agencyCardSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#4a454e',
  },
  viewProfileBtn: {
    borderWidth: 1,
    borderColor: '#52396f',
    borderRadius: 9999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#52396f',
    letterSpacing: 0.5,
  },

  // Sticky Bottom CTA
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 249, 250, 0.85)',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#967BB6',
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(106, 81, 136, 0.25)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 6,
  },
  ctaButtonText: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
});
