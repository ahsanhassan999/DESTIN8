import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function AgencySignUpScreen({ navigation }) {
  // Form states
  const [agencyName, setAgencyName] = useState('');
  const [license, setLicense] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs for auto-scrolling & shift focus
  const scrollRef = React.useRef(null);
  const agencyNameRef = React.useRef(null);
  const licenseRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const addressRef = React.useRef(null);
  const ownerNameRef = React.useRef(null);
  const phoneRef = React.useRef(null);
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
    if (
      !agencyName ||
      !license ||
      !email ||
      !address ||
      !ownerName ||
      !phone ||
      !password ||
      !confirm
    ) {
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
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    navigation.replace('AgencyPending');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={C.primary} />
          </TouchableOpacity>
          <Text style={styles.logo}>DESTIN8</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Asymmetrical Background Elements */}
        <View style={styles.bgOrb1} pointerEvents="none" />
        <View style={styles.bgOrb2} pointerEvents="none" />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onLayout={(e) => {
            setVisibleHeight(e.nativeEvent.layout.height);
          }}
        >
          <View style={styles.content}>
            {/* Tag badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeTxt}>Partner Portal</Text>
            </View>

            {/* Title & Description */}
            <Text style={styles.heroTitle}>
              Empower your <Text style={styles.heroItalic}>travel</Text> legacy.
            </Text>
            <Text style={styles.heroDesc}>
              Join an elite circle of global curators. Register your agency
              today and start crafting unforgettable journeys for the world's
              most discerning travelers.
            </Text>

            {/* Visual Element: Overlapping Editorial Style */}
            <View style={styles.imageContainer}>
              <View style={styles.heroImageWrapper}>
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmBBZ977PSd48OKVGAXKT4WwOKE9CIFxfI0ANgmL9gMWLrhGxDEi2uY7vqTv9PP9tEqqIH__JZG6pv-FMvPQdSNFwemU3n9dgDCG3gUuB2WKfM7yF-10LjScrmQpWMkF9EdLXl49qMSmaxF2_7drbyt6Y6u4aGo8tKoh8cbRM1CuTUQCwtNf-K2jjNoG-553oTam_sVIPWtZ1t4MslbuIRtc_QzGp9IxRrmXHxUhDUtHawnfunZFAG7Hz72RnwTfb7qNQriOgFihVE',
                  }}
                  style={styles.heroImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.floatingCard}>
                <MaterialIcons
                  name="verified-user"
                  size={28}
                  color={C.primary}
                  style={{ marginBottom: 6 }}
                />
                <Text style={styles.floatingCardTitle}>
                  Global Verification Standards
                </Text>
              </View>
            </View>

            {/* Form Container Card */}
            <View style={styles.formCard}>
              {/* Error Box */}
              {!!error && (
                <View style={styles.errorBox}>
                  <MaterialIcons
                    name="error-outline"
                    size={16}
                    color={C.error}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Section 1: Agency Identity */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <MaterialIcons
                      name="business-center"
                      size={24}
                      color={C.primary}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>Agency Identity</Text>
                </View>

                <View style={styles.formGroup}>
                  {/* Agency Name */}
                  <View style={styles.field}>
                    <Text style={styles.label}>AGENCY NAME</Text>
                    <TextInput
                      ref={agencyNameRef}
                      style={styles.input}
                      placeholder="e.g. Elite Travels"
                      placeholderTextColor="rgba(171, 173, 174, 0.6)"
                      value={agencyName}
                      onChangeText={setAgencyName}
                      returnKeyType="next"
                      onSubmitEditing={() => licenseRef.current?.focus()}
                      onFocus={() => handleFocus(agencyNameRef, 64)}
                    />
                  </View>

                  {/* Business License */}
                  <View style={styles.field}>
                    <Text style={styles.label}>BUSINESS LICENSE NUMBER</Text>
                    <TextInput
                      ref={licenseRef}
                      style={styles.input}
                      placeholder="e.g. AB123456789"
                      placeholderTextColor="rgba(171, 173, 174, 0.6)"
                      value={license}
                      onChangeText={setLicense}
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                      onFocus={() => handleFocus(licenseRef, 64)}
                    />
                  </View>

                  {/* Professional Email */}
                  <View style={styles.field}>
                    <Text style={styles.label}>PROFESSIONAL EMAIL</Text>
                    <TextInput
                      ref={emailRef}
                      style={styles.input}
                      placeholder="owner@agency.com"
                      placeholderTextColor="rgba(171, 173, 174, 0.6)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      returnKeyType="next"
                      onSubmitEditing={() => addressRef.current?.focus()}
                      onFocus={() => handleFocus(emailRef, 64)}
                    />
                  </View>

                  {/* Business Address */}
                  <View style={styles.field}>
                    <Text style={styles.label}>BUSINESS ADDRESS</Text>
                    <TextInput
                      ref={addressRef}
                      style={styles.inputMultiline}
                      placeholder="e.g. 123 Business Ave, Lahore"
                      placeholderTextColor="rgba(171, 173, 174, 0.6)"
                      multiline
                      numberOfLines={3}
                      value={address}
                      onChangeText={setAddress}
                      returnKeyType="next"
                      blurOnSubmit={true}
                      onSubmitEditing={() => ownerNameRef.current?.focus()}
                      onFocus={() => handleFocus(addressRef, 120)}
                    />
                  </View>
                </View>
              </View>

              {/* Section 2: Owner Profile */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <MaterialIcons name="person" size={24} color={C.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Owner Profile</Text>
                </View>

                <View style={styles.formGroup}>
                  {/* Owner Full Name */}
                  <View style={styles.field}>
                    <Text style={styles.label}>OWNER FULL NAME</Text>
                    <TextInput
                      ref={ownerNameRef}
                      style={styles.input}
                      placeholder="e.g. Zahra Khan"
                      placeholderTextColor="rgba(171, 173, 174, 0.6)"
                      autoCapitalize="words"
                      value={ownerName}
                      onChangeText={setOwnerName}
                      returnKeyType="next"
                      onSubmitEditing={() => phoneRef.current?.focus()}
                      onFocus={() => handleFocus(ownerNameRef, 64)}
                    />
                  </View>

                  {/* Phone Number */}
                  <View style={styles.field}>
                    <Text style={styles.label}>PHONE NUMBER</Text>
                    <View style={{ justifyContent: 'center' }}>
                      <TextInput
                        ref={phoneRef}
                        style={[styles.input, { paddingRight: 56 }]}
                        placeholder="03XX-XXXXXXX"
                        placeholderTextColor="rgba(171, 173, 174, 0.6)"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        onFocus={() => handleFocus(phoneRef, 64)}
                      />
                      <MaterialIcons
                        name="phone-android"
                        size={20}
                        color={C.primary}
                        style={styles.inputRightIcon}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Section 3: Security Access */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <MaterialIcons name="lock" size={24} color={C.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Security Access</Text>
                </View>

                <View style={styles.formGroup}>
                  {/* Password */}
                  <View style={styles.field}>
                    <Text style={styles.label}>CREATE PASSWORD</Text>
                    <View style={{ justifyContent: 'center' }}>
                      <TextInput
                        ref={passwordRef}
                        style={[styles.input, { paddingRight: 56 }]}
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
                        style={styles.inputRightIconBtn}
                      >
                        <MaterialIcons
                          name={showPass ? 'visibility-off' : 'visibility'}
                          size={20}
                          color={C.onSurfVar}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.field}>
                    <Text style={styles.label}>CONFIRM PASSWORD</Text>
                    <View style={{ justifyContent: 'center' }}>
                      <TextInput
                        ref={confirmRef}
                        style={[styles.input, { paddingRight: 56 }]}
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
                </View>

                {/* Validation Chips */}
                <View style={styles.pillsRow}>
                  <View
                    style={[
                      styles.pill,
                      hasEightChars ? styles.pillActive : styles.pillInactive,
                    ]}
                  >
                    <MaterialIcons
                      name={
                        hasEightChars ? 'check-circle' : 'radio-button-unchecked'
                      }
                      size={14}
                      color={hasEightChars ? C.primary : C.onSurfVar}
                      style={styles.pillIcon}
                    />
                    <Text
                      style={[
                        styles.pillTxt,
                        hasEightChars && styles.pillTxtActive,
                      ]}
                    >
                      8+ CHARACTERS
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.pill,
                      hasUppercase ? styles.pillActive : styles.pillInactive,
                    ]}
                  >
                    <MaterialIcons
                      name={
                        hasUppercase ? 'check-circle' : 'radio-button-unchecked'
                      }
                      size={14}
                      color={hasUppercase ? C.primary : C.onSurfVar}
                      style={styles.pillIcon}
                    />
                    <Text
                      style={[
                        styles.pillTxt,
                        hasUppercase && styles.pillTxtActive,
                      ]}
                    >
                      1 UPPERCASE
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.pill,
                      hasNumber ? styles.pillActive : styles.pillInactive,
                    ]}
                  >
                    <MaterialIcons
                      name={
                        hasNumber ? 'check-circle' : 'radio-button-unchecked'
                      }
                      size={14}
                      color={hasNumber ? C.primary : C.onSurfVar}
                      style={styles.pillIcon}
                    />
                    <Text
                      style={[
                        styles.pillTxt,
                        hasNumber && styles.pillTxtActive,
                      ]}
                    >
                      1 NUMBER
                    </Text>
                  </View>
                </View>
              </View>

              {/* CTA Section */}
              <View style={styles.ctaContainer}>
                {/* Certification Checkbox */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAgreed((v) => !v)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={agreed ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={agreed ? C.primary : C.onSurfVar}
                    style={styles.checkboxIcon}
                  />
                  <Text style={styles.checkboxText}>
                    I certify that the information provided is accurate and I
                    agree to Destin8's{' '}
                    <Text style={styles.textLink}>Agency Terms of Service</Text>{' '}
                    and <Text style={styles.textLink}>Privacy Policy</Text>.
                  </Text>
                </TouchableOpacity>

                {/* Submit button */}
                <TouchableOpacity
                  onPress={handleSignUp}
                  disabled={loading}
                  activeOpacity={0.85}
                  style={styles.btn}
                >
                  <LinearGradient
                    colors={[C.primary, '#B39ED1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGrad}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.btnInner}>
                        <Text style={styles.btnText}>Submit for Approval</Text>
                        <MaterialIcons
                          name="arrow-forward"
                          size={20}
                          color="#fff"
                        />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Login redirection */}
              <View style={styles.loginRow}>
                <Text style={styles.loginTxt}>
                  Already have an agency account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign in here</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer Area */}
            <View style={styles.footer}>
              <Text style={styles.footerCopyright}>
                © 2024 DESTIN8 Editorial Travel
              </Text>
              <View style={styles.footerLinks}>
                <TouchableOpacity>
                  <Text style={styles.footerLinkTxt}>Help</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.footerLinkTxt}>Terms</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.footerLinkTxt}>Privacy</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.footerIcons}>
                <MaterialIcons
                  name="language"
                  size={18}
                  color={C.onSurfVar}
                  style={{ marginRight: 16 }}
                />
                <MaterialIcons name="share" size={18} color={C.onSurfVar} />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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

  // Tag Badge
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: C.container,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
  },
  badgeTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: C.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Hero section
  heroTitle: {
    fontFamily: 'Epilogue_900Black',
    fontSize: 44,
    color: C.onSurf,
    lineHeight: 52,
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  heroItalic: {
    fontFamily: 'Epilogue_900Black',
    fontStyle: 'italic',
    color: C.primary,
  },
  heroDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    color: C.onSurfVar,
    lineHeight: 24,
    marginBottom: 32,
  },

  // Visual Image layout
  imageContainer: {
    position: 'relative',
    marginTop: 12,
    marginBottom: 48,
    width: '100%',
    height: 380,
  },
  heroImageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    transform: [{ rotate: '2deg' }],
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingCard: {
    position: 'absolute',
    bottom: -24,
    left: 16,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    maxWidth: 200,
    transform: [{ rotate: '-3deg' }],
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
  },
  floatingCardTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: C.onSurf,
    lineHeight: 18,
  },

  // Form container card
  formCard: {
    marginTop: 40,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.errBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: C.error,
    flex: 1,
  },

  // Form Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  sectionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(150, 123, 182, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 22,
    color: C.onSurf,
  },
  formGroup: {
    gap: 24,
  },

  // Fields
  field: {
    gap: 8,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: C.onSurfVar,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingLeft: 16,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    height: 64,
    paddingHorizontal: 24,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: C.onSurf,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inputMultiline: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    height: 120,
    paddingHorizontal: 24,
    paddingTop: 16,
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: C.onSurf,
    textAlignVertical: 'top',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inputRightIcon: {
    position: 'absolute',
    right: 24,
    opacity: 0.5,
  },
  inputRightIconBtn: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },

  // Validation pills
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
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

  // CTA Section
  ctaContainer: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E6E8EA',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  checkboxIcon: {
    marginTop: 2,
  },
  checkboxText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: C.onSurfVar,
    lineHeight: 20,
    flex: 1,
  },
  textLink: {
    fontFamily: 'Manrope_700Bold',
    color: C.primary,
  },

  // Submit Button
  btn: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 6,
    marginTop: 8,
  },
  btnGrad: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  // Redirect
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginTxt: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: C.onSurfVar,
  },
  loginLink: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: C.primary,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 40,
    marginBottom: 16,
    gap: 16,
  },
  footerCopyright: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: C.primary,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  footerLinkTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: C.onSurfVar,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  footerIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
});
