import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import AppHeader from '../../components/AppHeader';

const FIELDS = [
  { key: 'title',       label: 'PACKAGE TITLE',       placeholder: 'e.g. Hunza Valley 7-Day Retreat', icon: 'flight-takeoff' },
  { key: 'destination', label: 'DESTINATION',          placeholder: 'e.g. Hunza, Gilgit-Baltistan',    icon: 'location-on' },
  { key: 'duration',    label: 'DURATION (DAYS)',      placeholder: 'e.g. 7',                           icon: 'today', keyboardType: 'numeric' },
  { key: 'price',       label: 'PRICE PER PERSON (PKR)', placeholder: 'e.g. 85000',                    icon: 'local-atm', keyboardType: 'numeric' },
  { key: 'groupSize',   label: 'GROUP SIZE',           placeholder: 'e.g. 4–12 people',                icon: 'people' },
  { key: 'difficulty',  label: 'DIFFICULTY LEVEL',     placeholder: 'Easy / Moderate / Challenging',   icon: 'assessment' },
];

export default function PostPackageScreen({ navigation }) {
  const [form, setForm] = useState({});
  const [description, setDescription] = useState('');
  const [highlights, setHighlights] = useState('');
  const [inclusions, setInclusions] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); navigation.goBack(); }, 2000);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Post Package" showBack navigation={navigation} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.stepTag}>NEW PACKAGE</Text>
          <Text style={styles.title}>Post a Travel{'\n'}Package</Text>
          <Text style={styles.subtitle}>Fill in the details below. Your package will be reviewed before going live.</Text>

          {/* Info card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={Colors.plum} style={styles.infoIcon} />
            <Text style={styles.infoText}>Your package will be reviewed by the admin team to ensure compliance with our premium listing standards.</Text>
          </View>

          <View style={styles.form}>
            {FIELDS.map(f => (
              <View key={f.key} style={styles.field}>
                <Text style={styles.label}>{f.label}</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name={f.icon} size={20} color={Colors.plum} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={f.placeholder}
                    placeholderTextColor={Colors.textFaint}
                    keyboardType={f.keyboardType || 'default'}
                    value={form[f.key] || ''}
                    onChangeText={v => set(f.key, v)}
                  />
                </View>
              </View>
            ))}

            {/* Multiline fields */}
            {[
              { key: 'description', label: 'DESCRIPTION', val: description, set: setDescription, placeholder: 'Describe the experience in detail...' },
              { key: 'highlights', label: 'HIGHLIGHTS (one per line)', val: highlights, set: setHighlights, placeholder: 'Eagle\'s Nest viewpoint\nBaltit Fort visit\n...' },
              { key: 'inclusions', label: 'INCLUSIONS (one per line)', val: inclusions, set: setInclusions, placeholder: 'Return transport\nAll meals\n...' },
            ].map(f => (
              <View key={f.key} style={styles.field}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textFaint}
                  multiline
                  numberOfLines={4}
                  value={f.val}
                  onChangeText={f.set}
                />
              </View>
            ))}

            {success && (
              <View style={styles.successBox}>
                <MaterialIcons name="check-circle" size={18} color={Colors.success} style={{ marginRight: 6 }} />
                <Text style={styles.successText}>Package submitted for review!</Text>
              </View>
            )}

            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} disabled={loading} style={styles.btn}>
              <LinearGradient colors={[Colors.plum, Colors.primary]} style={styles.btnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit Package</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: 20, paddingBottom: 48 },
  stepTag: { ...Typography.labelMD, color: Colors.lavender, marginBottom: 8 },
  title: { ...Typography.displayLG, color: Colors.onSurface, marginBottom: Spacing.sm },
  subtitle: { ...Typography.bodyLG, color: Colors.onSurfaceVariant, marginBottom: Spacing.md },
  infoCard: { flexDirection: 'row', gap: 10, backgroundColor: Colors.lavenderLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, alignItems: 'center' },
  infoIcon: { marginRight: 4 },
  infoText: { ...Typography.bodyMD, color: Colors.plum, flex: 1, lineHeight: 20 },
  form: { gap: Spacing.md },
  field: { gap: 8 },
  label: { ...Typography.labelMD, color: Colors.onSurfaceVariant },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 14, ...Shadows.card },
  inputIcon: { marginRight: 10 },
  input: { ...Typography.bodyLG, color: Colors.onSurface, flex: 1, padding: 0 },
  textArea: { backgroundColor: Colors.white, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, ...Typography.bodyMD, color: Colors.onSurface, minHeight: 100, textAlignVertical: 'top', ...Shadows.card },
  successBox: { backgroundColor: Colors.successBg, borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  successText: { ...Typography.bodyMD, color: Colors.success },
  btn: { borderRadius: Radius.full, overflow: 'hidden', marginTop: Spacing.sm },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { ...Typography.labelLG, color: Colors.white, fontSize: 14 },
});
