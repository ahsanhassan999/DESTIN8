import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { mockConversations } from '../../store/mockData';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import AppHeader from '../../components/AppHeader';

export default function ChatListScreen({ navigation }) {
  const unreadCount = mockConversations.filter(c => c.unread > 0).length;

  return (
    <View style={styles.container}>
      <AppHeader title="Messages" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.subHeader}>
          <Text style={styles.subtitle}>{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</Text>
        </View>

        {mockConversations.map(conv => (
          <TouchableOpacity
            key={conv.id}
            style={[styles.item, conv.unread > 0 && styles.itemUnread]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ChatDetail', { conversation: conv })}
          >
            <LinearGradient
              colors={conv.unread > 0 ? [Colors.plum, Colors.lavender] : ['#CBD5E1', '#94A3B8']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{conv.initials}</Text>
            </LinearGradient>

            <View style={styles.itemBody}>
              <View style={styles.itemTop}>
                <Text style={[styles.itemName, conv.unread > 0 && styles.itemNameBold]}>{conv.traveler}</Text>
                <Text style={styles.itemTime}>{conv.time}</Text>
              </View>
              <View style={styles.itemPkgRow}>
                <MaterialIcons name="card-travel" size={13} color={Colors.lavender} style={styles.pkgIcon} />
                <Text style={styles.itemPkg} numberOfLines={1}>{conv.package}</Text>
              </View>
              <Text style={[styles.itemMsg, conv.unread > 0 && styles.itemMsgBold]} numberOfLines={1}>{conv.lastMsg}</Text>
            </View>

            {conv.unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{conv.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  subHeader: { paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  subtitle: { ...Typography.bodyMD, color: Colors.onSurfaceVariant },
  scroll: { paddingHorizontal: Spacing.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.card },
  itemUnread: { borderLeftWidth: 3, borderLeftColor: Colors.plum },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { ...Typography.labelLG, color: Colors.white },
  itemBody: { flex: 1, gap: 3 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { ...Typography.bodyLG, color: Colors.onSurface, fontFamily: 'Manrope_400Regular' },
  itemNameBold: { fontFamily: 'Manrope_700Bold' },
  itemTime: { ...Typography.bodySM, color: Colors.textFaint },
  itemPkgRow: { flexDirection: 'row', alignItems: 'center' },
  pkgIcon: { marginRight: 4 },
  itemPkg: { ...Typography.bodySM, color: Colors.lavender, flex: 1 },
  itemMsg: { ...Typography.bodySM, color: Colors.onSurfaceVariant },
  itemMsgBold: { color: Colors.onSurface, fontFamily: 'Manrope_700Bold' },
  badge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.plum, alignItems: 'center', justifyContent: 'center' },
  badgeText: { ...Typography.labelSM, color: Colors.white, fontSize: 11 },
});
