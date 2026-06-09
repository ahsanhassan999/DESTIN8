import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Platform, Animated, Keyboard, KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const getPackageInitials = (pkgName) => {
  if (!pkgName) return 'PK';
  const words = pkgName.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return pkgName.substring(0, 2).toUpperCase();
};

export default function ChatDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const { conversation } = route.params || { conversation: { traveler: 'Chat', initials: 'C', package: 'Adventure' } };
  const insets = useSafeAreaInsets();

  const isAgency = user?.role === 'agency';
  const primaryColor = isAgency ? '#967BB6' : '#52396f';

  const displayName = isAgency ? conversation.traveler : conversation.package;
  const displayInitials = isAgency ? (conversation.travelerInitials || conversation.initials) : getPackageInitials(conversation.package);
  const displaySub = isAgency ? conversation.package : 'Destination Inquiry';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef();

  // Keyboard-aware bottom padding using Animated
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  const fetchMessages = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await api.getMessages(conversation.id);
      const mapped = (data || []).map(m => ({
        id: m.id,
        text: m.text,
        isMe: m.is_me,
        time: m.time,
      }));
      setMessages(mapped);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversation?.id) return;

    fetchMessages(true);

    const interval = setInterval(() => {
      fetchMessages(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [conversation?.id]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => {
      const keyboardHeight = e.endCoordinates.height;
      Animated.timing(keyboardPadding, {
        toValue: keyboardHeight,
        duration: Platform.OS === 'ios' ? e.duration || 250 : 150,
        useNativeDriver: false,
      }).start();
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    };

    const onHide = (e) => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? e.duration || 200 : 150,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const response = await api.sendMessage(conversation.id, textToSend);
      const newMsg = {
        id: response.id,
        text: response.text,
        isMe: true,
        time: response.time,
      };
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Header top padding
  const headerPaddingTop = insets.top > 0 ? insets.top : Platform.OS === 'android' ? 24 : 12;

  return (
    <View style={styles.root}>
      {/* Orb background */}
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />
      <View style={styles.bgOrb3} pointerEvents="none" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: headerPaddingTop }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={primaryColor} style={{ backgroundColor: 'transparent' }} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{displayName}</Text>
          <View style={styles.headerSubRow}>
            <MaterialIcons name="inventory" size={12} color={primaryColor} style={{ marginRight: 4, marginTop: 1, backgroundColor: 'transparent' }} />
            <Text style={[styles.headerSub, { color: primaryColor }]} numberOfLines={1}>{displaySub}</Text>
          </View>
        </View>
        <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
          <Text style={styles.avatarText}>{displayInitials}</Text>
        </View>
      </View>

      {/* Animated wrapper that lifts when keyboard appears */}
      <Animated.View style={[styles.flex, { paddingBottom: keyboardPadding }]}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scroll}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[styles.msgRow, msg.isMe ? styles.msgRowMe : styles.msgRowOther]}
              >
                <View style={[
                  styles.bubble,
                  msg.isMe
                    ? [styles.bubbleMe, { backgroundColor: primaryColor }]
                    : styles.bubbleOther
                ]}>
                  <Text style={[styles.msgText, msg.isMe ? styles.msgTextMe : styles.msgTextOther]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.msgTime, msg.isMe ? styles.msgTimeMe : styles.msgTimeOther]}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Input bar */}
        <View style={[styles.inputArea, { paddingBottom: (insets.bottom > 0 ? insets.bottom : 8) + 12 }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="rgba(89,92,93,0.5)"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: primaryColor }]}
            activeOpacity={0.8}
          >
            <MaterialIcons name="send" size={20} color="#fff" style={{ backgroundColor: 'transparent' }} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F0EEF5',
  },
  flex: {
    flex: 1,
  },

  // Orb backgrounds
  bgOrb1: {
    position: 'absolute',
    top: -40,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#C9B8E8',
    opacity: 0.35,
    zIndex: 0,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 80,
    right: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#b8baff',
    opacity: 0.3,
    zIndex: 0,
  },
  bgOrb3: {
    position: 'absolute',
    top: '40%',
    left: '30%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#e0d5f7',
    opacity: 0.25,
    zIndex: 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(171,173,174,0.15)',
    zIndex: 10,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerInfo: { flex: 1 },
  headerName: { fontFamily: 'Epilogue_600SemiBold', fontSize: 18, color: Colors.onSurface },
  headerSub: { fontFamily: 'Manrope_400Regular', fontSize: 12, marginTop: 2 },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#fff' },

  scroll: { padding: 16, gap: 16, flexGrow: 1 },
  msgRow: { flexDirection: 'row', width: '100%' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },

  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 4,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(171,173,174,0.2)',
  },

  msgText: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 20 },
  msgTextMe: { color: '#fff' },
  msgTextOther: { color: Colors.onSurface },

  msgTime: { fontFamily: 'Manrope_400Regular', fontSize: 9, alignSelf: 'flex-end' },
  msgTimeMe: { color: 'rgba(255,255,255,0.7)' },
  msgTimeOther: { color: Colors.textFaint },

  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(171,173,174,0.15)',
    gap: 12,
    zIndex: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F0EEF5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    maxHeight: 100,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: 'rgba(171,173,174,0.2)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
