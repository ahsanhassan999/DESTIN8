import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockConversations } from '../../store/mockData';
import { useAuth } from '../../context/AuthContext';
import AppHeader from '../../components/AppHeader';

const { width } = Dimensions.get('window');

const getPackageInitials = (pkgName) => {
  if (!pkgName) return 'PK';
  const words = pkgName.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return pkgName.substring(0, 2).toUpperCase();
};

export default function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const isAgency = user?.role === 'agency';
  const primaryColor = isAgency ? '#967BB6' : '#52396f';
  const primaryBgLight = isAgency ? 'rgba(150, 123, 182, 0.15)' : 'rgba(82, 57, 111, 0.08)';

  // Filter conversations based on search query
  const filteredConversations = mockConversations.filter((conv) => {
    const query = searchQuery.toLowerCase();
    if (isAgency) {
      return (
        conv.traveler.toLowerCase().includes(query) ||
        conv.package.toLowerCase().includes(query) ||
        conv.lastMsg.toLowerCase().includes(query)
      );
    } else {
      // Traveler side - agency name is hidden, so search title matches package name
      return (
        conv.package.toLowerCase().includes(query) ||
        conv.lastMsg.toLowerCase().includes(query)
      );
    }
  });

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
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {isAgency ? 'Your conversations with travelers' : 'Your conversations with agencies'}
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={22} color="#7b757f" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="rgba(123, 117, 127, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Chat List */}
        <View style={styles.list}>
          {filteredConversations.map((conv) => {
            const hasUnread = conv.unread > 0;
            
            // Role specific details
            const displayName = isAgency ? conv.traveler : conv.package;
            const displayInitials = isAgency ? conv.travelerInitials : getPackageInitials(conv.package);
            
            return (
              <TouchableOpacity
                key={conv.id}
                style={[
                  styles.card,
                  hasUnread && [styles.cardUnread, { borderLeftColor: primaryColor }],
                ]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ChatDetail', { conversation: conv })}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: primaryBgLight }]}>
                  <Text style={[styles.avatarText, { color: primaryColor }]}>{displayInitials}</Text>
                </View>

                {/* Body */}
                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <Text
                      style={[styles.cardName, hasUnread && styles.cardNameUnread]}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                    <Text
                      style={[
                        styles.cardTime,
                        hasUnread ? { color: primaryColor } : styles.cardTimeRead,
                      ]}
                    >
                      {conv.time}
                    </Text>
                  </View>

                  {/* Subtitle tag row (only visible on agency side since traveler title IS the package name) */}
                  {isAgency && (
                    <View style={styles.tagRow}>
                      <View style={styles.tagPill}>
                        <Text style={styles.tagText}>{conv.package}</Text>
                      </View>
                    </View>
                  )}

                  {/* Last message snippet */}
                  <Text
                    style={[styles.cardMsg, hasUnread && styles.cardMsgUnread]}
                    numberOfLines={1}
                  >
                    {conv.lastMsg}
                  </Text>
                </View>

                {/* Right side indicators */}
                <View style={styles.rightColumn}>
                  {hasUnread ? (
                    <View style={[styles.badge, { backgroundColor: primaryColor }]}>
                      <Text style={styles.badgeText}>{conv.unread}</Text>
                    </View>
                  ) : (
                    <MaterialIcons name="done-all" size={16} color={primaryColor} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={{ height: insets.bottom + 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EEF5',
  },
  bgOrb1: {
    position: 'absolute',
    top: 60,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#C9B8E8',
    opacity: 0.38,
    zIndex: 0,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 100,
    right: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#b8baff',
    opacity: 0.32,
    zIndex: 0,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  pageHeader: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 32,
    color: '#191c1d',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#7b757f',
  },

  // Search Bar
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 32,
    height: 56,
    paddingHorizontal: 20,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(150,123,182,0.12)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#191c1d',
    padding: 0,
    backgroundColor: 'transparent',
  },

  // Cards List
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.10)',
  },
  cardUnread: {
    borderLeftWidth: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 16,
  },
  cardBody: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 18,
    color: '#191c1d',
    flex: 1,
    marginRight: 8,
  },
  cardNameUnread: {
    fontFamily: 'Epilogue_700Bold',
  },
  cardTime: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
  },
  cardTimeRead: {
    color: '#7b757f',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tagPill: {
    backgroundColor: '#e7e8e9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#7b757f',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardMsg: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#7b757f',
  },
  cardMsgUnread: {
    fontFamily: 'Manrope_700Bold',
    color: '#191c1d',
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 20,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#ffffff',
  },
});
