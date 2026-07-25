import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ImageBackground, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

// Stitch: tropical beach hero image
const LOGIN_BG = require('../../../assets/login_bg.png');

// Stitch exact colors
const C = {
  primary:  '#967BB6',   // Lavender primary
  lavender: '#967BB6',   // Stitch CTA gradient start
  lavenderLight: '#B19CD9', // Stitch CTA gradient end
  surface:  '#F5F6F7',
  surfLow:  '#EFF1F2',
  onSurf:   '#2C2F30',
  onSurfVar:'#595C5D',
  error:    '#B41340',
  errBg:    '#FFE4EC',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [error, setError]       = useState('');
  const { login, loading }      = useAuth();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    const res = await login(email.trim(), password, remember);
    if (!res.success) {
      if (res.suspended)   navigation.replace('Suspended');
      else if (res.pending) setError('Your agency account is pending approval.');
      else setError(res.error || 'Invalid email or password.');
    }
  };

  return (
    <ImageBackground source={LOGIN_BG} style={s.bg} resizeMode="cover">
      {/* Ambient Overlay for Readability — bg-surface/20 backdrop-blur */}
      <View style={s.overlay} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top navigation back button spacer if needed */}
          <View style={s.navSpacer} />

          {/* ── Brand header ─────────────────── */}
          <View style={s.brand}>
            <Text style={s.brandName}>Destin8</Text>
            <Text style={s.brandTag}>The Kinetic Explorer</Text>
          </View>

          {/* ── Login Card ───────────────────── */}
          <View style={s.cardWrapper}>
            <View style={s.card}>
              {/* Card Header */}
              <View style={s.cardHd}>
                <Text style={s.cardTitle}>Welcome back</Text>
                <Text style={s.cardDesc}>
                  The peaks are calling. Sign in to resume your journey through the world's most hidden gems.
                </Text>
              </View>

              {/* Email Address Field */}
              <View style={s.field}>
                <Text style={s.label}>Email Address</Text>
                <View style={s.inputWrap}>
                  <MaterialIcons name="alternate-email" size={18} color="rgba(89, 92, 93, 0.7)" style={s.ico} />
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

              {/* Password Field */}
              <View style={s.field}>
                <Text style={s.label}>Password</Text>
                <View style={s.inputWrap}>
                  <MaterialIcons name="lock" size={18} color="rgba(89, 92, 93, 0.7)" style={s.ico} />
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(89,92,93,0.5)"
                    secureTextEntry={!showPass}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
                    <MaterialIcons
                      name={showPass ? 'visibility-off' : 'visibility'}
                      size={18}
                      color="rgba(89, 92, 93, 0.7)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Utilities row */}
              <View style={s.utils}>
                <TouchableOpacity style={s.rememberRow} onPress={() => setRemember(v => !v)} activeOpacity={0.7}>
                  <View style={[s.checkbox, remember && s.checkboxOn]}>
                    {remember && <MaterialIcons name="check" size={11} color="#fff" />}
                  </View>
                  <Text style={s.rememberTxt}>Keep me signed in</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={s.forgotTxt}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Error Box */}
              {!!error && (
                <View style={s.errBox}>
                  <MaterialIcons name="error-outline" size={16} color={C.error} />
                  <Text style={s.errTxt}>{error}</Text>
                </View>
              )}

              {/* Primary Action Button — rounded-full gradient */}
              <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.88}>
                <LinearGradient
                  colors={[C.lavender, C.lavenderLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.cta}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={s.ctaInner}>
                      <Text style={s.ctaTxt}>Begin Expedition</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={s.divider}>
                <View style={s.divLine} />
                <Text style={s.divTxt}>Or continue with</Text>
                <View style={s.divLine} />
              </View>

              {/* Social Logins */}
              <View style={s.socialRow}>
                <TouchableOpacity aria-label="Sign in with Google" style={s.socialBtn} activeOpacity={0.8}>
                  <FontAwesome name="google" size={20} color="#4285F4" />
                </TouchableOpacity>
                <TouchableOpacity aria-label="Sign in with Apple" style={s.socialBtn} activeOpacity={0.8}>
                  <FontAwesome name="apple" size={20} color="#000000" />
                </TouchableOpacity>
              </View>

              {/* Collapsible Demo Login to keep design completely clean by default */}
              <TouchableOpacity onPress={() => setShowDemo(!showDemo)} style={s.demoToggle} activeOpacity={0.7}>
                <Text style={s.demoToggleTxt}>{showDemo ? 'Hide Demo Logins' : 'Show Demo Credentials'}</Text>
              </TouchableOpacity>

              {showDemo && (
                <View style={s.demoBox}>
                  <Text style={s.demoTitle}>Quick Demo Login</Text>
                  <TouchableOpacity
                    style={s.demoRow}
                    onPress={() => { setEmail('traveler@test.com'); setPassword('pass123'); }}
                  >
                    <FontAwesome name="user" size={13} color="#52396F" />
                    <Text style={s.demoTxt}>traveler@test.com / pass123</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.demoRow}
                    onPress={() => { setEmail('agency@test.com'); setPassword('pass123'); }}
                  >
                    <FontAwesome name="briefcase" size={13} color="#52396F" />
                    <Text style={s.demoTxt}>agency@test.com / pass123</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Footer Link */}
              <View style={s.signupRow}>
                <Text style={s.signupTxt}>New to our expeditions? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
                  <Text style={s.signupLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer Area */}
          <View style={s.footer}>
            <Text style={s.footerBrand}>Destin8</Text>
            <View style={s.footerLinks}>
              <TouchableOpacity><Text style={s.footerLinkTxt}>Privacy Policy</Text></TouchableOpacity>
              <TouchableOpacity><Text style={s.footerLinkTxt}>Terms of Service</Text></TouchableOpacity>
              <TouchableOpacity><Text style={s.footerLinkTxt}>Help Center</Text></TouchableOpacity>
            </View>
            <Text style={s.footerCopy}>© 2024 DESTIN8 TRAVEL. ALL RIGHTS RESERVED.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(245,246,247,0.2)' },
  scroll: { flexGrow: 1, justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  navSpacer: { height: 20 },

  brand: { alignItems: 'center', marginBottom: 28, gap: 6, paddingHorizontal: 20 },
  brandName: {
    fontFamily: 'Epilogue_700Bold', fontSize: 48, color: '#fff', letterSpacing: -1.5,
    textShadowColor: 'rgba(44,47,48,0.15)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 12,
  },
  brandTag: {
    fontFamily: 'Manrope_700Bold', fontSize: 10, color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2, textTransform: 'uppercase',
  },

  cardWrapper: { paddingHorizontal: 16, alignItems: 'center', width: '100%' },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 28,
    gap: 20,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 32 },
    shadowOpacity: 0.06,
    shadowRadius: 48,
    elevation: 8,
  },
  cardHd: { alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontFamily: 'Epilogue_700Bold', fontSize: 26, color: C.onSurf, textAlign: 'center' },
  cardDesc: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: C.onSurfVar, textAlign: 'center', lineHeight: 20, paddingHorizontal: 4 },

  field: { gap: 8 },
  label: {
    fontFamily: 'Manrope_700Bold', fontSize: 11, color: C.onSurfVar,
    letterSpacing: 0.5, textTransform: 'uppercase', paddingLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surfLow, borderRadius: 32,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  ico: { marginRight: 10 },
  input: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: C.onSurf, flex: 1, padding: 0, backgroundColor: 'transparent' },
  eyeBtn: { padding: 4 },

  utils: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 16, height: 16, borderRadius: 4,
    borderWidth: 1, borderColor: 'rgba(171,173,174,0.3)',
    backgroundColor: C.surfLow, alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: C.primary, borderColor: C.primary },
  rememberTxt: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: C.onSurfVar },
  forgotTxt:   { fontFamily: 'Manrope_700Bold', fontSize: 12, color: C.primary },

  errBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.errBg, borderRadius: 12, padding: 12 },
  errTxt: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: C.error, flex: 1 },

  cta: {
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.lavender,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 4,
  },
  ctaInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ctaTxt: { fontFamily: 'Epilogue_700Bold', fontSize: 16, color: '#fff' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(171,173,174,0.15)' },
  divTxt: { fontFamily: 'Manrope_700Bold', fontSize: 10, color: 'rgba(89,92,93,0.7)', letterSpacing: 0.5, textTransform: 'uppercase' },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },

  demoToggle: { alignItems: 'center', paddingVertical: 4 },
  demoToggleTxt: { fontFamily: 'Manrope_500Medium', fontSize: 12, color: '#52396F', opacity: 0.6 },

  demoBox: { backgroundColor: '#F0EBF8', borderRadius: 12, padding: 12, gap: 6 },
  demoTitle: { fontFamily: 'Manrope_700Bold', fontSize: 10, color: '#52396F', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  demoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  demoTxt: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#52396F' },

  signupRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 },
  signupTxt: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: C.onSurfVar },
  signupLink: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: C.primary },

  footer: {
    backgroundColor: C.surfLow,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
  },
  footerBrand: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: C.onSurf,
    marginBottom: 24,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  footerLinkTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    color: C.onSurfVar,
    letterSpacing: 0.5,
  },
  footerCopy: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 10,
    color: 'rgba(89,92,93,0.7)',
  },
});

