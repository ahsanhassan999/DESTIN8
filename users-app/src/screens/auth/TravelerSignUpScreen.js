import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // Refs for auto-focus/scrolling
  const scrollRef = React.useRef(null);
  const nameRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const passwordRef = React.useRef(null);
  const confirmRef = React.useRef(null);

  const [visibleHeight, setVisibleHeight] = useState(0);
  const activeFieldRef = React.useRef(null);
  const activeFieldHeight = React.useRef(64);

  const scrollToActiveField = () => {
    setTimeout(() => {
      if (activeFieldRef.current?.current && scrollRef.current && visibleHeight > 0) {
        activeFieldRef.current.current.measureLayout(
          scrollRef.current,
          (x, y) => {
            const scrollOffset = y - (visibleHeight - activeFieldHeight.current) / 2;
            scrollRef.current?.scrollTo({ y: Math.max(0, scrollOffset), animated: true });
          },
          () => {}
        );
      }
    }, 100);
  };

  React.useEffect(() => {
    if (visibleHeight > 0) {
      scrollToActiveField();
    }
  }, [visibleHeight]);

  const handleFocus = (ref, height = 64) => {
    activeFieldRef.current = ref;
    activeFieldHeight.current = height;
    scrollToActiveField();
  };

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
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
        {/* Header Bar */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={C.primary} />
          </TouchableOpacity>
          <Text style={s.logo}>DESTIN8</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Asymmetrical Background Elements */}
        <View style={s.bgOrb1} pointerEvents="none" />
        <View style={s.bgOrb2} pointerEvents="none" />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onLayout={(e) => {
            setVisibleHeight(e.nativeEvent.layout.height);
          }}
        >
          <View style={s.content}>
            {/* Header / Title */}
            <View style={s.hero}>
              <View style={s.stepTagRow}>
                <MaterialIcons name="travel-explore" size={20} color={C.primary} />
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
                    ref={nameRef}
                    style={s.input}
                    placeholder="Alex Sterling"
                    placeholderTextColor="rgba(171, 173, 174, 0.6)"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    onFocus={() => handleFocus(nameRef, 64)}
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={s.field}>
                <Text style={s.label}>Email Address</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    ref={emailRef}
                    style={s.input}
                    placeholder="alex@voyage.com"
                    placeholderTextColor="rgba(171, 173, 174, 0.6)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    onFocus={() => handleFocus(emailRef, 64)}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={s.field}>
                <Text style={s.label}>Password</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    ref={passwordRef}
                    style={[s.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(171, 173, 174, 0.6)"
                    secureTextEntry={!showPass}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmRef.current?.focus()}
                    onFocus={() => handleFocus(passwordRef, 64)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPass((v) => !v)}
                    style={s.eyeBtn}
                  >
                    <MaterialIcons
                      name={showPass ? 'visibility-off' : 'visibility'}
                      size={20}
                      color={C.onSurfVar}
                    />
                  </TouchableOpacity>
                </View>

                {/* Validation Pills */}
                <View style={s.pillsRow}>
                  <View
                    style={[
                      s.pill,
                      hasEightChars ? s.pillActive : s.pillInactive,
                    ]}
                  >
                    <MaterialIcons
                      name={hasEightChars ? 'check-circle' : 'radio-button-unchecked'}
                      size={14}
                      color={hasEightChars ? C.primary : C.onSurfVar}
                      style={s.pillIcon}
                    />
                    <Text style={[s.pillTxt, hasEightChars && s.pillTxtActive]}>
                      8+ CHARACTERS
                    </Text>
                  </View>

                  <View
                    style={[
                      s.pill,
                      hasUppercase ? s.pillActive : s.pillInactive,
                    ]}
                  >
                    <MaterialIcons
                      name={hasUppercase ? 'check-circle' : 'radio-button-unchecked'}
                      size={14}
                      color={hasUppercase ? C.primary : C.onSurfVar}
                      style={s.pillIcon}
                    />
                    <Text style={[s.pillTxt, hasUppercase && s.pillTxtActive]}>
                      1 UPPERCASE
                    </Text>
                  </View>

                  <View
                    style={[
                      s.pill,
                      hasNumber ? s.pillActive : s.pillInactive,
                    ]}
                  >
                    <MaterialIcons
                      name={hasNumber ? 'check-circle' : 'radio-button-unchecked'}
                      size={14}
                      color={hasNumber ? C.primary : C.onSurfVar}
                      style={s.pillIcon}
                    />
                    <Text style={[s.pillTxt, hasNumber && s.pillTxtActive]}>
                      1 NUMBER
                    </Text>
                  </View>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={s.field}>
                <Text style={s.label}>Confirm Password</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    ref={confirmRef}
                    style={s.input}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(171, 173, 174, 0.6)"
                    secureTextEntry={!showPass}
                    value={confirm}
                    onChangeText={setConfirm}
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                    onFocus={() => handleFocus(confirmRef, 64)}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
                style={[s.btn, loading && { opacity: 0.8 }]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={s.btnInner}>
                    <Text style={s.btnText}>Create Account</Text>
                    <MaterialIcons name="arrow-forward" size={18} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Switch to Login */}
            <View style={s.loginRow}>
              <Text style={s.loginTxt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={s.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* Footer Area */}
            <View style={s.footer}>
              <TouchableOpacity style={s.footerLink} activeOpacity={0.7}>
                <MaterialIcons
                  name="help-outline"
                  size={18}
                  color={C.onSurfVar}
                  style={s.footerIcon}
                />
                <Text style={s.footerLinkTxt}>Help Center</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.footerLink} activeOpacity={0.7}>
                <MaterialIcons
                  name="description"
                  size={18}
                  color={C.onSurfVar}
                  style={s.footerIcon}
                />
                <Text style={s.footerLinkTxt}>Terms</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.footerLink} activeOpacity={0.7}>
                <MaterialIcons
                  name="security"
                  size={18}
                  color={C.onSurfVar}
                  style={s.footerIcon}
                />
                <Text style={s.footerLinkTxt}>Privacy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },

  bgOrb1: {
    position: 'absolute',
    top: 40,
    left: -64,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: C.container,
    opacity: 0.2,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 200,
    right: -64,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#cecdff',
    opacity: 0.3,
  },

  // Header
  header: {
    height: 64,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 47, 48, 0.06)',
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    color: C.primary,
    letterSpacing: -1,
  },

  scroll: {
    flexGrow: 1,
    paddingTop: 24,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Hero
  hero: {
    marginTop: 12,
    marginBottom: 24,
    gap: 12,
  },
  stepTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepTag: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: C.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 48,
    color: C.onSurf,
    lineHeight: 54,
    letterSpacing: -1.5,
  },
  desc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: C.onSurfVar,
    lineHeight: 24,
  },

  errBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.errBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errTxt: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: C.error,
    flex: 1,
  },

  // Form
  form: {
    gap: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: C.onSurfVar,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingLeft: 16,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    height: 64,
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: C.onSurf,
    flex: 1,
    height: '100%',
    padding: 0,
  },
  eyeBtn: {
    padding: 4,
  },

  // Validation pills
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingLeft: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  pillActive: {
    backgroundColor: C.container,
  },
  pillInactive: {
    backgroundColor: C.surfLow,
  },
  pillIcon: {
    marginRight: 4,
  },
  pillTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: C.onSurfVar,
    letterSpacing: 0.5,
  },
  pillTxtActive: {
    color: C.primary,
  },

  // Button
  btn: {
    height: 64,
    backgroundColor: C.primary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
    marginTop: 16,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginTxt: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: C.onSurfVar,
  },
  loginLink: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: C.primary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 6,
  },
  footerLinkTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: C.onSurfVar,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
