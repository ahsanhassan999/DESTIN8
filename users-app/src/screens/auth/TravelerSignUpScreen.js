import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const C = {
  primary: '#967BB6',       // Lavender primary
  container: '#E8E1F0',     // Lavender container
  onSurf: '#2C2F30',
  onSurfVar: '#595C5D',
  surfLow: '#EFF1F2',
  background: '#F5F6F7',
  error: '#B41340',
  errBg: '#FFE4EC',
};

export default function TravelerSignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation checks
  const hasEightChars = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasEightChars && hasUppercase && hasNumber;

  const handleSignUp = async () => {
    setError('');
    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password does not meet validation criteria.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.root}>
        {/* Header Bar */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={C.primary} />
            <Text style={s.logoText}>Destin8</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={s.content}>
            {/* Header / Title */}
            <View style={s.hero}>
              <View style={s.stepTagRow}>
                <MaterialIcons name="explore" size={18} color={C.primary} />
                <Text style={s.stepTag}>Start Your Journey</Text>
              </View>
              <Text style={s.title}>Create your account.</Text>
              <Text style={s.desc}>Join our exclusive circle of global travelers.</Text>
            </View>

            {/* Error Box */}
            {!!error && (
              <View style={s.errBox}>
                <MaterialIcons name="error-outline" size={16} color={C.error} />
                <Text style={s.errTxt}>{error}</Text>
              </View>
            )}

            {/* Form */}
            <View style={s.form}>
              {/* Full Name */}
              <View style={s.field}>
                <Text style={s.label}>Full Name</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={s.input}
                    placeholder="Alex Sterling"
                    placeholderTextColor="rgba(89,92,93,0.5)"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={s.field}>
                <Text style={s.label}>Email Address</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={s.input}
                    placeholder="alex@voyage.com"
                    placeholderTextColor="rgba(89,92,93,0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={s.field}>
                <Text style={s.label}>Password</Text>
                <View style={s.inputWrap}>
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
                      color={C.onSurfVar}
                    />
                  </TouchableOpacity>
                </View>

                {/* Validation Pills */}
                <View style={s.pillsRow}>
                  <View style={[s.pill, hasEightChars ? s.pillActive : s.pillInactive]}>
                    <MaterialIcons
                      name={hasEightChars ? 'check-circle' : 'radio-button-unchecked'}
                      size={12}
                      color={hasEightChars ? C.primary : C.onSurfVar}
                      style={s.pillIcon}
                    />
                    <Text style={[s.pillTxt, hasEightChars && s.pillTxtActive]}>8+ Characters</Text>
                  </View>

                  <View style={[s.pill, hasUppercase ? s.pillActive : s.pillInactive]}>
                    <MaterialIcons
                      name={hasUppercase ? 'check-circle' : 'radio-button-unchecked'}
                      size={12}
                      color={hasUppercase ? C.primary : C.onSurfVar}
                      style={s.pillIcon}
                    />
                    <Text style={[s.pillTxt, hasUppercase && s.pillTxtActive]}>1 Uppercase</Text>
                  </View>

                  <View style={[s.pill, hasNumber ? s.pillActive : s.pillInactive]}>
                    <MaterialIcons
                      name={hasNumber ? 'check-circle' : 'radio-button-unchecked'}
                      size={12}
                      color={hasNumber ? C.primary : C.onSurfVar}
                      style={s.pillIcon}
                    />
                    <Text style={[s.pillTxt, hasNumber && s.pillTxtActive]}>1 Number</Text>
                  </View>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={s.field}>
                <Text style={s.label}>Confirm Password</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={s.input}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(89,92,93,0.5)"
                    secureTextEntry={!showPass}
                    value={confirm}
                    onChangeText={setConfirm}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity onPress={handleSignUp} disabled={loading} activeOpacity={0.88} style={s.btnWrap}>
                <LinearGradient
                  colors={[C.primary, '#B29CCF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.btn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <View style={s.btnInner}>
                      <Text style={s.btnText}>Create Account</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Switch to Login */}
            <View style={s.loginRow}>
              <Text style={s.loginTxt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={s.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Area */}
          <View style={s.footer}>
            <View style={s.footerLinks}>
              <TouchableOpacity><Text style={s.footerLinkTxt}>Help Center</Text></TouchableOpacity>
              <TouchableOpacity><Text style={s.footerLinkTxt}>Terms</Text></TouchableOpacity>
              <TouchableOpacity><Text style={s.footerLinkTxt}>Privacy</Text></TouchableOpacity>
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
    backgroundColor: 'rgba(245,246,247,0.85)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(171,173,174,0.1)',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontFamily: 'Epilogue_700Bold', fontSize: 20, color: C.primary, letterSpacing: -0.5 },

  scroll: { flexGrow: 1, paddingTop: Platform.OS === 'ios' ? 110 : 80 },

  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 40 },

  // Hero
  hero: { marginTop: 24, marginBottom: 32, gap: 10 },
  stepTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  stepTag: { fontFamily: 'Manrope_700Bold', fontSize: 11, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: {
    fontFamily: 'Epilogue_700Bold', fontSize: 44, color: C.onSurf,
    lineHeight: 50, letterSpacing: -1.5,
  },
  desc: {
    fontFamily: 'Manrope_400Regular', fontSize: 16, color: C.onSurfVar,
    lineHeight: 24,
  },

  errBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.errBg, borderRadius: 12, padding: 12, marginBottom: 20 },
  errTxt: { fontFamily: 'Manrope_400Regular', fontSize: 13, color: C.error, flex: 1 },

  // Form
  form: { gap: 20 },
  field: { gap: 8 },
  label: {
    fontFamily: 'Manrope_700Bold', fontSize: 11, color: C.onSurfVar,
    letterSpacing: 0.5, textTransform: 'uppercase', paddingLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 32,
    paddingHorizontal: 18, paddingVertical: 14,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  input: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: C.onSurf, flex: 1, padding: 0 },
  eyeBtn: { padding: 4 },

  // Validation pills
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, paddingLeft: 4 },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 9999,
  },
  pillActive: { backgroundColor: C.container },
  pillInactive: { backgroundColor: C.surfLow },
  pillIcon: { marginRight: 4 },
  pillTxt: { fontFamily: 'Manrope_700Bold', fontSize: 9, color: C.onSurfVar, textTransform: 'uppercase' },
  pillTxtActive: { color: C.primary },

  // Button
  btnWrap: { marginTop: 8 },
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
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 },

  loginRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 },
  loginTxt: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: C.onSurfVar },
  loginLink: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: C.primary },

  // Footer
  footer: {
    backgroundColor: C.surfLow,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 64,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    flexWrap: 'wrap',
  },
  footerLinkTxt: {
    fontFamily: 'Manrope_700Bold', fontSize: 11, color: C.onSurfVar,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
});

