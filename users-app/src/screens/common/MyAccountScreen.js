import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function MyAccountScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const insets = useSafeAreaInsets();

  // Edit Name Modal State
  const [showEditName, setShowEditName] = useState(false);
  const [nameVal, setNameVal] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);

  // Edit Phone Modal State
  const [showEditPhone, setShowEditPhone] = useState(false);
  const [phoneVal, setPhoneVal] = useState(user?.phone || '');
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateName = async () => {
    if (!nameVal.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setNameLoading(true);
    try {
      const updated = await api.updateMe(nameVal, user?.phone || '');
      if (setUser && updated) setUser(prev => ({ ...prev, name: updated.name }));
      setNameLoading(false);
      setShowEditName(false);
      Alert.alert('Success', 'Name updated successfully.');
    } catch (err) {
      setNameLoading(false);
      Alert.alert('Error', err.message || 'Failed to update name.');
    }
  };

  const handleUpdatePhone = async () => {
    setPhoneLoading(true);
    try {
      const updated = await api.updateMe(user?.name || '', phoneVal);
      if (setUser && updated) setUser(prev => ({ ...prev, phone: updated.phone }));
      setPhoneLoading(false);
      setShowEditPhone(false);
      Alert.alert('Success', 'Mobile number updated successfully.');
    } catch (err) {
      setPhoneLoading(false);
      Alert.alert('Error', err.message || 'Failed to update mobile number.');
    }
  };

  const handlePasswordSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    try {
      await api.changePassword(oldPassword, newPassword, confirmPassword);
      setPasswordLoading(false);
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Your password has been changed successfully.');
    } catch (err) {
      setPasswordLoading(false);
      setPasswordError(err.message || 'Failed to change password.');
    }
  };

  const email = user?.email || 's.ahsanhassanrizvi2004@gmail.com';
  const username = email.split('@')[0];
  const roleDisplay = user?.role === 'agency' ? 'Verified Agency' : 'Traveler Account';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#52396F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeaderTitle}>Account Information</Text>

        {/* Account Details Group */}
        <View style={styles.groupCard}>
          {/* Name */}
          <TouchableOpacity
            style={styles.itemRow}
            activeOpacity={0.7}
            onPress={() => { setNameVal(user?.name || ''); setShowEditName(true); }}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Name</Text>
              <Text style={styles.itemValue}>{user?.name || 'Ahsan Hassan'}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9E9E9E" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Username */}
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Username</Text>
              <Text style={styles.itemValue}>@{username}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9E9E9E" />
          </View>

          <View style={styles.divider} />

          {/* Mobile Number */}
          <TouchableOpacity
            style={styles.itemRow}
            activeOpacity={0.7}
            onPress={() => { setPhoneVal(user?.phone || ''); setShowEditPhone(true); }}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Mobile Number</Text>
              <Text style={styles.itemValue}>{user?.phone || '0317 1155104'}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9E9E9E" />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Email */}
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Email</Text>
              <Text style={styles.itemValue}>{email}</Text>
            </View>
            <MaterialIcons name="lock-outline" size={18} color="#9E9E9E" />
          </View>

          <View style={styles.divider} />

          {/* Account Type / Role */}
          <View style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Account Type</Text>
              <Text style={styles.itemValue}>{roleDisplay}</Text>
            </View>
            <MaterialIcons name="verified" size={18} color="#52396F" />
          </View>

          <View style={styles.divider} />

          {/* Password */}
          <TouchableOpacity
            style={styles.itemRow}
            activeOpacity={0.7}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.itemLeft}>
              <Text style={styles.itemLabel}>Password</Text>
              <Text style={styles.itemValue}>••••••••</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9E9E9E" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal visible={showEditName} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Name</Text>
              <TouchableOpacity onPress={() => setShowEditName(false)}>
                <MaterialIcons name="close" size={24} color="#2C2F30" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              value={nameVal}
              onChangeText={setNameVal}
              placeholder="Enter your name"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateName} disabled={nameLoading}>
              {nameLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Save Name</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Phone Modal */}
      <Modal visible={showEditPhone} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Mobile Number</Text>
              <TouchableOpacity onPress={() => setShowEditPhone(false)}>
                <MaterialIcons name="close" size={24} color="#2C2F30" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={styles.modalInput}
              value={phoneVal}
              onChangeText={setPhoneVal}
              keyboardType="phone-pad"
              placeholder="03XX XXXXXXX"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleUpdatePhone} disabled={phoneLoading}>
              {phoneLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Save Mobile Number</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <MaterialIcons name="close" size={24} color="#2C2F30" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter current password"
            />
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Min 8 chars, 1 uppercase & 1 number"
            />
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handlePasswordSubmit} disabled={passwordLoading}>
              {passwordLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 47, 48, 0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: '#2C2F30',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeaderTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    color: '#2C2F30',
    marginBottom: 16,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.04)',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  itemLeft: {
    flex: 1,
  },
  itemLabel: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 15,
    color: '#2C2F30',
    marginBottom: 4,
  },
  itemValue: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#757575',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(44, 47, 48, 0.06)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    color: '#2C2F30',
  },
  inputLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#595C5D',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#F5F6F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#2C2F30',
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.08)',
  },
  submitBtn: {
    backgroundColor: '#52396F',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: '#ffffff',
  },
  errorText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#B41340',
    backgroundColor: '#FFE4EC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
});
