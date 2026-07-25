import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';

const C = {
  primary: '#967BB6',
  darkPlum: '#52396F',
  onSurf: '#2C2F30',
  onSurfVar: '#595C5D',
  surfLow: '#EFF1F2',
  background: '#F5F6F7',
  cardBg: '#FFFFFF',
  gold: '#D97706',
};

export default function AgencyReviewsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await api.getAgencyReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading agency reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReviews(false);
    }, [loadReviews])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReviews(false);
  }, [loadReviews]);

  // Compute stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 5), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <View style={styles.container}>
      {/* Back Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={C.darkPlum} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Reviews & Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[C.primary]}
            tintColor={C.primary}
          />
        }
      >
        {/* Rating Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.avgRatingText}>{avgRating}</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                  key={star}
                  name={star <= Math.round(parseFloat(avgRating)) ? "star" : "star-border"}
                  size={20}
                  color={C.gold}
                />
              ))}
            </View>
            <Text style={styles.summarySubtext}>Based on {reviews.length} traveler reviews</Text>
          </View>
        </View>

        {/* Reviews List Header */}
        <Text style={styles.sectionTitle}>Recent Traveler Feedback</Text>

        {loading ? (
          <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 48 }} />
        ) : reviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="rate-review" size={56} color="rgba(150, 123, 182, 0.3)" />
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptySub}>
              Traveler feedback will appear here as soon as travelers complete their trips and post reviews.
            </Text>
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {reviews.map((item) => (
              <View key={item.id} style={styles.reviewCard}>
                {/* Header Row: Traveler Name & Rating */}
                <View style={styles.cardHeader}>
                  <View style={styles.userWrap}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarTxt}>
                        {(item.user_name || 'T').substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>{item.user_name || 'Traveler'}</Text>
                      <Text style={styles.pkgTitleBadge} numberOfLines={1}>
                        {item.package_title || 'Tour Package'}
                      </Text>
                    </View>
                  </View>

                  {/* Rating Badge */}
                  <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={14} color={C.gold} />
                    <Text style={styles.ratingBadgeTxt}>{item.rating}</Text>
                  </View>
                </View>

                {/* Comment Text */}
                {item.comment ? (
                  <Text style={styles.commentTxt}>"{item.comment}"</Text>
                ) : (
                  <Text style={[styles.commentTxt, { italic: true, color: C.onSurfVar }]}>
                    No written comment provided.
                  </Text>
                )}

                {/* Date */}
                <Text style={styles.dateTxt}>
                  {item.created_at ? item.created_at.split('T')[0] : 'Recently'}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
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
    color: C.onSurf,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.12)',
  },
  summaryLeft: {
    alignItems: 'center',
  },
  avgRatingText: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 44,
    color: C.darkPlum,
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  summarySubtext: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: C.onSurfVar,
  },

  sectionTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 20,
    color: C.onSurf,
    marginBottom: 16,
  },

  // Reviews List
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 123, 182, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: C.darkPlum,
  },
  userName: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 15,
    color: C.onSurf,
  },
  pkgTitleBadge: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: C.primary,
    maxWidth: 180,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  ratingBadgeTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: C.gold,
  },
  commentTxt: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: C.onSurf,
    lineHeight: 20,
    marginBottom: 12,
  },
  dateTxt: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: C.onSurfVar,
    textAlign: 'right',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: C.onSurf,
    marginTop: 16,
  },
  emptySub: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: C.onSurfVar,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});
