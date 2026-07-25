import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Dimensions, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const HISTORY_KEY = 'destin8_search_history';

const SUGGESTIONS = [
  'Hunza', 'Skardu', 'Swat', 'K2 Basecamp', 'Naran', 'Beach Getaways', 'Fairytale Meadows'
];

const DISCOVERY_TAGS = [
  { id: '1', label: 'Hunza Valley', icon: 'landscape' },
  { id: '2', label: 'K2 Base Camp', icon: 'hiking' },
  { id: '3', label: 'Skardu Adventure', icon: 'terrain' },
  { id: '4', label: 'Naran Kaghan', icon: 'forest' },
  { id: '5', label: 'Swat Valley', icon: 'park' },
  { id: '6', label: 'Beach Getaways', icon: 'beach-access' },
  { id: '7', label: 'Cultural Heritage', icon: 'museum' },
  { id: '8', label: 'Solo Expeditions', icon: 'person' },
  { id: '9', label: 'Family Tours', icon: 'family-restroom' },
];

export default function SearchDiscoveryScreen({ navigation, route }) {
  const initialQuery = route?.params?.initialQuery || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchHistory, setSearchHistory] = useState([]);
  const [hideDiscovery, setHideDiscovery] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading search history:', e);
    }
  };

  const saveToHistory = async (query) => {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    try {
      let current = [...searchHistory];
      current = current.filter(item => item.toLowerCase() !== clean.toLowerCase());
      current.unshift(clean);
      if (current.length > 10) current = current.slice(0, 10);
      setSearchHistory(current);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Error saving search history:', e);
    }
  };

  const clearHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error('Error clearing search history:', e);
    }
  };

  const executeSearch = (queryToUse) => {
    const q = queryToUse !== undefined ? queryToUse : searchQuery;
    if (!q || !q.trim()) return;
    saveToHistory(q);
    navigation.navigate('SearchResults', { query: q.trim() });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header / Search Input Bar */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color="#2c2f30" />
        </TouchableOpacity>

        <View style={styles.searchBoxOuter}>
          <MaterialIcons name="search" size={20} color="#858c8e" style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations or packages..."
            placeholderTextColor="rgba(133, 140, 142, 0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => executeSearch()}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearTextBtn}>
              <MaterialIcons name="cancel" size={18} color="#858c8e" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.searchSubmitBtn}
            onPress={() => executeSearch()}
            activeOpacity={0.85}
          >
            <Text style={styles.searchSubmitText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Quick Suggestion Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionScroll}
          contentContainerStyle={styles.suggestionContainer}
        >
          {SUGGESTIONS.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              onPress={() => executeSearch(s)}
              activeOpacity={0.8}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Search History</Text>
            {searchHistory.length > 0 && (
              <TouchableOpacity style={styles.clearAllBtn} onPress={clearHistory} activeOpacity={0.7}>
                <MaterialIcons name="delete-outline" size={16} color="#858c8e" />
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {searchHistory.length === 0 ? (
            <Text style={styles.emptyHistoryText}>No recent searches</Text>
          ) : (
            <View style={styles.chipsWrap}>
              {searchHistory.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.historyChip}
                  onPress={() => executeSearch(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.historyChipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Search Discovery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Search Discovery</Text>
            <TouchableOpacity
              style={styles.hideToggleBtn}
              onPress={() => setHideDiscovery(!hideDiscovery)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={hideDiscovery ? 'visibility-off' : 'visibility'}
                size={16}
                color="#858c8e"
              />
              <Text style={styles.hideToggleText}>{hideDiscovery ? 'Show' : 'Hide'}</Text>
            </TouchableOpacity>
          </View>

          {!hideDiscovery && (
            <View style={styles.chipsWrap}>
              {DISCOVERY_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={styles.discoveryChip}
                  onPress={() => executeSearch(tag.label)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name={tag.icon} size={15} color="#52396f" style={{ marginRight: 6 }} />
                  <Text style={styles.discoveryChipText}>{tag.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f0eef5',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  searchBoxOuter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#967BB6',
    borderRadius: 8,
    height: 42,
    paddingLeft: 4,
    paddingRight: 3,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: '#2c2f30',
    paddingHorizontal: 8,
  },
  clearTextBtn: {
    padding: 4,
    marginRight: 4,
  },
  searchSubmitBtn: {
    backgroundColor: '#52396f',
    borderRadius: 6,
    paddingHorizontal: 14,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSubmitText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#ffffff',
  },

  content: {
    paddingBottom: 40,
  },

  // Suggestion Scroll
  suggestionScroll: {
    borderBottomWidth: 1,
    borderColor: '#f5f3f8',
    paddingVertical: 10,
  },
  suggestionContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#f5f3f8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#595c5d',
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 16,
    color: '#2c2f30',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearAllText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#858c8e',
  },
  hideToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hideToggleText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#858c8e',
  },

  emptyHistoryText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#a0a5a8',
    fontStyle: 'italic',
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  historyChip: {
    backgroundColor: '#f0eef5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  historyChipText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#2c2f30',
  },

  discoveryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f6fc',
    borderWidth: 1,
    borderColor: '#ece7f4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  discoveryChipText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#3d2856',
  },
});
