import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/AppHeader';
import { api } from '../../services/api';

const C = {
  primary: '#967BB6',       // Lavender primary
  onPrimary: '#ffffff',
  background: '#F5F6F7',
  onSurf: '#2C2F30',
  onSurfVar: '#595C5D',
  success: '#10B981',
  successBg: '#D1FAE5',
};

export default function AgencyWalletScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bankInfo, setBankInfo] = useState(null);

  const loadData = async () => {
    try {
      const walletData = await api.getAgencyWallet();
      setWallet(walletData);
      
      const details = await api.getBankDetails();
      if (details && details.bank_name) {
        setBankInfo(details);
      }
    } catch (err) {
      console.log('Error loading wallet details:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatAmount = (num) => {
    return (num || 0).toLocaleString() + ' PKR';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const payoutHistory = wallet?.payout_history || [];

  return (
    <View style={styles.container}>
      <AppHeader title="Earnings & Wallet" showBack navigation={navigation} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
        }
      >
        {/* Earnings Card */}
        <LinearGradient
          colors={['#967BB6', '#6A5188']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>Net Earnings (Auto-Withdrawn)</Text>
            <MaterialIcons name="account-balance-wallet" size={24} color="#e4cbff" />
          </View>
          <Text style={styles.balanceAmount}>{formatAmount(wallet?.total_balance)}</Text>
          
          <View style={styles.balanceDetailsRow}>
            <View>
              <Text style={styles.detailsLabel}>Platform Fees Paid</Text>
              <Text style={styles.detailsVal}>{formatAmount(wallet?.platform_fees_paid)}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View>
              <Text style={styles.detailsLabel}>Payout Method</Text>
              <Text style={styles.detailsVal} numberOfLines={1}>
                {bankInfo ? `${bankInfo.bank_name} (*${bankInfo.account_number.slice(-4)})` : 'Link bank account'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {!bankInfo && (
          <TouchableOpacity
            style={styles.warningBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('BankDetails')}
          >
            <MaterialIcons name="warning" size={22} color="#ba1a1a" />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Bank Details Missing</Text>
              <Text style={styles.warningDesc}>Link your bank account to authorize deposit payouts.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#ba1a1a" />
          </TouchableOpacity>
        )}

        {/* Transactions Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Payout Transactions Ledger</Text>
          
          {payoutHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt" size={48} color="rgba(89, 92, 93, 0.2)" />
              <Text style={styles.emptyText}>No payouts processed yet.</Text>
            </View>
          ) : (
            <View style={styles.ledgerList}>
              {payoutHistory.map((item) => (
                <View key={item.id} style={styles.ledgerItem}>
                  {/* Left Column Icon */}
                  <View style={styles.ledgerIconWrap}>
                    <MaterialIcons name="arrow-downward" size={20} color={C.success} />
                  </View>

                  {/* Middle Column Details */}
                  <View style={styles.ledgerDetails}>
                    <Text style={styles.ledgerPkgTitle} numberOfLines={1}>{item.package_title}</Text>
                    <Text style={styles.ledgerDate}>Ref: {item.transaction_ref} • {item.created_at.split(' ')[0]}</Text>
                    
                    {/* Financial details breakdown in ledger */}
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Total paid: {formatAmount(item.amount_paid)}</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Fee (10%): -{formatAmount(item.commission_deducted)}</Text>
                    </View>
                  </View>

                  {/* Right Column Net Payout */}
                  <View style={styles.ledgerRight}>
                    <Text style={styles.ledgerNetPrice}>+{formatAmount(item.payout_amount)}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>Processed</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F7',
  },
  balanceCard: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#6A5188',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#e4cbff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 24,
  },
  balanceDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 16,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  detailsLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: '#e4cbff',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailsVal: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#ffffff',
    maxWidth: 140,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4EC',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(180, 19, 64, 0.15)',
    gap: 12,
    marginBottom: 8,
  },
  warningTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 13,
    color: '#B41340',
  },
  warningDesc: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#4A454E',
    marginTop: 2,
  },
  historySection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 16,
    color: '#2C2F30',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#595C5D',
  },
  ledgerList: {
    gap: 12,
  },
  ledgerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.01)',
  },
  ledgerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ledgerDetails: {
    flex: 1,
    gap: 2,
  },
  ledgerPkgTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: '#2C2F30',
    maxWidth: 160,
  },
  ledgerDate: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#a0a2a3',
    marginBottom: 4,
  },
  breakdownRow: {
    marginTop: 1,
  },
  breakdownLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#595C5D',
  },
  ledgerRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  ledgerNetPrice: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: '#10B981',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 9,
    color: '#10B981',
    textTransform: 'uppercase',
  },
});
