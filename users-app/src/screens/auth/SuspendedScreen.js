import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '../../theme';

export default function SuspendedScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2C0A1E', '#52396F']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>⊘</Text>
        </View>
        <Text style={styles.title}>Account Suspended</Text>
        <Text style={styles.desc}>
          Your account has been suspended by the DESTIN8 admin team.{'\n\n'}
          If you believe this is a mistake, please contact our support team.
        </Text>
        <View style={styles.contactCard}>
          <Text style={styles.contactLabel}>SUPPORT EMAIL</Text>
          <Text style={styles.contactValue}>support@destin8.pk</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.btn}>
          <Text style={styles.btnText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(180,19,64,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  icon: { fontSize: 44, color: '#FF6B8A' },
  title: { ...Typography.displayLG, color: Colors.white, textAlign: 'center' },
  desc: { ...Typography.bodyLG, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 26 },
  contactCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', width: '100%' },
  contactLabel: { ...Typography.labelMD, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  contactValue: { ...Typography.headlineSM, color: Colors.white },
  btn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.full, paddingVertical: 14, paddingHorizontal: Spacing.xl },
  btnText: { ...Typography.labelLG, color: Colors.white },
});
