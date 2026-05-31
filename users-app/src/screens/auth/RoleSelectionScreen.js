import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Local colorful premium assets
const TRAVELER_BG = require('../../../assets/traveler_bg.png');
const AGENCY_BG = require('../../../assets/agency_bg.png');

// Stitch Theme Colors matching role selection prototype
const PRIMARY = '#967BB6';       // Primary lavender
const PRIMARY_DIM = '#7A5DA1';   // Primary dim lavender
const ON_SURF = '#2C2F30';       // On surface dark grey
const ON_SURF_VAR = '#595C5D';   // On surface variant medium grey
const SURFACE = '#F5F6F7';       // Surface background grey

export default function RoleSelectionScreen({ navigation }) {
  const [selected, setSelected] = useState(null); // 'traveler' | 'agency'
  const insets = useSafeAreaInsets();

  const onNext = () => {
    if (!selected) return;
    navigation.navigate(selected === 'traveler' ? 'TravelerSignUp' : 'AgencySignUp');
  };

  return (
    <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
      {/* ── Fixed Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={s.logo}>DESTIN8</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Asymmetrical Background Elements for Kinetic Editorial look */}
      <View style={s.bgOrb1} pointerEvents="none" />
      <View style={s.bgOrb2} pointerEvents="none" />

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: 140 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        {/* ── Hero Section ── */}
        <View style={s.hero}>
          <Text style={s.stepTag}>Step 01 / Registration</Text>
          <Text style={s.heroTitle}>
            Choose your{'\n'}
            <Text style={s.heroItalic}>journey</Text>.
          </Text>
        </View>

        {/* ── Cards Grid ── */}
        <View style={s.grid}>
          {/* Traveler Card */}
          <TouchableOpacity
            style={s.cardWrap}
            onPress={() => setSelected('traveler')}
            activeOpacity={0.95}
          >
            <Image source={TRAVELER_BG} style={s.travelerBg} resizeMode="cover" />
            <View style={[s.card, s.cardTraveler, selected === 'traveler' && s.cardSelected]}>
              <View style={s.cardTop}>
                <MaterialIcons name="person-pin-circle" size={36} color={PRIMARY} />
                <View style={[s.radio, selected === 'traveler' && s.radioOn]}>
                  {selected === 'traveler' && <View style={s.radioDot} />}
                </View>
              </View>
              <Text style={s.cardTitle}>I'm a Traveler</Text>
              <Text style={s.cardDesc}>
                Curate your personal dream vacations and discover hidden gems around the globe.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Agency Card */}
          <TouchableOpacity
            style={s.cardWrap}
            onPress={() => setSelected('agency')}
            activeOpacity={0.95}
          >
            <Image source={AGENCY_BG} style={s.agencyBg} resizeMode="cover" />
            <View style={[s.card, s.cardAgency, selected === 'agency' && s.cardSelected]}>
              <View style={s.cardTop}>
                <MaterialIcons name="travel-explore" size={36} color={PRIMARY} />
                <View style={[s.radio, selected === 'agency' && s.radioOn]}>
                  {selected === 'agency' && <View style={s.radioDot} />}
                </View>
              </View>
              <Text style={s.cardTitle}>I'm a Travel Agency</Text>
              <Text style={s.cardDesc}>
                Build and manage premium itineraries for your clients with our professional toolset.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Footer Actions ── */}
        <View style={s.footer}>
          <View style={s.infoRow}>
            <MaterialIcons name="info" size={20} color={ON_SURF_VAR} />
            <Text style={s.infoTxt}>You cannot change your account type later.</Text>
          </View>
          <TouchableOpacity
            style={[s.nextBtn, !selected && s.nextBtnOff]}
            onPress={onNext}
            disabled={!selected}
            activeOpacity={0.9}
          >
            <Text style={s.nextTxt}>Next Step</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom Navigation Shell (Help/Terms only) ── */}
      <View style={[s.bottomBar, { height: 74 + insets.bottom, paddingBottom: insets.bottom }]}>
        <TouchableOpacity style={s.bottomItem} activeOpacity={0.7}>
          <MaterialIcons name="help-outline" size={22} color="#9CA3AF" />
          <Text style={s.bottomLabel}>Help</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.bottomItem} activeOpacity={0.7}>
          <MaterialIcons name="description" size={22} color="#9CA3AF" />
          <Text style={s.bottomLabel}>Terms</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SURFACE,
  },

  // Header styles
  header: {
    height: 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 47, 48, 0.06)',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    color: PRIMARY,
    letterSpacing: -1,
  },

  // Background blur elements
  bgOrb1: {
    position: 'absolute',
    top: 40,
    left: -64,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#D1C4E9', // Light lavender orb
    opacity: 0.2,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 200,
    right: -64,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#cecdff', // Light blue-purple orb
    opacity: 0.3,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // Hero Section
  hero: {
    marginTop: 12,
    marginBottom: 32,
  },
  stepTag: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: PRIMARY,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 48,
    color: ON_SURF,
    lineHeight: 52,
    letterSpacing: -1.5,
  },
  heroItalic: {
    fontFamily: 'Epilogue_700Bold',
    fontStyle: 'italic',
    color: PRIMARY_DIM,
  },

  // Cards Grid
  grid: {
    gap: 32,
    marginBottom: 48,
  },
  cardWrap: {
    position: 'relative',
  },
  travelerBg: {
    position: 'absolute',
    top: 0,
    left: -8,
    width: 240,
    height: 300,
    borderRadius: 16,
    transform: [{ rotate: '-4deg' }],
  },
  agencyBg: {
    position: 'absolute',
    top: 0,
    right: -8,
    width: 260,
    height: 240,
    borderRadius: 16,
    transform: [{ rotate: '3deg' }],
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    marginTop: 80,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(171, 173, 174, 0.1)',
  },
  cardTraveler: {
    marginLeft: 24,
    marginRight: 8,
  },
  cardAgency: {
    marginRight: 24,
    marginLeft: 8,
  },
  cardSelected: {
    borderColor: PRIMARY,
    borderWidth: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  radio: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(150, 123, 182, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: PRIMARY,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: PRIMARY,
  },
  cardTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 28,
    color: ON_SURF,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  cardDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: ON_SURF_VAR,
    lineHeight: 22,
  },

  // Footer Actions
  footer: {
    gap: 24,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  infoTxt: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: ON_SURF_VAR,
    flex: 1,
    lineHeight: 20,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PRIMARY,
    borderRadius: 32,
    paddingVertical: 18,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
  },
  nextBtnOff: {
    backgroundColor: '#DADDDF',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextTxt: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: '#fff',
  },

  // Bottom navigation bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(171, 173, 174, 0.08)',
    shadowColor: 'rgba(44, 47, 48, 0.06)',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  bottomLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
