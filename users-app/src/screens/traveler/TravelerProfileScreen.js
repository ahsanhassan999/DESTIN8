import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Modal, TextInput, ActivityIndicator, Alert, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

export default function TravelerProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  // Profile Edit Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Notifications Modal State
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  // Help & Support Modal State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const handleProfileSubmit = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setProfileLoading(true);
    try {
      await api.updateMe(editName, editPhone);
      setProfileLoading(false);
      setShowProfileModal(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err) {
      setProfileLoading(false);
      Alert.alert('Error', err.message || 'Failed to update profile.');
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

  const handleSupportSubmit = () => {
    if (!supportMessage.trim()) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportMessage('');
      setShowSupportModal(false);
      Alert.alert('Ticket Created', 'Our support team will respond within 24 hours.');
    }, 800);
  };

  const getInitials = (name) => {
    if (!name) return 'AH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const name = user?.name || 'Ahmed Hassan';
  const email = user?.email || 'ahmed.hassan@voyage.com';
  const initials = getInitials(name);

  const MENU = [
    { icon: 'manage-accounts', label: 'My Account Details', onPress: () => navigation.navigate('MyAccount') },
    { icon: 'receipt-long', label: 'Payment Receipts', onPress: () => navigation.navigate('PaymentReceipts') },
    { icon: 'person', label: 'Edit Profile', onPress: () => { setEditName(user?.name || ''); setEditPhone(user?.phone || ''); setShowProfileModal(true); } },
    { icon: 'lock', label: 'Security & Change Password', onPress: () => setShowPasswordModal(true) },
    { icon: 'notifications', label: 'Notifications', onPress: () => setShowNotifModal(true) },
    { icon: 'help', label: 'Help & Support', onPress: () => setShowSupportModal(true) },
  ];

  return (
    <View style={styles.container}>
      {/* Absolute Positioned Back Button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <MaterialIcons name="arrow-back" size={24} color="#52396f" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header with Gradient Background */}
        <LinearGradient
          colors={['#E3DBEC', '#f8f9fa']}
          style={[styles.hero, { paddingTop: insets.top + 60 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Avatar Wrap */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          
          {/* Name & Email */}
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          
          {/* Role Chip */}
          <View style={styles.roleChip}>
            <Text style={styles.roleText}>TRAVELER</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>12</Text>
            <Text style={styles.statLabel} numberOfLines={2}>Trips Planned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>24</Text>
            <Text style={styles.statLabel} numberOfLines={2}>Saved Packages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>8</Text>
            <Text style={styles.statLabel} numberOfLines={2}>Reviews Given</Text>
          </View>
        </View>

        {/* Settings List */}
        <View style={styles.menuContainer}>
          {MENU.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <MaterialIcons name={item.icon} size={22} color="#52396f" style={{ backgroundColor: 'transparent' }} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#7b757f" style={{ backgroundColor: 'transparent' }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Row */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => { await logout(); }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={20} color="#ba1a1a" style={{ backgroundColor: 'transparent' }} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <MaterialIcons name="close" size={24} color="#2C2F30" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter full name"
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={editPhone}
              onChangeText={setEditPhone}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleProfileSubmit} disabled={profileLoading}>
              {profileLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
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
              placeholder="Enter current password"
              placeholderTextColor="#A0A0A0"
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder="Min 8 chars, 1 uppercase & 1 number"
              placeholderTextColor="#A0A0A0"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder="Re-enter new password"
              placeholderTextColor="#A0A0A0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handlePasswordSubmit} disabled={passwordLoading}>
              {passwordLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notifications Preferences Modal */}
      <Modal visible={showNotifModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifModal(false)}>
                <MaterialIcons name="close" size={24} color="#2C2F30" />
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Push Notifications</Text>
                <Text style={styles.switchSub}>Booking alerts, chat messages & status updates</Text>
              </View>
              <Switch value={pushNotif} onValueChange={setPushNotif} trackColor={{ false: '#D0D0D0', true: '#52396F' }} />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Email Notifications</Text>
                <Text style={styles.switchSub}>Payment receipts and trip confirmation emails</Text>
              </View>
              <Switch value={emailNotif} onValueChange={setEmailNotif} trackColor={{ false: '#D0D0D0', true: '#52396F' }} />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={() => { setShowNotifModal(false); Alert.alert('Saved', 'Notification preferences saved.'); }}>
              <Text style={styles.submitBtnTxt}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal visible={showSupportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setShowSupportModal(false)}>
                <MaterialIcons name="close" size={24} color="#2C2F30" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Describe your inquiry or issue</Text>
            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              multiline
              placeholder="How can we help you?"
              value={supportMessage}
              onChangeText={setSupportMessage}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSupportSubmit} disabled={supportSent}>
              {supportSent ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnTxt}>Submit Ticket</Text>}
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
    backgroundColor: '#f8f9fa',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(82, 57, 111, 0.1)',
  },
  hero: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#6a5188',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(106, 81, 136, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 16,
  },
  avatarText: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 28,
    color: '#e4cbff',
  },
  name: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 28,
    color: '#191c1d',
    marginBottom: 6,
  },
  email: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    color: '#4a454e',
    marginBottom: 16,
  },
  roleChip: {
    backgroundColor: 'rgba(82, 57, 111, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  roleText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#52396f',
    letterSpacing: 1.2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: -24,
    marginBottom: 40,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2c2f30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.05)',
  },
  statVal: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 24,
    color: '#52396f',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#4a454e',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f5',
    borderRadius: 16,
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 16,
    color: '#191c1d',
  },
  logoutContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(186, 26, 26, 0.05)',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.1)',
  },
  logoutText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#ba1a1a',
  },

  // Modal Styles
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 47, 48, 0.06)',
  },
  switchLabel: {
    fontFamily: 'Epilogue_600SemiBold',
    fontSize: 15,
    color: '#2C2F30',
  },
  switchSub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#595C5D',
    marginTop: 2,
  },
});
