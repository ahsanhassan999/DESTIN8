import React, { useState, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { api } from '../../services/api';

const C = {
  primary: '#967BB6',       // Lavender primary
  container: '#E8E1F0',     // Lavender container
  onSurf: '#2C2F30',
  onSurfVar: '#595C5D',
  background: '#F5F6F7',
  success: '#10B981',
};

export default function BankDetailsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branchCode, setBranchCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('not_submitted');
  const [rejectionReason, setRejectionReason] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchBankDetails = async () => {
        setFetching(true);
        try {
          const details = await api.getBankDetails();
          if (details) {
            setBankName(details.bank_name || '');
            setAccountTitle(details.account_title || '');
            setAccountNumber(details.account_number || '');
            setBranchCode(details.branch_code || '');
            setVerificationStatus(details.bank_verification_status || 'not_submitted');
            setRejectionReason(details.bank_rejection_reason || null);
          }
        } catch (err) {
          console.log('Failed to fetch bank details:', err);
        } finally {
          setFetching(false);
        }
      };
      fetchBankDetails();
    }, [])
  );

  const handleSave = async () => {
    if (!bankName.trim() || !accountTitle.trim() || !accountNumber.trim() || !branchCode.trim()) {
      Alert.alert('Missing Info', 'Please fill in all the bank account fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.updateBankDetails({
        bank_name: bankName.trim(),
        account_title: accountTitle.trim(),
        account_number: accountNumber.trim(),
        branch_code: branchCode.trim(),
      });
      console.log('Bank details saved:', result);
      setVerificationStatus('pending');
      Alert.alert('Submitted for Verification ✓', 'Your bank account details have been submitted. Admin will review and verify them. You will be able to receive payouts once verified.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.log('Bank details save error:', err);
      Alert.alert('Save Failed', err.message || 'Could not save bank details. Make sure you are logged in as an approved agency and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Bank Account Linkage" showBack navigation={navigation} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Verification Status Badge */}
          {verificationStatus !== 'not_submitted' && (
            <View style={[
              styles.verificationBadge,
              verificationStatus === 'verified' && styles.badgeVerified,
              verificationStatus === 'pending' && styles.badgePending,
              verificationStatus === 'rejected' && styles.badgeRejected,
            ]}>
              <MaterialIcons
                name={verificationStatus === 'verified' ? 'verified' : verificationStatus === 'pending' ? 'hourglass-empty' : 'error'}
                size={18}
                color={verificationStatus === 'verified' ? '#1b8a4e' : verificationStatus === 'pending' ? '#a16207' : '#b91c1c'}
              />
              <Text style={[
                styles.verificationText,
                verificationStatus === 'verified' && { color: '#1b8a4e' },
                verificationStatus === 'pending' && { color: '#a16207' },
                verificationStatus === 'rejected' && { color: '#b91c1c' },
              ]}>
                {verificationStatus === 'verified' && 'Account Verified — Payouts Enabled'}
                {verificationStatus === 'pending' && 'Pending Admin Verification — Payouts on hold'}
                {verificationStatus === 'rejected' && `Account Rejected: ${rejectionReason || 'Contact support'}`}
              </Text>
            </View>
          )}

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <MaterialIcons name="info" size={22} color={C.primary} />
            <Text style={styles.infoText}>
              Link your business bank account to receive automatic traveler deposit payouts directly. Payouts are processed instantly after deducting the platform's 10% commission.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Details</Text>

            <View style={styles.formGroup}>
              {/* Bank Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Bank Name</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="account-balance" size={20} color="rgba(89, 92, 93, 0.4)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Habib Bank Limited"
                    placeholderTextColor="rgba(89, 92, 93, 0.4)"
                    value={bankName}
                    onChangeText={setBankName}
                  />
                </View>
              </View>

              {/* Account Title */}
              <View style={styles.field}>
                <Text style={styles.label}>Account Title</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="person" size={20} color="rgba(89, 92, 93, 0.4)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Odyssey Travels Pvt Ltd"
                    placeholderTextColor="rgba(89, 92, 93, 0.4)"
                    value={accountTitle}
                    onChangeText={setAccountTitle}
                  />
                </View>
              </View>

              {/* Account Number / IBAN */}
              <View style={styles.field}>
                <Text style={styles.label}>Account Number / IBAN</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="payment" size={20} color="rgba(89, 92, 93, 0.4)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. PK00ALFH00010203040506"
                    placeholderTextColor="rgba(89, 92, 93, 0.4)"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                  />
                </View>
              </View>

              {/* Branch Code */}
              <View style={styles.field}>
                <Text style={styles.label}>Branch Code</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="tag" size={20} color="rgba(89, 92, 93, 0.4)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 0123"
                    placeholderTextColor="rgba(89, 92, 93, 0.4)"
                    value={branchCode}
                    onChangeText={setBranchCode}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (loading || verificationStatus === 'verified') && { backgroundColor: 'rgba(150, 123, 182, 0.5)' }
            ]}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={loading || verificationStatus === 'verified'}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.saveBtnTxt}>
                {verificationStatus === 'verified' ? 'Account Already Verified' : 'Submit for Verification'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F7',
  },
  scroll: {
    padding: 20,
    gap: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E8E1F0',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.2)',
    gap: 12,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 4,
  },
  badgeVerified: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  badgePending: {
    backgroundColor: '#fefce8',
    borderColor: '#fde047',
  },
  badgeRejected: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  verificationText: {
    flex: 1,
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#595C5D',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.02,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.02)',
  },
  cardTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 16,
    color: '#2C2F30',
    marginBottom: 16,
  },
  formGroup: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#2C2F30',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#2C2F30',
  },
  saveBtn: {
    backgroundColor: '#967BB6',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#967BB6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  saveBtnTxt: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});
