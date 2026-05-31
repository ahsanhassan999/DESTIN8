import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function AppHeader({ title, showBack, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const themeColor = '#52396F';

  return (
    <View style={[
      styles.header,
      {
        paddingTop: insets.top,
        height: 64 + insets.top,
      }
    ]}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={themeColor} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <View style={styles.center}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <Text style={[styles.logo, { color: themeColor }]}>DESTIN8</Text>
        )}
      </View>

      <View style={styles.right}>
        {!showBack ? (
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVKbrrA85UnvoxERTRwyMhFqxHqGaEy7BuyonQ6AXv5I3-75TJR2zzpqIWwdNxTaDhQFsw4GcPjhEEAnnMCXXtU2vs7sDgJ6eA1ZCJQO9oAp1-seai-wjjpNfGyYhjQ8dtFtSZoZEKO8C1V1hFrhlgcqQ_FErAmxPCSEoc1l7KaMf6T0fh-_9RDqm5P0RElb818xuMlUTqkX2wDEpGwYFradawmni7DQDihv9vbZhjZcANE1NH2Qfqg8QKTyEIRfdk_-fvIIg7WNRe' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 47, 48, 0.06)',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  left: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 18,
    color: '#2C2F30',
  },
  logo: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    letterSpacing: -1,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(82, 57, 111, 0.2)',
  },
});
