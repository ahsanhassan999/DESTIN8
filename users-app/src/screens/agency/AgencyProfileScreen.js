import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function AgencyProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const getInitials = (name) => {
    if (!name) return 'OT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const name = user?.name || 'Odyssey Travels';
  const email = user?.email || 'contact@odysseytravels.com';
  const initials = getInitials(name);

  const MENU = [
    { icon: 'account-balance', label: 'Bank Account Setup', onPress: () => navigation.navigate('BankDetails') },
    { icon: 'account-balance-wallet', label: 'Wallet & Payouts', onPress: () => navigation.navigate('AgencyWallet') },
    { icon: 'card-travel', label: 'Manage Packages', onPress: () => navigation.navigate('Post Package') },
    { icon: 'chat', label: 'Messages & Inquiries', onPress: () => navigation.navigate('Chat') },
    { icon: 'star', label: 'Customer Reviews', onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      {/* Absolute Positioned Back Button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <MaterialIcons name="arrow-back" size={24} color="#52396f" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header with Gradient Background */}
        <LinearGradient
          colors={['#E3DBEC', '#f8f9fa']}
          style={[styles.hero, { paddingTop: insets.top + 60 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Avatar Wrap */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          
          {/* Name & Email */}
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          
          {/* Role Chip */}
          <View style={styles.roleChip}>
            <Text style={styles.roleText}>VERIFIED AGENCY</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>8</Text>
            <Text style={styles.statLabel} numberOfLines={2}>Active Packages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>42</Text>
            <Text style={styles.statLabel} numberOfLines={2}>Bookings Managed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>4.9</Text>
            <Text style={styles.statLabel} numberOfLines={2}>Agency Rating</Text>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.menuContainer}>
          {MENU.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <MaterialIcons name={item.icon} size={22} color="#967BB6" style={{ backgroundColor: 'transparent' }} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#7b757f" style={{ backgroundColor: 'transparent' }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Row */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => { await logout(); }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={20} color="#ba1a1a" style={{ backgroundColor: 'transparent' }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(82, 57, 111, 0.1)',
  },
  hero: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#6a5188',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(106, 81, 136, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 16,
  },
  avatarText: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 28,
    color: '#e4cbff',
  },
  name: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 28,
    color: '#191c1d',
    marginBottom: 6,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  email: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#4a454e',
    marginBottom: 16,
  },
  roleChip: {
    backgroundColor: 'rgba(150, 123, 182, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  roleText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#967BB6',
    letterSpacing: 1.2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: -24,
    marginBottom: 40,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.05)',
  },
  statVal: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 24,
    color: '#967BB6',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#4a454e',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f5',
    borderRadius: 16,
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: '#191c1d',
  },
  logoutContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.1)',
  },
  logoutText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#ba1a1a',
  },
});
