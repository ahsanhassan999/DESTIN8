import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

export default function TravelerProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const MENU = [
    { icon: 'card-travel', label: 'My Bookings',     sub: 'View booking history' },
    { icon: 'favorite-border', label: 'Saved Packages',  sub: 'Your wishlist',       onPress: () => navigation.navigate('Wishlist') },
    { icon: 'star-border', label: 'My Reviews',      sub: 'Ratings you\'ve given' },
    { icon: 'notifications-none', label: 'Notifications',   sub: 'Manage alerts' },
    { icon: 'lock-outline', label: 'Change Password', sub: 'Update credentials' },
    { icon: 'help-outline', label: 'Help & Support',  sub: 'Contact us' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero with dynamic status bar inset */}
        <LinearGradient
          colors={[Colors.plum, Colors.lavender]}
          style={[styles.hero, { paddingTop: insets.top + 24 }]}
          start={{x:0,y:0}}
          end={{x:1,y:1}}
        >
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.initials || 'AH'}</Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.name || 'Ahmed Hassan'}</Text>
          <Text style={styles.email}>{user?.email || 'traveler@test.com'}</Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleText}>✦ Traveler</Text>
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsCard}>
          {[{ val: '0', label: 'Trips' }, { val: '0', label: 'Reviews' }, { val: '0', label: 'Saved' }].map(s => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          {MENU.map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.7} onPress={item.onPress}>
              <View style={styles.menuIcon}>
                <MaterialIcons name={item.icon} size={20} color={Colors.plum} />
              </View>
              <View style={styles.menuBody}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textFaint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => { await logout(); }}
          activeOpacity={0.8}
        >
          <View style={styles.logoutInner}>
            <MaterialIcons name="exit-to-app" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingBottom: Spacing.xl, alignItems: 'center', gap: Spacing.sm },
  avatarWrap: { marginBottom: Spacing.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { ...Typography.displayLG, color: Colors.white, fontSize: 28 },
  name: { ...Typography.headlineMD, color: Colors.white },
  email: { ...Typography.bodyMD, color: 'rgba(255,255,255,0.75)' },
  roleChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: Radius.full },
  roleText: { ...Typography.labelMD, color: Colors.white },
  statsCard: { flexDirection: 'row', backgroundColor: Colors.white, marginHorizontal: Spacing.lg, borderRadius: Radius.lg, marginTop: -Spacing.lg, ...Shadows.card, padding: Spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { ...Typography.headlineMD, color: Colors.plum },
  statLabel: { ...Typography.labelSM, color: Colors.textFaint, marginTop: 4 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionLabel: { ...Typography.labelMD, color: Colors.textFaint, marginBottom: Spacing.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.card },
  menuIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.lavenderLight, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  menuBody: { flex: 1 },
  menuLabel: { ...Typography.labelLG, color: Colors.onSurface },
  menuSub: { ...Typography.bodySM, color: Colors.onSurfaceVariant, marginTop: 2 },
  logoutBtn: { margin: Spacing.lg, backgroundColor: Colors.errorBg, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center' },
  logoutInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoutText: { ...Typography.labelLG, color: Colors.error, textTransform: 'uppercase', letterSpacing: 0.5 },
});
