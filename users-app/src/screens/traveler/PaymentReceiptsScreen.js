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
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { api } from '../../services/api';

const C = {
  primary: '#52396f',       // Traveler primary (plum)
  onSurf: '#2C2F30',
  onSurfVar: '#595C5D',
  success: '#10B981',
  successBg: '#D1FAE5',
};

export default function PaymentReceiptsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPayments = async () => {
    try {
      const data = await api.getTravelerPayments();
      setPayments(data || []);
    } catch (err) {
      console.log('Error fetching payments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const showReceiptDetail = (item) => {
    Alert.alert(
      'Receipt Details',
      `Package: ${item.package_title}\n\nTransaction ID: ${item.transaction_ref}\nPayout ID: ${item.payout_ref || 'N/A'}\n\nAmount Paid: ${item.amount_paid.toLocaleString()} PKR\nPayment Method: Debit/Credit Card\nDate: ${item.created_at.split('.')[0]}\n\nStatus: Paid & Confirmed`,
      [{ text: 'Close' }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Payment Receipts" showBack navigation={navigation} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment History</Text>

          {payments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt-long" size={64} color="rgba(82, 57, 111, 0.15)" />
              <Text style={styles.emptyText}>You haven't made any deposit payments yet.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {payments.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => showReceiptDetail(item)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.titleCol}>
                      <Text style={styles.pkgTitle} numberOfLines={1}>{item.package_title}</Text>
                      <Text style={styles.txnRef}>TXN ID: {item.transaction_ref}</Text>
                    </View>
                    <View style={styles.successBadge}>
                      <MaterialIcons name="check" size={12} color={C.success} />
                      <Text style={styles.successBadgeText}>Paid</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardFooter}>
                    <View style={styles.infoRow}>
                      <MaterialIcons name="event" size={16} color="#a0a2a3" />
                      <Text style={styles.footerText}>{item.created_at.split(' ')[0]}</Text>
                    </View>
                    <Text style={styles.amountText}>{item.amount_paid.toLocaleString()} PKR</Text>
                  </View>
                </TouchableOpacity>
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
  section: {
    padding: 20,
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
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#595C5D',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    gap: 4,
  },
  pkgTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: '#2C2F30',
  },
  txnRef: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#a0a2a3',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  successBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#10B981',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F5F6F7',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#595C5D',
  },
  amountText: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 15,
    color: '#52396f',
  },
});
