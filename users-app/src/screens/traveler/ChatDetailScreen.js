import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../theme';

export default function ChatDetailScreen({ route, navigation }) {
  const { conversation } = route.params || { conversation: { traveler: 'Chat', initials: 'C', package: 'Adventure' } };
  const [messages, setMessages] = useState([
    { id: '1', text: `Hi, I'm interested in the ${conversation.package}.`, isMe: false, time: '10:00 AM' },
    { id: '2', text: 'Great! I can help you with that. What questions do you have?', isMe: true, time: '10:02 AM' },
    { id: '3', text: conversation.lastMsg || 'Is there a group discount?', isMe: false, time: '10:05 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.plum} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{conversation.traveler}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>📦 {conversation.package}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{conversation.initials}</Text>
          </View>
        </View>

        {/* Message list */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scroll}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[styles.msgRow, msg.isMe ? styles.msgRowMe : styles.msgRowOther]}
            >
              <View style={[styles.bubble, msg.isMe ? styles.bubbleMe : styles.bubbleOther]}>
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

        {/* Input area */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="rgba(89,92,93,0.5)"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn} activeOpacity={0.8}>
            <MaterialIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(171,173,174,0.15)',
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerInfo: { flex: 1 },
  headerName: { fontFamily: 'Epilogue_600SemiBold', fontSize: 18, color: Colors.onSurface },
  headerSub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: Colors.lavender, marginTop: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#fff' },

  scroll: { padding: 16, gap: 16 },
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
    backgroundColor: Colors.plum,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(171,173,174,0.15)',
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
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(171,173,174,0.15)',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F6F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    maxHeight: 100,
    color: Colors.onSurface,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
