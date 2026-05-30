import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';

const FIELDS = [
  { key: 'agencyName',   label: 'AGENCY NAME',     placeholder: 'e.g. Peak Adventures',     icon: '🏢' },
  { key: 'ownerName',    label: 'OWNER NAME',       placeholder: 'Full name',                icon: '👤' },
  { key: 'email',        label: 'BUSINESS EMAIL',   placeholder: 'info@agency.pk',           icon: '✉', keyboardType: 'email-address' },
  { key: 'phone',        label: 'PHONE NUMBER',     placeholder: '+92 300 1234567',           icon: '📞', keyboardType: 'phone-pad' },
  { key: 'address',      label: 'BUSINESS ADDRESS', placeholder: 'City, Province',           icon: '📍' },
  { key: 'license',      label: 'TDCP LICENSE NO.', placeholder: 'e.g. KHI-AGN-00121',       icon: '📄' },
  { key: 'password',     label: 'PASSWORD',         placeholder: 'Min. 6 characters',        icon: '🔒', secure: true },
  { key: 'confirm',      label: 'CONFIRM PASSWORD', placeholder: 'Repeat password',          icon: '🔑', secure: true },
];

export default function AgencySignUpScreen({ navigation }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSignUp = async () => {
    setError('');
    const required = ['agencyName', 'ownerName', 'email', 'license', 'password'];
    if (required.some(k => !form[k])) { setError('Please fill in all required fields.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    navigation.replace('AgencyPending');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#EDE8F5', '#F5F2FA', '#FFF']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.stepTag}>AGENCY REGISTRATION</Text>
        <Text style={styles.title}>List your{'\n'}agency</Text>
        <Text style={styles.subtitle}>Submit your details for verification. Approved within 24-48 hours.</Text>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ</Text>
          <Text style={styles.infoText}>You'll need your TDCP (Tourism Development Corporation Punjab) license number to register.</Text>
        </View>

        <View style={styles.form}>
          {FIELDS.map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>{f.icon}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textFaint}
                  keyboardType={f.keyboardType || 'default'}
                  secureTextEntry={f.secure}
                  autoCapitalize={f.key === 'agencyName' || f.key === 'ownerName' ? 'words' : 'none'}
                  value={form[f.key] || ''}
                  onChangeText={v => set(f.key, v)}
                />
              </View>
            </View>
          ))}

          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

          <TouchableOpacity onPress={handleSignUp} activeOpacity={0.85} disabled={loading} style={styles.btn}>
            <LinearGradient colors={[Colors.plum, Colors.primary]} style={styles.btnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit for Approval</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginRow}>
            <Text style={styles.loginText}>Already registered? <Text style={styles.loginLink}>Sign In</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: 56, paddingBottom: 48 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(82,57,111,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  backIcon: { fontSize: 18, color: Colors.plum },
  stepTag: { ...Typography.labelMD, color: Colors.lavender, marginBottom: 8 },
  title: { ...Typography.displayLG, color: Colors.onSurface, marginBottom: Spacing.sm },
  subtitle: { ...Typography.bodyLG, color: Colors.onSurfaceVariant, marginBottom: Spacing.md },
  infoCard: { flexDirection: 'row', gap: 10, backgroundColor: Colors.lavenderLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  infoIcon: { fontSize: 18 },
  infoText: { ...Typography.bodyMD, color: Colors.plum, flex: 1, lineHeight: 20 },
  form: { gap: Spacing.md },
  field: { gap: 8 },
  label: { ...Typography.labelMD, color: Colors.onSurfaceVariant },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 32, paddingHorizontal: Spacing.md, paddingVertical: 14, ...Shadows.card },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { ...Typography.bodyLG, color: Colors.onSurface, flex: 1 },
  errorBox: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: Spacing.md },
  errorText: { ...Typography.bodyMD, color: Colors.error },
  btn: { borderRadius: Radius.full, overflow: 'hidden' },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { ...Typography.labelLG, color: Colors.white, fontSize: 14 },
  loginRow: { alignItems: 'center' },
  loginText: { ...Typography.bodyMD, color: Colors.onSurfaceVariant },
  loginLink: { color: Colors.plum, fontFamily: 'Manrope_700Bold' },
});
