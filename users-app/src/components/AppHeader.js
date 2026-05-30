import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function AppHeader({ title, showBack, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const isAgency = user?.role === 'agency';
  const themeColor = isAgency ? '#967BB6' : '#52396F';

  return (
    <View style={[styles.header, { paddingTop: insets.top, height: (Platform.OS === 'ios' ? 60 : 54) + insets.top }, !showBack && styles.headerBorder]}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn}>
            <MaterialIcons name="arrow-back" size={24} color={themeColor} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn}>
            <MaterialIcons name="menu" size={24} color={themeColor} />
          </TouchableOpacity>
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
        {!showBack && (
          <TouchableOpacity style={styles.avatarWrap} onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVKbrrA85UnvoxERTRwyMhFqxHqGaEy7BuyonQ6AXv5I3-75TJR2zzpqIWwdNxTaDhQFsw4GcPjhEEAnnMCXXtU2vs7sDgJ6eA1ZCJQO9oAp1-seai-wjjpNfGyYhjQ8dtFtSZoZEKO8C1V1hFrhlgcqQ_FErAmxPCSEoc1l7KaMf6T0fh-_9RDqm5P0RElb818xuMlUTqkX2wDEpGwYFradawmni7DQDihv9vbZhjZcANE1NH2Qfqg8QKTyEIRfdk_-fvIIg7WNRe' }}
              style={styles.avatar}
            />
            <Text style={styles.avatarName}>{user?.name || 'Mr Khan'}</Text>
          </TouchableOpacity>
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(171,173,174,0.1)',
  },
  left: { width: 48, alignItems: 'flex-start' },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 64, alignItems: 'flex-end', justifyContent: 'center' },
  btn: { padding: 4 },
  title: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 18,
    color: '#2C2F30',
  },
  logo: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    letterSpacing: 2,
  },
  avatarWrap: { alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(150,123,182,0.2)',
  },
  avatarName: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
