import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const { width, height } = Dimensions.get('window');

const getPackageDays = (pkg) => {
  if (pkg.days && pkg.days.length > 0) {
    return pkg.days;
  }
  
  if (pkg.itinerary) {
    try {
      const parsed = typeof pkg.itinerary === 'string' ? JSON.parse(pkg.itinerary) : pkg.itinerary;
      if (parsed && parsed.length > 0) {
        return parsed.map((d, i) => ({
          id: d.id || i + 1,
          title: d.title || `Day ${i + 1}`,
          desc: d.desc || d.description || '',
          accommodation: d.accommodation || '',
          location: d.location || '',
          transport: d.transport || [],
        }));
      }
    } catch (_) {}
  }
  
  const destLower = (pkg.destination || '').toLowerCase();
  const titleLower = (pkg.title || '').toLowerCase();
  
  const isMock = (
    destLower.includes('peru') || titleLower.includes('inca') ||
    destLower.includes('zermatt') || destLower.includes('swiss') || destLower.includes('ch') || titleLower.includes('alpine') ||
    destLower.includes('lisbon') || destLower.includes('portugal') ||
    destLower.includes('istanbul') || destLower.includes('turkey') ||
    destLower.includes('london') || destLower.includes('uk') ||
    destLower.includes('hunza') || titleLower.includes('autumn splendor') || titleLower.includes('autumn') ||
    titleLower.includes('k2 base camp') || titleLower.includes('swat valley') || titleLower.includes('maldives luxury') || titleLower.includes('fairy meadows')
  );

  if (!isMock) {
    return [];
  }
  
  if (destLower.includes('peru') || titleLower.includes('inca')) {
    return [
      {
        id: 1,
        title: 'Arrival in Cusco & Acclimatization',
        desc: 'Meet our local historian guide at Cusco airport. Rest and acclimatize with warm coca tea, followed by a light historical walking tour.',
        accommodation: 'Belmond Hotel Monasterio',
        location: 'Cusco',
        transport: ['Private Van'],
      },
      {
        id: 2,
        title: 'Inca Trail Trek & Sacred Valley',
        desc: 'Begin the journey along the Urubamba River. Explore the ruins of Patallacta and trek through lush Andean valleys.',
        accommodation: 'Luxury Glamping Camp',
        location: 'Sacred Valley',
        transport: ['Trek', 'Private 4x4'],
      },
      {
        id: 3,
        title: 'Machu Picchu Discovery',
        desc: 'Enter through the Sun Gate (Intipunku) for your first panoramic view of Machu Picchu. Enjoy a fully guided private tour of the citadel.',
        accommodation: 'Sanctuary Lodge by Belmond',
        location: 'Machu Picchu',
        transport: ['Trek', 'Expedition Train'],
      },
    ];
  }
  
  if (destLower.includes('zermatt') || destLower.includes('swiss') || destLower.includes('ch') || titleLower.includes('alpine')) {
    return [
      {
        id: 1,
        title: 'Zermatt Arrival & Alpine Spa',
        desc: 'Arrive in car-free Zermatt via the scenic Glacier Express. Check into your mountain-facing suite and enjoy a premium Swiss herbal spa.',
        accommodation: 'The Omnia Mountain Lodge',
        location: 'Zermatt',
        transport: ['Glacier Express Train'],
      },
      {
        id: 2,
        title: 'Matterhorn Glacier Paradise',
        desc: 'Ascend Europe\'s highest cable car station. Explore the glacier palace and enjoy panoramic views of the French, Swiss, and Italian Alps.',
        accommodation: 'The Omnia Mountain Lodge',
        location: 'Matterhorn Peak',
        transport: ['Cable Car'],
      },
      {
        id: 3,
        title: 'Gornergrat Cog Railway Tour',
        desc: 'Ride the historic cogwheel railway up to Gornergrat for unmatched vistas. Followed by a luxury alpine cheese-fondue dinner.',
        accommodation: 'Riffelalp Resort 2222m',
        location: 'Gornergrat',
        transport: ['Cogwheel Train'],
      },
    ];
  }

  if (destLower.includes('lisbon') || destLower.includes('portugal')) {
    return [
      {
        id: 1,
        title: 'Lisbon Arrival & Sunset Cruise',
        desc: 'Check into your historic boutique hotel. In the evening, enjoy a private yacht sunset cruise along the Tagus River with Portuguese wine.',
        accommodation: 'Bairro Alto Hotel',
        location: 'Tagus River',
        transport: ['Private Sedan', 'Yacht'],
      },
      {
        id: 2,
        title: 'Alfama Walk & Fado Evening',
        desc: 'Stroll through the narrow labyrinthine streets of Alfama. Experience a deeply moving live Fado performance at an exclusive candlelit tavern.',
        accommodation: 'Bairro Alto Hotel',
        location: 'Alfama District',
        transport: ['Vintage Tram'],
      },
      {
        id: 3,
        title: 'Sintra Palaces & Cabo da Roca',
        desc: 'Explore the fairytale Pena Palace in Sintra, then drive to Cabo da Roca—the westernmost point of continental Europe.',
        accommodation: 'Palácio de Seteais',
        location: 'Sintra Palace',
        transport: ['Private Cabriolet'],
      },
    ];
  }

  if (destLower.includes('istanbul') || destLower.includes('turkey')) {
    return [
      {
        id: 1,
        title: 'Historic Peninsula Guided Tour',
        desc: 'Visit the majestic Hagia Sophia and the Blue Mosque with an expert art historian. Explore the treasures of Topkapi Palace.',
        accommodation: 'Four Seasons Sultanahmet',
        location: 'Sultanahmet',
        transport: ['Private Vehicle'],
      },
      {
        id: 2,
        title: 'Grand Bazaar & Bosphorus Yacht',
        desc: 'Navigate the colorful corridors of the Grand Bazaar with a personal shopper. Later, enjoy a private luxury yacht charter on the Bosphorus.',
        accommodation: 'Four Seasons Sultanahmet',
        location: 'Bosphorus Strait',
        transport: ['Yacht'],
      },
    ];
  }

  if (destLower.includes('london') || destLower.includes('uk')) {
    return [
      {
        id: 1,
        title: 'Westminster Landmarks & Afternoon Tea',
        desc: 'See Big Ben and Westminster Abbey. In the afternoon, enjoy an award-winning royal high tea experience at The Ritz.',
        accommodation: 'The Savoy London',
        location: 'Westminster',
        transport: ['Black Cab'],
      },
      {
        id: 2,
        title: 'Tower of London & Bateaux Cruise',
        desc: 'View the Crown Jewels before opening hours. Conclude with a gourmet dinner cruise on the River Thames.',
        accommodation: 'The Savoy London',
        location: 'River Thames',
        transport: ['River Boat'],
      },
    ];
  }

  return [
    {
      id: 1,
      title: 'Arrival & Riverside Sunset Glamping',
      desc: 'Welcome to Hunza Valley. Tour briefing followed by an evening sunset walk by the Hunza River and luxury glamping.',
      accommodation: 'Luxus Grand Hotel / Boutique Glamping',
      location: 'Hunza Valley',
      transport: ['Private 4x4 Land Cruiser'],
    },
    {
      id: 2,
      title: 'Historic Forts & Attabad Lake',
      desc: 'Explore the ancient Baltit and Altit Forts, learning about local history. Later, take a private boat tour on the turquoise waters of Attabad Lake.',
      accommodation: 'Attabad Lake Waterfront Resort',
      location: 'Attabad Lake',
      transport: ['Private 4x4 Land Cruiser', 'Boat'],
    },
    {
      id: 3,
      title: 'Passu Cones & Suspension Bridge',
      desc: 'Drive through the scenic Passu Cones, stopping for photographs. Brave the crossing of the hanging Hussaini Suspension Bridge.',
      accommodation: 'Luxus Grand Hotel',
      location: 'Passu Cones',
      transport: ['Private 4x4 Land Cruiser'],
    },
  ];
};

export default function PackageDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const pkg = route.params?.package || {};
  const [fullPkg, setFullPkg] = useState(pkg);
  const { user } = useAuth();
  const isTraveler = user?.role === 'traveler';
  const [wishlisted, setWishlisted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDayId, setSelectedDayId] = useState(1);

  useEffect(() => {
    if (!pkg.id) return;
    let active = true;
    const fetchDetails = async () => {
      try {
        const data = await api.getPackage(pkg.id);
        if (active && data) {
          setFullPkg(prev => ({
            ...prev,
            ...data,
            duration: `${data.duration_days} Days`,
            price: data.price < 10000 ? `$${data.price}` : `PKR ${data.price.toLocaleString()}`,
            img: data.cover_image || prev.img,
            agency: data.agency_name || prev.agency,
            inclusions: (() => { try { return JSON.parse(data.included_services || '[]'); } catch { return []; } })(),
            itinerary: data.itinerary || '[]',
            imageUrls: (data.imageUrls && data.imageUrls.length > 0) ? data.imageUrls : (data.cover_image ? [data.cover_image] : (prev.imageUrls || []))
          }));
        }
      } catch (err) {
        console.error('Error loading full package details:', err);
      }
    };
    fetchDetails();
    return () => { active = false; };
  }, [pkg.id]);

  useEffect(() => {
    if (!isTraveler || !fullPkg.id) return;
    const checkWishlist = async () => {
      try {
        const list = await api.getWishlist();
        const isSaved = list.some(item => item.id === fullPkg.id);
        setWishlisted(isSaved);
      } catch (err) {
        console.error('Error checking wishlist:', err);
      }
    };
    checkWishlist();
  }, [fullPkg.id, isTraveler]);

  const toggleWishlist = async () => {
    if (!isTraveler) return;
    try {
      if (wishlisted) {
        await api.removeFromWishlist(fullPkg.id);
        setWishlisted(false);
      } else {
        await api.addToWishlist(fullPkg.id);
        setWishlisted(true);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const scrollRef = React.useRef(null);
  const dayRefs = React.useRef({});

  const daysData = getPackageDays(fullPkg);

  useEffect(() => {
    if (daysData && daysData.length > 0 && !daysData.some(d => d.id === selectedDayId)) {
      setSelectedDayId(daysData[0].id);
    }
  }, [daysData, selectedDayId]);

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  const handleSelectDay = (dayId, index) => {
    setSelectedDayId(dayId);
    const ref = dayRefs.current[dayId];
    if (ref && scrollRef.current) {
      ref.measureLayout(
        scrollRef.current,
        (x, y) => {
          const scrollOffset = y - 120;
          scrollRef.current?.scrollTo({ y: Math.max(0, scrollOffset), animated: true });
        },
        () => {}
      );
    }
  };

  const selectedDayIndex = daysData.findIndex(d => d.id === selectedDayId);

  // Dynamic fallbacks to support custom user packages and match the exact HTML designs
  const image = fullPkg.img || fullPkg.image || fullPkg.cover_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoCMJq2ZMf1oriN3XfyINSBW0uuiY_bxTzKEAlNXNqyGV55wx2BrDJV3j9XaZsKxPl4zg0HXeKElrN_tK2blgKq50DDrDUP3IA6WBLCytK7dr8VLQ28fsiUG9_uoDOsNc44rDPdSX_mXZci6e4D74-Z4-De8jvDL5zeDp1MCVVA9dml_HMtMSVCodqvWOJX3iOKYpz1QvqIc9TjfAw2e-z_5xjDNeza9Hn2VufdJKQSboLUfwlOHPTtLh6gZzRj7rXvADElHvOIkFA';
  const images = (fullPkg.imageUrls && fullPkg.imageUrls.length > 0) ? fullPkg.imageUrls : [image];
  const title = fullPkg.title || 'Autumn Splendor Expedition';
  const agencyName = fullPkg.agency || fullPkg.agency_name || 'Odyssey Travels';
  const duration = fullPkg.duration || (fullPkg.duration_days ? `${fullPkg.duration_days} Days` : '7 Days');
  const price = fullPkg.price ? (typeof fullPkg.price === 'number' ? `PKR ${fullPkg.price.toLocaleString()}` : fullPkg.price) : 'PKR 45,000';
  const destination = fullPkg.destination || 'HUNZA, PAKISTAN';
  const description = fullPkg.description || 'Experience the breathtaking transformation of the Hunza Valley as it turns into a vibrant tapestry of gold and crimson. This curated expedition offers an exclusive retreat into the Karakoram range, blending architectural discovery with high-altitude serenity. From private orchard walks to stays in historic stone retreats, every moment is designed for the discerning traveler seeking profound beauty.';

  const isMockPkg = (fullPkg.title && (
    fullPkg.title.toLowerCase().includes('autumn splendor') ||
    fullPkg.title.toLowerCase().includes('hunza valley') ||
    fullPkg.title.toLowerCase().includes('k2 base camp') ||
    fullPkg.title.toLowerCase().includes('swat valley') ||
    fullPkg.title.toLowerCase().includes('maldives luxury') ||
    fullPkg.title.toLowerCase().includes('fairy meadows')
  ));

  let inclusions = [];
  if (fullPkg.inclusions && Array.isArray(fullPkg.inclusions) && fullPkg.inclusions.length > 0) {
    inclusions = fullPkg.inclusions;
  } else if (fullPkg.included_services) {
    try {
      inclusions = typeof fullPkg.included_services === 'string' ? JSON.parse(fullPkg.included_services) : fullPkg.included_services;
    } catch (_) {}
  }
  if ((!inclusions || inclusions.length === 0) && isMockPkg) {
    inclusions = ['Luxury Accommodation', 'Gourmet Organic Meals', 'Private 4x4 Transport', 'Professional Historian Guide'];
  }

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.heroImageItem} resizeMode="cover" />
            )}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.45)']}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />

          {/* Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* Navigation Overlays */}
          <View style={[styles.heroNav, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
            <TouchableOpacity
              style={styles.glassBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            {isTraveler && (
              <TouchableOpacity
                style={styles.glassBtn}
                onPress={toggleWishlist}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={wishlisted ? 'favorite' : 'favorite-border'}
                  size={24}
                  color={wishlisted ? '#ba1a1a' : '#ffffff'}
                />
              </TouchableOpacity>
            )}
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

          {/* Journey Route Map (Interactive Bento Card) */}
          {daysData && daysData.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Journey Route Map</Text>
              <View style={styles.mapCard}>
                <View style={styles.mapHeader}>
                  <View style={styles.mapTitleRow}>
                    <MaterialIcons name="explore" size={20} color="#52396f" />
                    <Text style={styles.mapCardTitle}>Interactive Landmark Trace</Text>
                  </View>
                  <Text style={styles.mapSubTitle}>Tap landmarks to view daily schedules</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mapNodesScroll}
                >
                  {daysData.map((day, idx) => {
                    const isSelected = selectedDayId === day.id;
                    return (
                      <View key={day.id} style={styles.mapNodeWrapper}>
                        {idx > 0 && (
                          <View
                            style={[
                              styles.mapLine,
                              idx <= selectedDayIndex ? styles.mapLineActive : styles.mapLineInactive,
                            ]}
                          />
                        )}

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleSelectDay(day.id, idx)}
                          style={styles.mapNodeTouch}
                        >
                          <View
                            style={[
                              styles.mapNodeCircle,
                              isSelected && styles.mapNodeCircleActive,
                            ]}
                          >
                            <MaterialIcons
                              name={isSelected ? "place" : "location-on"}
                              size={isSelected ? 18 : 14}
                              color={isSelected ? '#ffffff' : '#52396f'}
                            />
                          </View>
                          <Text
                            style={[
                              styles.mapNodeText,
                              isSelected && styles.mapNodeTextActive,
                            ]}
                            numberOfLines={1}
                          >
                            {day.location || `Day ${idx + 1}`}
                          </Text>
                          <Text style={styles.mapNodeDayLabel}>Day {idx + 1}</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          ) : null}

          {/* Day-by-Day Itinerary Vertical Section */}
          {daysData && daysData.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detailed Itinerary</Text>
              <View style={styles.itineraryTimeline}>
                {daysData.map((day, idx) => {
                  const isSelected = selectedDayId === day.id;
                  return (
                    <View
                      key={day.id}
                      ref={(el) => (dayRefs.current[day.id] = el)}
                      style={styles.itineraryDayWrapper}
                    >
                      {/* Vertical line indicator */}
                      {idx < daysData.length - 1 && (
                        <View style={styles.timelineVerticalLine} />
                      )}

                      {/* Timeline Node Icon/Dot */}
                      <View style={[
                        styles.timelineDot,
                        isSelected && styles.timelineDotActive
                      ]}>
                        <Text style={[
                          styles.timelineDotText,
                          isSelected && styles.timelineDotTextActive
                        ]}>{idx + 1}</Text>
                      </View>

                      {/* Bento Card */}
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setSelectedDayId(day.id)}
                        style={[
                          styles.itineraryCard,
                          isSelected && styles.itineraryCardActive
                        ]}
                      >
                        <Text style={styles.itineraryDayHeader}>DAY {idx + 1}</Text>
                        <Text style={styles.itineraryDayTitle}>{day.title || `Day ${idx + 1}`}</Text>
                        <Text style={styles.itineraryDayDesc}>{day.desc}</Text>

                        {/* Day Metadata (Accommodation / Location) */}
                        <View style={styles.itineraryMetaContainer}>
                          {day.accommodation ? (
                            <View style={styles.itineraryMetaChip}>
                              <MaterialIcons name="hotel" size={14} color="#52396f" />
                              <Text style={styles.itineraryMetaLabel} numberOfLines={1}>
                                {day.accommodation}
                              </Text>
                            </View>
                          ) : null}

                          {day.location ? (
                            <View style={styles.itineraryMetaChip}>
                              <MaterialIcons name="place" size={14} color="#52396f" />
                              <Text style={styles.itineraryMetaLabel} numberOfLines={1}>
                                {day.location}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        {day.transport && day.transport.length > 0 ? (
                          <View style={styles.itineraryTransportRow}>
                            <Text style={styles.itineraryTransportTitle}>Transport:</Text>
                            <View style={styles.itineraryTransportChips}>
                              {day.transport.map((trsp, tIdx) => (
                                <View key={tIdx} style={styles.transportMiniChip}>
                                 <MaterialIcons
                                    name={
                                      trsp.toLowerCase().includes('flight') ? 'flight' :
                                      trsp.toLowerCase().includes('yacht') || trsp.toLowerCase().includes('boat') ? 'directions-boat' :
                                      trsp.toLowerCase().includes('train') ? 'train' : 'directions-car'
                                    }
                                    size={12}
                                    color="#967BB6"
                                  />
                                  <Text style={styles.transportMiniLabel}>{trsp}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Inclusions */}
          {inclusions && inclusions.length > 0 ? (
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
          ) : null}

          {/* Agency Profile Card */}
          <View style={styles.agencyCard}>
            <View style={styles.agencyCardLeft}>
              {agencyName.toLowerCase().includes('odyssey') ? (
                <View style={styles.agencyLogoWrap}>
                  <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCO_vPmNe2XQwno3QVmaOZ-7udhLHCkNLy2oQKJ2zNVW6y70Lx-weUO67_9UvVL6EY7-P-YJoRsbTOSFWss5sPmauzQGtlNcjIYQiA6tCjITiQT5nAsA1fn9ZkCbgRx3O5DYaYnfFhX5nxAvB8X5XaJ1dFdGPrr39JFyvaGH1IySQw-GUo9hkvjIC3bCJzX9W7KRyTzTBphsIsO5NkznQyUTJlhh7bgh01a2FRJolZ6fn4WgA_kvx1CbZ61AFViKlw3l_xaJD55ZrFM' }}
                    style={styles.agencyLogo}
                  />
                </View>
              ) : (
                <View style={[styles.agencyLogoWrap, { backgroundColor: (() => {
                  let hash = 0;
                  for (let i = 0; i < agencyName.length; i++) {
                    hash = agencyName.charCodeAt(i) + ((hash << 5) - hash);
                  }
                  const colors = ['#967BB6', '#52396f', '#6A5188', '#B29CCF', '#7b2cbf', '#9d4edd', '#c77dff'];
                  const index = Math.abs(hash) % colors.length;
                  return colors[index];
                })() }]}>
                  <Text style={{ color: '#ffffff', fontFamily: 'Epilogue_700Bold', fontSize: 24 }}>
                    {agencyName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.agencyCardMeta}>
                <Text style={styles.agencyCardTitle}>{agencyName}</Text>
                <Text style={styles.agencyCardSub}>
                  {agencyName.toLowerCase().includes('odyssey') ? 'Premier High-Altitude Specialist' : 'Verified Platform Partner'}
                </Text>
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
  heroImageItem: { width: width, height: '100%', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  pagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#ffffff',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
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
    shadowColor: '#6A5188',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 6,
  },
  ctaButtonText: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },

  // Journey Map Bento Card
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#edeeef',
  },
  mapHeader: {
    marginBottom: 20,
  },
  mapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  mapCardTitle: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 16,
    color: '#191c1d',
  },
  mapSubTitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#595c5d',
    paddingLeft: 28,
  },
  mapNodesScroll: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  mapNodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapLine: {
    height: 3,
    width: 50,
    marginTop: -28, // Offset to align with center of circle
  },
  mapLineActive: {
    backgroundColor: '#967BB6',
  },
  mapLineInactive: {
    backgroundColor: 'rgba(82, 57, 111, 0.1)',
  },
  mapNodeTouch: {
    alignItems: 'center',
    width: 110,
  },
  mapNodeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(82, 57, 111, 0.1)',
  },
  mapNodeCircleActive: {
    backgroundColor: '#967BB6',
    borderColor: '#E8E1F0',
    shadowColor: '#967BB6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  mapNodeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#595c5d',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  mapNodeTextActive: {
    color: '#52396f',
    fontFamily: 'Manrope_700Bold',
  },
  mapNodeDayLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: '#a0a2a3',
    marginTop: 2,
  },

  // Detailed Itinerary Timeline
  itineraryTimeline: {
    position: 'relative',
    paddingLeft: 12,
    marginTop: 8,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 20,
    top: 36,
    bottom: -20,
    width: 2,
    backgroundColor: 'rgba(82, 57, 111, 0.12)',
  },
  timelineDot: {
    position: 'absolute',
    left: 4,
    top: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(82, 57, 111, 0.1)',
  },
  timelineDotActive: {
    backgroundColor: '#967BB6',
    borderColor: '#E8E1F0',
  },
  timelineDotText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#595c5d',
  },
  timelineDotTextActive: {
    color: '#ffffff',
  },
  itineraryDayWrapper: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingLeft: 36,
    position: 'relative',
  },
  itineraryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#edeeef',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  itineraryCardActive: {
    borderColor: '#967BB6',
    borderWidth: 1.5,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    backgroundColor: '#F8F6FC',
  },
  itineraryDayHeader: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: '#967BB6',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  itineraryDayTitle: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 18,
    color: '#191c1d',
    marginBottom: 8,
  },
  itineraryDayDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#4a454e',
    lineHeight: 22,
    marginBottom: 14,
  },
  itineraryMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  itineraryMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  itineraryMetaLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#52396f',
    maxWidth: 150,
  },
  itineraryTransportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f5',
    paddingTop: 10,
  },
  itineraryTransportTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#595c5d',
  },
  itineraryTransportChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  transportMiniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 123, 182, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  transportMiniLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#52396f',
  },
});
