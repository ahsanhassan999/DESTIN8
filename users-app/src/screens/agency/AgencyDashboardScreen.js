import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import AppHeader from '../../components/AppHeader';

const { width } = Dimensions.get('window');
const CARD_W = 256;

export default function AgencyDashboardScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} />

      {/* Asymmetrical Background Elements */}
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.agencyName}>{user?.name || 'Odyssey Travels'}</Text>
        </View>

        {/* Status Metrics (Horizontal Scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.metricScroll}
          contentContainerStyle={styles.metricRow}
          snapToInterval={CARD_W + 24}
          decelerationRate="fast"
        >
          {/* Metric Card 1 */}
          <View style={[styles.metricCard, styles.bgLowest]}>
            <View style={styles.glowCircle1} />
            <Text style={styles.metricLabel}>Total Active Deals</Text>
            <Text style={styles.metricVal}>42</Text>
            <View style={styles.metricTrend}>
              <MaterialIcons name="trending-up" size={16} color="#903985" />
              <Text style={[styles.trendText, { color: '#903985' }]}>+5 this week</Text>
            </View>
          </View>

          {/* Metric Card 2 */}
          <View style={[styles.metricCard, styles.bgLow]}>
            <View style={styles.glowCircle2} />
            <Text style={styles.metricLabel}>Pending Bookings</Text>
            <Text style={styles.metricVal}>18</Text>
            <View style={styles.metricTrend}>
              <MaterialIcons name="schedule" size={16} color="#4e4fb6" />
              <Text style={[styles.trendText, { color: '#4e4fb6' }]}>Needs action</Text>
            </View>
          </View>

          {/* Metric Card 3 */}
          <View style={[styles.metricCard, styles.bgLowest]}>
            <Text style={styles.metricLabel}>Confirmed Trips</Text>
            <Text style={styles.metricVal}>124</Text>
            <View style={styles.metricTrend}>
              <MaterialIcons name="check-circle" size={16} color="#967BB6" />
              <Text style={[styles.trendText, { color: '#967BB6' }]}>All set</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Grid */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            {/* Action: Post New Package */}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#967BB6' }]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Post Package')}
            >
              <View style={styles.iconCircleWhite}>
                <MaterialIcons name="add" size={24} color="#fff" />
              </View>
              <Text style={[styles.actionLabel, { color: '#fff' }]}>Post New{"\n"}Package</Text>
            </TouchableOpacity>

            {/* Action: Manage My Trips */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.bgLowest, styles.borderVariant]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Post Package')}
            >
              <ImageBackground
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIAtke1a899GDAMe9ipxHo_K3-LQfcz2UnWZce3WPM4q9uveqgFax66s99CY1ohSzpNMRBwNDz4YPuxGmT1FkzKgov2UlLoAOaYBYOVDSPh6U-w3CJOR-lqPim_bLoimOByhm2xZt24SFPCWRsjXA3whIqo1Mx8GcOV0q2hXUutKF2jDOCVkvQ64rvrJVoGg3ln6bH1ZE_jYHmjvMSJ8acKXKzYHPWlW1OqepK8J9M3ZGCbmsVbLCuClT8bw7arroD5wy_X3RWyKyj' }}
                style={{ position: 'absolute', right: 0, top: 0, width: '66%', height: '100%' }}
                imageStyle={{ opacity: 0.1, borderTopRightRadius: 16, borderBottomRightRadius: 16 }}
              />
              <View style={styles.iconCircleGray}>
                <MaterialIcons name="luggage" size={22} color="#595C5D" />
              </View>
              <Text style={[styles.actionLabel, { color: '#2C2F30' }]}>Manage{"\n"}Packages</Text>
            </TouchableOpacity>

            {/* Action: Message Inbox */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.bgLowest, styles.borderVariant]}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('Chat')}
            >
              <View style={styles.glowCircle3} />
              <View style={styles.iconCircleGray}>
                <MaterialIcons name="mail" size={22} color="#595C5D" />
              </View>
              <Text style={[styles.actionLabel, { color: '#2C2F30' }]}>Message{"\n"}Inbox</Text>
            </TouchableOpacity>

            {/* Action: Reviews & Feedback */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.bgLowest, styles.borderVariant]}
              activeOpacity={0.88}
            >
              <ImageBackground
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBkYPAcFWPqbuifBi1pBiI2J-7h38D8_AeXjCzxhY5ROae1Rf8_8yZVfms5U47U43xtxJn8Ie5J6HvHWakpCbCoBei6-JHWb0Kn9psw7fDS1SaPiVQ5sWvkAdmelnz8UtLvH0LqcJudUq0couR4zHPmYZjKOZrAAHr1a9TbTVozYZcsfi6WzBBHjsQyvTX-1uQVtzvKS3whDeHspS05ppuWw-eV3t1RbLk8sxFkdpcnI07b_wg6phqshWxjAi2JJFTRW-F12fLAJ3b' }}
                style={{ position: 'absolute', right: 0, bottom: 0, width: '66%', height: '66%' }}
                imageStyle={{ opacity: 0.1, borderBottomRightRadius: 16 }}
              />
              <View style={styles.iconCircleGray}>
                <MaterialIcons name="grade" size={22} color="#595C5D" />
              </View>
              <Text style={[styles.actionLabel, { color: '#2C2F30' }]}>Reviews &{"\n"}Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6f7' },
  scroll: { paddingTop: 20 },

  // Welcome Section
  welcomeSection: { paddingHorizontal: 24, marginBottom: 28 },
  greeting: { fontFamily: 'Epilogue_700Bold', fontSize: 36, color: '#2C2F30', lineHeight: 42 },
  agencyName: { fontFamily: 'Epilogue_700Bold', fontSize: 36, color: '#967BB6', lineHeight: 42 },

  // Metrics
  metricScroll: { marginHorizontal: 0, marginBottom: 36 },
  metricRow: { paddingHorizontal: 24, gap: 24 },
  metricCard: {
    width: CARD_W,
    borderRadius: 16,
    padding: 24,
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 4,
  },
  bgLowest: { backgroundColor: '#ffffff' },
  bgLow: { backgroundColor: '#eff1f2' },
  borderVariant: { borderWidth: 1, borderColor: 'rgba(171,173,174,0.1)' },

  glowCircle1: {
    position: 'absolute', right: -16, top: -16,
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(249,147,230,0.12)',
  },
  glowCircle2: {
    position: 'absolute', left: -16, bottom: -16,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(206,205,255,0.2)',
  },
  glowCircle3: {
    position: 'absolute', right: -32, bottom: -32,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: 'rgba(206,205,255,0.15)',
  },

  metricLabel: { fontFamily: 'Manrope_700Bold', fontSize: 11, color: '#595C5D', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricVal: { fontFamily: 'Epilogue_700Bold', fontSize: 48, color: '#2C2F30', lineHeight: 52 },
  metricTrend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  trendText: { fontFamily: 'Manrope_500Medium', fontSize: 13 },

  // Action Grid
  gridSection: { paddingHorizontal: 24 },
  sectionTitle: { fontFamily: 'Epilogue_600SemiBold', fontSize: 20, color: '#2C2F30', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  actionBtn: {
    width: (width - 64) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 3,
  },
  iconCircleWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGray: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff1f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontFamily: 'Epilogue_600SemiBold', fontSize: 16, lineHeight: 22 },
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
});
