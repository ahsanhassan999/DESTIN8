import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

// Stitch Assets
const IMG_LAVENDER = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDIpsfj0a5Ywtxcv3AeDn_FuFdymFmdJ2L10Ezs-7DR8BvjFKs9B210IreuNdUMu9FZ3ETQEtyvLgEM713_5BsWiz67NpLXUYg12KIfnFkKu9LLGjb6ZMIUeIZJo42p1xZaT3z_OkF-cA8kG5rcUWgvsPj97BZN3fC-Atc-YKcInrKUgL76y4LcQZvRQ7I7C0abJEczvtNUEfy-Hq_INjQHY76veBjXDL80RgPAmbfUw8Sl57YJSe9Jqs28YDpWkU4p7Dkq5sQ7WKX';
const IMG_JOURNAL  = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHQ135mWOYVn5qUWJuaYK5wPRbn4-8rodUTN0FOB4rafTZpGnDGVUnJ8M2QQrAsmjIYSI_-Q7z7LfKs_yFllOqm2DTz0ebIPf9ITPqLZZQJqTRcN1orfUf01sE48od-tgjzpCtkQHln9pY-0U6SZ4haIrVgEmOhiB1BhHi1scWSih8X9Oju46iU7phNva0GTkA4FfsYGscZq4OufOsPvIBfZEs0TadIiGQOJbLBS8GtzsVa7QVzOzY-4J-z42N2SfuJCncez2tETV-';

const C = {
  primary: '#967BB6',       // Lavender primary
  container: '#D1C4E9',     // Lavender container
  primaryText: '#0149E6',   // Deep ink / highlight
  onSurf: '#2C2F30',
  onSurfVar: '#595C5D',
  surfLow: '#EFF1F2',
  background: '#F5F6F7',
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.root}>
        {/* Header Bar */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={C.primary} style={{ marginRight: 2 }} />
            <Text style={s.logoText}>Destin8</Text>
          </TouchableOpacity>
        </View>

        {/* Asymmetrical Background Elements for Kinetic Editorial look */}
        <View style={s.bgOrb1} />
        <View style={s.bgOrb2} />

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.content}>
            {/* Hero Text */}
            <View style={s.hero}>
              <Text style={s.title}>
                {sent ? 'Instructions\nsent.' : 'Trouble\nsigning in?'}
              </Text>
              <Text style={s.desc}>
                {sent
                  ? `We've sent password reset instructions to ${email}. Please check your inbox.`
                  : "Enter your email address and we'll send you instructions to reset your password."}
              </Text>
            </View>

            {/* Form Box */}
            {!sent ? (
              <View style={s.card}>
                <View style={s.field}>
                  <Text style={s.label}>EMAIL ADDRESS</Text>
                  <View style={s.inputWrap}>
                    <MaterialIcons name="mail" size={20} color="rgba(89, 92, 93, 0.7)" style={s.inputIcon} />
                    <TextInput
                      style={s.input}
                      placeholder="nomad@destin8.com"
                      placeholderTextColor="rgba(89,92,93,0.5)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <TouchableOpacity onPress={handleSend} disabled={loading || !email} activeOpacity={0.88}>
                  <LinearGradient
                    colors={[C.primary, C.container]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[s.btn, !email && s.btnDisabled]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={s.btnInner}>
                        <Text style={s.btnText}>Send Instructions</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.card}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.88}>
                  <LinearGradient
                    colors={[C.primary, C.container]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.btn}
                  >
                    <View style={s.btnInner}>
                      <Text style={s.btnText}>Back to Sign In</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Back to sign in link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={s.backLink}
              activeOpacity={0.7}
            >
              <MaterialIcons name="keyboard-backspace" size={16} color={C.onSurfVar} />
              <Text style={s.backLinkTxt}>Back to Sign In</Text>
            </TouchableOpacity>

            {/* Asymmetrical Decorative Photos */}
            <View style={s.decoRow}>
              <View style={[s.decoCard, s.tiltLeft]}>
                <Image source={require('../../../assets/lavender_field.png')} style={s.decoImg} resizeMode="cover" />
              </View>
              <View style={[s.decoCard, s.tiltRight]}>
                <Image source={require('../../../assets/travel_journal.png')} style={s.decoImg} resizeMode="cover" />
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerCopy}>© 2024 Destin8 Editorial. All rights reserved.</Text>
            <View style={s.footerLinks}>
              <TouchableOpacity><Text style={s.footerLinkTxt}>Help Center</Text></TouchableOpacity>
              <TouchableOpacity><Text style={s.footerLinkTxt}>Privacy Policy</Text></TouchableOpacity>
              <TouchableOpacity><Text style={s.footerLinkTxt}>Terms of Service</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },

  // Header
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
    backgroundColor: 'rgba(245,246,247,0.8)',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 24, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 8,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontFamily: 'Epilogue_700Bold', fontSize: 20, color: C.primary, letterSpacing: -0.5 },

  // Background blur elements
  bgOrb1: {
    position: 'absolute',
    top: 40,
    left: -64,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: C.container, // lavender-container
    opacity: 0.2,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 200,
    right: -64,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#cecdff', // secondary-container
    opacity: 0.3,
  },

  scroll: { flexGrow: 1, paddingTop: Platform.OS === 'ios' ? 120 : 90 },

  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 40, zIndex: 10 },

  // Hero
  hero: { marginTop: 24, marginBottom: 40, gap: 16 },
  title: {
    fontFamily: 'Epilogue_700Bold', fontSize: 44, color: C.onSurf,
    lineHeight: 52, letterSpacing: -1.5,
  },
  desc: {
    fontFamily: 'Manrope_400Regular', fontSize: 16, color: C.onSurfVar,
    lineHeight: 24, maxWidth: 320,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 24,
    padding: 24,
    gap: 32,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 8,
  },
  field: { gap: 8 },
  label: {
    fontFamily: 'Manrope_700Bold', fontSize: 11, color: C.onSurfVar,
    letterSpacing: 0.5, textTransform: 'uppercase', paddingLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', borderRadius: 32,
    paddingHorizontal: 18, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(171,173,174,0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: { marginRight: 10 },
  input: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: C.onSurf, flex: 1, padding: 0 },

  // Button
  btn: {
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.5 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontFamily: 'Epilogue_700Bold', fontSize: 16, color: '#fff' },

  backLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 24, alignSelf: 'center', padding: 8,
  },
  backLinkTxt: { fontFamily: 'Manrope_700Bold', fontSize: 11, color: C.onSurfVar, letterSpacing: 0.5, textTransform: 'uppercase' },

  // Deco Row
  decoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 56, gap: 16, paddingHorizontal: 8 },
  decoCard: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  decoImg: { width: '100%', height: '100%' },
  tiltLeft: { transform: [{ rotate: '-2deg' }] },
  tiltRight: { transform: [{ rotate: '3deg' }], translateY: 16 },

  // Footer
  footer: {
    backgroundColor: C.surfLow,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    marginTop: 80,
  },
  footerCopy: {
    fontFamily: 'Manrope_700Bold', fontSize: 10, color: C.onSurfVar,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  footerLinkTxt: {
    fontFamily: 'Manrope_700Bold', fontSize: 10, color: C.onSurfVar,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
});

