import React, { useState } from 'react';
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
  Image,
  Keyboard,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';

const C = {
  primary: '#967BB6',       // Lavender primary
  container: '#E8E1F0',     // Lavender container
  onSurf: '#2C2F30',
  onSurfVar: '#595C5D',
  surfLow: '#EFF1F2',
  background: '#F5F6F7',
  error: '#B41340',
  errBg: '#FFE4EC',
  success: '#10B981',
  successBg: '#D1FAE5',
};

const CustomSwitch = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[
        styles.switchTrack,
        value ? styles.switchTrackActive : styles.switchTrackInactive,
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          value ? styles.switchThumbActive : styles.switchThumbInactive,
        ]}
      />
    </TouchableOpacity>
  );
};

export default function PostPackageScreen({ navigation, route }) {
  // Form States
  const [destination, setDestination] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  // Duration Mode: '3' | '5' | '7' | '14' | 'Custom'
  const [durationMode, setDurationMode] = useState('5');
  const [customDuration, setCustomDuration] = useState('');

  // Included Services (multi-select)
  const [services, setServices] = useState(['Accommodation', 'Meals']); // defaults
  const [availableServices, setAvailableServices] = useState([
    { name: 'Accommodation', icon: 'hotel' },
    { name: 'Meals', icon: 'restaurant' },
    { name: 'Transport', icon: 'commute' },
    { name: 'Guide', icon: 'tour' },
    { name: 'Photography', icon: 'camera-enhance' },
  ]);
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceText, setNewServiceText] = useState('');

  // Visuals & Themes
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedTags, setSelectedTags] = useState(['Adventure']);
  const [availableTags, setAvailableTags] = useState(['Adventure', 'Luxury', 'Wellness', 'Cultural', 'Couples', 'Foodie']);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [bestSeason, setBestSeason] = useState('Autumn');

  // Day-by-Day Itinerary (default 1 day)
  const [availableTransports, setAvailableTransports] = useState(['Private 4x4 Land Cruiser', 'Domestic Flight', 'Yacht']);
  const [showAddTransport, setShowAddTransport] = useState(false);
  const [newTransportText, setNewTransportText] = useState('');
  const [days, setDays] = useState([
    {
      id: 1,
      title: 'Arrival & Greeting',
      desc: 'Meet our tour guide at the hotel and attend the briefing session.',
      accommodation: 'Boutique Glamping Resort',
      location: 'Hunza Valley',
      transport: ['Private 4x4 Land Cruiser'],
    },
  ]);

  // Financials & Policies
  const [inclusions, setInclusions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('Moderate (7 days)');
  const [depositEnabled, setDepositEnabled] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(50);

  // Group & Logistics
  const [minGroup, setMinGroup] = useState('4');
  const [maxGroup, setMaxGroup] = useState('12');
  const [startPoint, setStartPoint] = useState('');
  const [mealPlan, setMealPlan] = useState('Breakfast & Dinner');
  const [languages, setLanguages] = useState(['English', 'Urdu']);
  const [availableLanguages, setAvailableLanguages] = useState(['English', 'Urdu', 'Local dialects']);
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguageText, setNewLanguageText] = useState('');

  // Loading/Success States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const editingPackage = route.params?.package;

  React.useEffect(() => {
    if (editingPackage) {
      setDestination(editingPackage.destination || '');
      setTitle(editingPackage.title || '');
      setDescription(editingPackage.description || '');
      setPrice(String(editingPackage.price || ''));
      
      const dur = editingPackage.duration_days || 1;
      if (['3', '5', '7', '14'].includes(String(dur))) {
        setDurationMode(String(dur));
        setCustomDuration('');
      } else {
        setDurationMode('Custom');
        setCustomDuration(String(dur));
      }
      
      let parsedServices = [];
      try {
        parsedServices = typeof editingPackage.included_services === 'string' 
          ? JSON.parse(editingPackage.included_services || '[]')
          : (editingPackage.included_services || []);
      } catch (_) {}
      if (parsedServices && parsedServices.length > 0) {
        setServices(parsedServices);
      }
      
      if (editingPackage.cover_image) {
        setImageUrls([editingPackage.cover_image]);
      } else {
        setImageUrls([]);
      }
      
      let parsedItinerary = [];
      try {
        parsedItinerary = typeof editingPackage.itinerary === 'string'
          ? JSON.parse(editingPackage.itinerary || '[]')
          : (editingPackage.itinerary || []);
      } catch (_) {}
      if (parsedItinerary && parsedItinerary.length > 0) {
        setDays(parsedItinerary);
      }
      
      if (editingPackage.inclusions) setInclusions(editingPackage.inclusions);
      if (editingPackage.exclusions) setExclusions(editingPackage.exclusions);
      if (editingPackage.cancellation_policy) setCancellationPolicy(editingPackage.cancellation_policy);
      if (editingPackage.deposit_enabled !== undefined) setDepositEnabled(editingPackage.deposit_enabled);
      if (editingPackage.deposit_percentage !== undefined) setDepositPercentage(editingPackage.deposit_percentage);
      if (editingPackage.min_group) setMinGroup(String(editingPackage.min_group));
      if (editingPackage.max_group) setMaxGroup(String(editingPackage.max_group));
      if (editingPackage.start_point) setStartPoint(editingPackage.start_point);
      if (editingPackage.meal_plan) setMealPlan(editingPackage.meal_plan);
      if (editingPackage.languages) {
        try {
          const parsedLangs = typeof editingPackage.languages === 'string'
            ? JSON.parse(editingPackage.languages || '[]')
            : editingPackage.languages;
          setLanguages(parsedLangs);
        } catch (_) {}
      }
    }
  }, [editingPackage]);

  // Refs for auto-scrolling
  const scrollRef = React.useRef(null);
  const fieldRefs = React.useRef({});
  const [visibleHeight, setVisibleHeight] = useState(0);
  const activeFieldRef = React.useRef(null);
  const activeFieldHeight = React.useRef(56);

  const scrollToActiveField = () => {
    setTimeout(() => {
      if (activeFieldRef.current?.current && scrollRef.current && visibleHeight > 0) {
        activeFieldRef.current.current.measureLayout(
          scrollRef.current,
          (x, y) => {
            const scrollOffset = y - (visibleHeight - activeFieldHeight.current) / 2;
            scrollRef.current?.scrollTo({ y: Math.max(0, scrollOffset), animated: true });
          },
          () => {}
        );
      }
    }, 100);
  };

  React.useEffect(() => {
    if (visibleHeight > 0) {
      scrollToActiveField();
    }
  }, [visibleHeight]);

  const handleFocus = (key, height = 56) => {
    if (fieldRefs.current[key]) {
      activeFieldRef.current = { current: fieldRefs.current[key] };
      activeFieldHeight.current = height;
      scrollToActiveField();
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload images!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImageUrls((prev) => [...prev, ...selectedUris]);
    }
  };

  const removeImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Dynamic Custom Callbacks
  const confirmAddService = () => {
    if (newServiceText.trim()) {
      const name = newServiceText.trim();
      setAvailableServices((prev) => [...prev, { name, icon: 'star' }]); // default custom icon: star
      setServices((prev) => [...prev, name]); // auto-select
      setNewServiceText('');
      setShowAddService(false);
    }
  };

  const confirmAddTag = () => {
    if (newTagText.trim()) {
      const tag = newTagText.trim();
      setAvailableTags((prev) => [...prev, tag]);
      setSelectedTags((prev) => [...prev, tag]); // auto-select
      setNewTagText('');
      setShowAddTag(false);
    }
  };

  const confirmAddTransport = () => {
    if (newTransportText.trim()) {
      const trsp = newTransportText.trim();
      setAvailableTransports((prev) => [...prev, trsp]);
      setNewTransportText('');
      setShowAddTransport(false);
    }
  };

  const confirmAddLanguage = () => {
    if (newLanguageText.trim()) {
      const lang = newLanguageText.trim();
      setAvailableLanguages((prev) => [...prev, lang]);
      setLanguages((prev) => [...prev, lang]); // auto-select
      setNewLanguageText('');
      setShowAddLanguage(false);
    }
  };

  // Long press deletion for custom options
  const handleLongPressService = (serviceName) => {
    const defaultServices = ['Accommodation', 'Meals', 'Transport', 'Guide', 'Photography'];
    if (!defaultServices.includes(serviceName)) {
      setAvailableServices((prev) => prev.filter((s) => s.name !== serviceName));
      setServices((prev) => prev.filter((s) => s !== serviceName));
    }
  };

  const handleLongPressTag = (tag) => {
    const defaultTags = ['Adventure', 'Luxury', 'Wellness', 'Cultural', 'Couples', 'Foodie'];
    if (!defaultTags.includes(tag)) {
      setAvailableTags((prev) => prev.filter((t) => t !== tag));
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    }
  };

  const handleLongPressTransport = (trsp) => {
    const defaultTransports = ['Private 4x4 Land Cruiser', 'Domestic Flight', 'Yacht'];
    if (!defaultTransports.includes(trsp)) {
      setAvailableTransports((prev) => prev.filter((t) => t !== trsp));
      setDays((prevDays) =>
        prevDays.map((d) => ({
          ...d,
          transport: d.transport.filter((t) => t !== trsp),
        }))
      );
    }
  };

  const handleLongPressLanguage = (lang) => {
    const defaultLanguages = ['English', 'Urdu', 'Local dialects'];
    if (!defaultLanguages.includes(lang)) {
      setAvailableLanguages((prev) => prev.filter((l) => l !== lang));
      setLanguages((prev) => prev.filter((l) => l !== lang));
    }
  };

  // Draft States
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState('');
  const [draftData, setDraftData] = useState(null);

  // Check for saved draft on mount
  React.useEffect(() => {
    if (editingPackage) return;
    const checkDraft = async () => {
      try {
        const savedDraft = await AsyncStorage.getItem('destin8_package_draft');
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && (parsed.title || parsed.destination || parsed.description || (parsed.imageUrls && parsed.imageUrls.length > 0))) {
            setDraftData(parsed);
            setDraftTimestamp(parsed.timestamp || new Date().toLocaleString());
            setShowResumeModal(true);
          }
        }
      } catch (err) {
        console.log('Error reading draft:', err);
      }
    };
    checkDraft();
  }, [editingPackage]);

  const resumeDraft = () => {
    if (draftData) {
      setDestination(draftData.destination || '');
      setTitle(draftData.title || '');
      setDescription(draftData.description || '');
      setPrice(draftData.price || '');
      setDurationMode(draftData.durationMode || '5');
      setCustomDuration(draftData.customDuration || '');
      setServices(draftData.services || ['Accommodation', 'Meals']);
      setImageUrls(draftData.imageUrls || []);
      setSelectedTags(draftData.selectedTags || ['Adventure']);
      setBestSeason(draftData.bestSeason || 'Autumn');
      setDays(draftData.days || [
        {
          id: 1,
          title: 'Arrival & Greeting',
          desc: 'Meet our tour guide at the hotel and attend the briefing session.',
          accommodation: 'Boutique Glamping Resort',
          location: 'Hunza Valley',
          transport: ['Private 4x4 Land Cruiser'],
        },
      ]);
      setInclusions(draftData.inclusions || '');
      setExclusions(draftData.exclusions || '');
      setCancellationPolicy(draftData.cancellationPolicy || 'Moderate (7 days)');
      setDepositEnabled(draftData.depositEnabled || false);
      if (draftData.depositPercentage !== undefined) setDepositPercentage(draftData.depositPercentage);
      setMinGroup(draftData.minGroup || '4');
      setMaxGroup(draftData.maxGroup || '12');
      setStartPoint(draftData.startPoint || '');
      setMealPlan(draftData.mealPlan || 'Breakfast & Dinner');
      setLanguages(draftData.languages || ['English', 'Urdu']);
    }
    setShowResumeModal(false);
  };

  const discardDraft = async () => {
    try {
      await AsyncStorage.removeItem('destin8_package_draft');
    } catch (err) {
      console.log('Error clearing draft:', err);
    }
    setShowResumeModal(false);
  };

  // Auto-save useEffect with debouncer
  React.useEffect(() => {
    if (editingPackage) return;
    const saveDraft = async () => {
      if (showResumeModal) return;

      if (
        !destination &&
        !title &&
        !description &&
        !price &&
        imageUrls.length === 0 &&
        days.length === 1 &&
        !days[0].title
      ) {
        return;
      }

      try {
        const draftObj = {
          destination,
          title,
          description,
          price,
          durationMode,
          customDuration,
          services,
          imageUrls,
          selectedTags,
          bestSeason,
          days,
          inclusions,
          exclusions,
          cancellationPolicy,
          depositEnabled,
          depositPercentage,
          minGroup,
          maxGroup,
          startPoint,
          mealPlan,
          languages,
          timestamp: new Date().toLocaleString(),
        };
        await AsyncStorage.setItem('destin8_package_draft', JSON.stringify(draftObj));
      } catch (err) {
        console.log('Error saving draft:', err);
      }
    };

    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [
    destination,
    title,
    description,
    price,
    durationMode,
    customDuration,
    services,
    imageUrls,
    selectedTags,
    bestSeason,
    days,
    inclusions,
    exclusions,
    cancellationPolicy,
    depositEnabled,
    depositPercentage,
    minGroup,
    maxGroup,
    startPoint,
    mealPlan,
    languages,
    showResumeModal,
    editingPackage,
  ]);

  // Toggle Services
  const toggleService = (srv) => {
    setServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  // Toggle Itinerary Transport
  const toggleItineraryTransport = (dayId, trsp) => {
    setDays((prevDays) =>
      prevDays.map((d) => {
        if (d.id === dayId) {
          const transport = d.transport.includes(trsp)
            ? d.transport.filter((t) => t !== trsp)
            : [...d.transport, trsp];
          return { ...d, transport };
        }
        return d;
      })
    );
  };

  // Update Itinerary day values
  const updateDay = (dayId, field, val) => {
    setDays((prevDays) =>
      prevDays.map((d) => (d.id === dayId ? { ...d, [field]: val } : d))
    );
  };

  // Add Day to Itinerary
  const addDay = () => {
    const nextId = days.length > 0 ? Math.max(...days.map((d) => d.id)) + 1 : 1;
    setDays((prev) => [
      ...prev,
      {
        id: nextId,
        title: '',
        desc: '',
        accommodation: '',
        location: '',
        transport: [],
      },
    ]);
  };

  // Remove Day
  const removeDay = (dayId) => {
    if (days.length === 1) return; // Keep at least one
    setDays((prev) => prev.filter((d) => d.id !== dayId));
  };

  // Toggle Tag
  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Toggle Language
  const toggleLanguage = (lang) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  // Submit flow
  const handleAction = async (status) => {
    // Validate required fields
    if (!title.trim() || !destination.trim() || !price.trim()) {
      setSuccessMessage('Please fill in Destination, Title, and Price before submitting.');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      return;
    }

    const isPublish = status === 'Publish';

    if (isPublish && editingPackage?.is_takedown) {
      Alert.alert(
        "Action Blocked",
        `This package has been taken down by the administrator.\n\nReason: ${editingPackage.takedown_reason || 'No reason provided.'}\n\nPlease open a support ticket to resolve this.`,
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    setSuccess(false);

    const duration = durationMode === 'Custom' ? parseInt(customDuration, 10) || 1 : parseInt(durationMode, 10);

    try {
      if (editingPackage) {
        await api.updatePackage(editingPackage.id, {
          title: title.trim(),
          destination: destination.trim(),
          price: price.trim(),
          duration,
          description: description.trim(),
          includedServices: services,
          imageUrls,
          departureDate: null,
          is_active: isPublish,
          itinerary: days,
          deposit_percentage: depositPercentage,
        });
      } else {
        await api.createPackage({
          title: title.trim(),
          destination: destination.trim(),
          price: price.trim(),
          duration,
          description: description.trim(),
          includedServices: services,
          imageUrls,
          departureDate: null,
          is_active: isPublish,
          itinerary: days,
          deposit_percentage: depositPercentage,
        });
      }

      // Clear draft from local storage
      try {
        await AsyncStorage.removeItem('destin8_package_draft');
      } catch (_) {}

      setLoading(false);
      setSuccessMessage(
        editingPackage
          ? (isPublish ? 'Package updated and published!' : 'Package updated successfully!')
          : (isPublish ? 'Package published successfully!' : 'Package saved as draft!')
      );
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigation.goBack();
      }, 1800);
    } catch (err) {
      setLoading(false);
      const errMsg = err?.message || 'Failed to submit package. Please try again.';
      setSuccessMessage(errMsg);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title={editingPackage ? "Edit Package" : "Post Package"} showBack navigation={navigation} />

      {/* Asymmetrical Background Elements */}
      <View style={styles.bgOrb1} pointerEvents="none" />
      <View style={styles.bgOrb2} pointerEvents="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onLayout={(e) => {
            setVisibleHeight(e.nativeEvent.layout.height);
          }}
        >
          {/* Success Box */}
          {success && (
            <View style={styles.successBox}>
              <MaterialIcons name="check-circle" size={20} color={C.success} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Section 1: Core Package Details */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="business-center" size={20} color={C.primary} />
              <Text style={styles.sectionTitle}>1. Core Package Details</Text>
            </View>

            <View style={styles.formGroup}>
              {/* Destination */}
              <View style={styles.field}>
                <Text style={styles.label}>Destination</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="location-on" size={20} color="rgba(89, 92, 93, 0.4)" style={styles.inputIcon} />
                  <TextInput
                    ref={el => { fieldRefs.current['destination'] = el; }}
                    style={styles.input}
                    placeholder="Where is this dream destination?"
                    placeholderTextColor="rgba(89, 92, 93, 0.4)"
                    value={destination}
                    onChangeText={setDestination}
                    onFocus={() => handleFocus('destination', 56)}
                    onSubmitEditing={() => fieldRefs.current['title']?.focus()}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Title */}
              <View style={styles.field}>
                <Text style={styles.label}>Package Title</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="sell" size={20} color="rgba(89, 92, 93, 0.4)" style={styles.inputIcon} />
                  <TextInput
                    ref={el => { fieldRefs.current['title'] = el; }}
                    style={styles.input}
                    placeholder="e.g. Northern Lights Luxury Retreat"
                    placeholderTextColor="rgba(89, 92, 93, 0.4)"
                    value={title}
                    onChangeText={setTitle}
                    onFocus={() => handleFocus('title', 56)}
                    onSubmitEditing={() => fieldRefs.current['description']?.focus()}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Description */}
              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  ref={el => { fieldRefs.current['description'] = el; }}
                  style={styles.textArea}
                  placeholder="Tell travelers what makes this package special..."
                  placeholderTextColor="rgba(89, 92, 93, 0.4)"
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  onFocus={() => handleFocus('description', 100)}
                  onSubmitEditing={() => fieldRefs.current['price']?.focus()}
                  returnKeyType="next"
                  blurOnSubmit={true}
                />
              </View>

              {/* Price & Duration Row */}
              <View style={styles.row}>
                {/* Price */}
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Price (PKR)</Text>
                  <View style={styles.inputWrap}>
                    <MaterialIcons name="payments" size={20} color="rgba(89, 92, 93, 0.4)" style={styles.inputIcon} />
                    <TextInput
                      ref={el => { fieldRefs.current['price'] = el; }}
                      style={styles.input}
                      placeholder="0.00"
                      placeholderTextColor="rgba(89, 92, 93, 0.4)"
                      keyboardType="numeric"
                      value={price}
                      onChangeText={setPrice}
                      onFocus={() => handleFocus('price', 56)}
                      onSubmitEditing={() => {
                        if (durationMode === 'Custom') {
                          fieldRefs.current['customDuration']?.focus();
                        } else {
                          fieldRefs.current['day_1_title']?.focus();
                        }
                      }}
                      returnKeyType="next"
                    />
                  </View>
                </View>
              </View>

              {/* Duration Buttons */}
              <View style={styles.field}>
                <Text style={styles.label}>Duration (Days)</Text>
                <View style={styles.btnRow}>
                  {['3', '5', '7', '14', 'Custom'].map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.chipBtn,
                        durationMode === mode ? styles.chipBtnActive : styles.chipBtnInactive,
                      ]}
                      onPress={() => setDurationMode(mode)}
                    >
                      <Text
                        style={[
                          styles.chipBtnTxt,
                          durationMode === mode ? styles.chipBtnTxtActive : styles.chipBtnTxtInactive,
                        ]}
                      >
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {durationMode === 'Custom' && (
                  <View style={[styles.inputWrap, { marginTop: 12 }]}>
                    <MaterialIcons name="schedule" size={20} color="rgba(89, 92, 93, 0.4)" style={styles.inputIcon} />
                    <TextInput
                      ref={el => { fieldRefs.current['customDuration'] = el; }}
                      style={styles.input}
                      placeholder="Enter custom days (e.g. 10)"
                      placeholderTextColor="rgba(89, 92, 93, 0.4)"
                      keyboardType="numeric"
                      value={customDuration}
                      onChangeText={setCustomDuration}
                      onFocus={() => handleFocus('customDuration', 56)}
                      onSubmitEditing={() => fieldRefs.current['day_1_title']?.focus()}
                      returnKeyType="next"
                    />
                  </View>
                )}
              </View>

              {/* Included Services */}
              <View style={styles.field}>
                <Text style={styles.label}>Included Services</Text>
                <View style={styles.btnRow}>
                  {availableServices.map((srv) => {
                    const isSelected = services.includes(srv.name);
                    return (
                      <TouchableOpacity
                        key={srv.name}
                        style={[
                          styles.chipIconBtn,
                          isSelected ? styles.chipBtnActive : styles.chipBtnInactiveOutline,
                        ]}
                        onPress={() => toggleService(srv.name)}
                        onLongPress={() => handleLongPressService(srv.name)}
                        delayLongPress={500}
                      >
                        <MaterialIcons
                          name={srv.icon}
                          size={18}
                          color={isSelected ? '#ffffff' : C.onSurfVar}
                        />
                        <Text
                          style={[
                            styles.chipBtnTxt,
                            isSelected ? styles.chipBtnTxtActive : styles.chipBtnTxtInactive,
                          ]}
                        >
                          {srv.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {showAddService ? (
                    <View style={styles.inlineAddRow}>
                      <TextInput
                        ref={el => { fieldRefs.current['add_service'] = el; }}
                        style={styles.inlineInput}
                        placeholder="Service..."
                        placeholderTextColor="rgba(89, 92, 93, 0.4)"
                        value={newServiceText}
                        onChangeText={setNewServiceText}
                        autoFocus
                        onFocus={() => handleFocus('add_service', 40)}
                        onSubmitEditing={confirmAddService}
                        returnKeyType="done"
                      />
                      <TouchableOpacity style={styles.inlineConfirmBtn} onPress={confirmAddService}>
                        <MaterialIcons name="check" size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.inlineCancelBtn} onPress={() => setShowAddService(false)}>
                        <MaterialIcons name="close" size={16} color={C.onSurfVar} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addOutlineChip}
                      onPress={() => setShowAddService(true)}
                    >
                      <MaterialIcons name="add" size={18} color={C.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Section 2: Visuals & Branding */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="image" size={20} color={C.primary} />
              <Text style={styles.sectionTitle}>2. Visuals & Branding (Core Appeal)</Text>
            </View>

            <View style={styles.formGroup}>
              {/* Cover & Gallery Images Upload */}
              <View style={styles.field}>
                <Text style={styles.label}>Cover & Gallery Images</Text>
                {imageUrls.length > 0 ? (
                  <View style={{ gap: 16 }}>
                    {/* Primary Cover Image Preview */}
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: imageUrls[0] }} style={styles.previewImage} resizeMode="cover" />
                      <View style={styles.primaryCoverBadge}>
                        <Text style={styles.primaryCoverBadgeText}>PRIMARY COVER</Text>
                      </View>
                    </View>

                    {/* Gallery List Scroller */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.galleryScroller}
                    >
                      {imageUrls.map((uri, idx) => (
                        <View key={idx} style={styles.galleryCard}>
                          <Image source={{ uri }} style={styles.galleryImage} resizeMode="cover" />
                          <TouchableOpacity
                            style={styles.galleryDeleteBadge}
                            onPress={() => removeImage(idx)}
                            activeOpacity={0.7}
                          >
                            <MaterialIcons name="close" size={14} color="#ffffff" />
                          </TouchableOpacity>
                          {idx === 0 && (
                            <View style={styles.galleryCoverIndicator}>
                              <Text style={styles.galleryCoverIndicatorTxt}>Cover</Text>
                            </View>
                          )}
                        </View>
                      ))}

                      {/* Add more button chip */}
                      <TouchableOpacity
                        style={styles.galleryAddCard}
                        onPress={pickImage}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="add-a-photo" size={24} color={C.primary} />
                        <Text style={styles.galleryAddCardTxt}>Add Photo</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.previewContainer}
                    onPress={pickImage}
                    activeOpacity={0.8}
                  >
                    <View style={styles.placeholderContainer}>
                      <MaterialIcons name="add-a-photo" size={40} color={C.primary} style={{ marginBottom: 8 }} />
                      <Text style={styles.placeholderText}>Upload Package Images</Text>
                      <Text style={styles.placeholderSubtext}>Select one or more photos (16:9 recommended)</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* Theme Tags */}
              <View style={styles.field}>
                <Text style={styles.label}>Category/Theme Tags</Text>
                <View style={styles.btnRow}>
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.chipBtn,
                          isSelected ? styles.chipBtnActive : styles.chipBtnInactiveOutline,
                        ]}
                        onPress={() => toggleTag(tag)}
                        onLongPress={() => handleLongPressTag(tag)}
                        delayLongPress={500}
                      >
                        <Text
                          style={[
                            styles.chipBtnTxt,
                            isSelected ? styles.chipBtnTxtActive : styles.chipBtnTxtInactive,
                          ]}
                        >
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {showAddTag ? (
                    <View style={styles.inlineAddRow}>
                      <TextInput
                        ref={el => { fieldRefs.current['add_tag'] = el; }}
                        style={styles.inlineInput}
                        placeholder="Tag..."
                        placeholderTextColor="rgba(89, 92, 93, 0.4)"
                        value={newTagText}
                        onChangeText={setNewTagText}
                        autoFocus
                        onFocus={() => handleFocus('add_tag', 40)}
                        onSubmitEditing={confirmAddTag}
                        returnKeyType="done"
                      />
                      <TouchableOpacity style={styles.inlineConfirmBtn} onPress={confirmAddTag}>
                        <MaterialIcons name="check" size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.inlineCancelBtn} onPress={() => setShowAddTag(false)}>
                        <MaterialIcons name="close" size={16} color={C.onSurfVar} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addOutlineChip}
                      onPress={() => setShowAddTag(true)}
                    >
                      <MaterialIcons name="add" size={18} color={C.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Best Season */}
              <View style={styles.field}>
                <Text style={styles.label}>Best Season to Visit</Text>
                <View style={styles.btnRow}>
                  {['Spring', 'Summer', 'Autumn', 'Winter', 'Year-round'].map((season) => (
                    <TouchableOpacity
                      key={season}
                      style={[
                        styles.chipBtn,
                        bestSeason === season ? styles.chipBtnActive : styles.chipBtnInactiveOutline,
                      ]}
                      onPress={() => setBestSeason(season)}
                    >
                      <Text
                        style={[
                          styles.chipBtnTxt,
                          bestSeason === season ? styles.chipBtnTxtActive : styles.chipBtnTxtInactive,
                        ]}
                      >
                        {season}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Section 3: Structured Day-by-Day Itinerary */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="map" size={20} color={C.primary} />
              <Text style={styles.sectionTitle}>3. Structured Day-by-Day Itinerary</Text>
            </View>

            <View style={styles.formGroup}>
              {days.map((day, idx) => (
                <View key={day.id} style={styles.dayBox}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayNumTitle}>Day {idx + 1}</Text>
                    {days.length > 1 && (
                      <TouchableOpacity onPress={() => removeDay(day.id)} style={styles.removeDayBtn}>
                        <MaterialIcons name="delete" size={18} color={C.error} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    {/* Day Title */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Day Activity Title</Text>
                      <TextInput
                        ref={el => { fieldRefs.current[`day_${day.id}_title`] = el; }}
                        style={styles.itineraryInput}
                        placeholder="e.g. Arrival & Riverside Sunset Glamping"
                        placeholderTextColor="rgba(89, 92, 93, 0.4)"
                        value={day.title}
                        onChangeText={(v) => updateDay(day.id, 'title', v)}
                        onFocus={() => handleFocus(`day_${day.id}_title`, 48)}
                        onSubmitEditing={() => fieldRefs.current[`day_${day.id}_desc`]?.focus()}
                        returnKeyType="next"
                      />
                    </View>

                    {/* Day Desc */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Day Activity Description</Text>
                      <TextInput
                        ref={el => { fieldRefs.current[`day_${day.id}_desc`] = el; }}
                        style={styles.itineraryTextArea}
                        placeholder="Describe activities for this day..."
                        placeholderTextColor="rgba(89, 92, 93, 0.4)"
                        multiline
                        numberOfLines={3}
                        value={day.desc}
                        onChangeText={(v) => updateDay(day.id, 'desc', v)}
                        onFocus={() => handleFocus(`day_${day.id}_desc`, 70)}
                        onSubmitEditing={() => fieldRefs.current[`day_${day.id}_accommodation`]?.focus()}
                        returnKeyType="next"
                        blurOnSubmit={true}
                      />
                    </View>

                    {/* Stay */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Daily Accommodation</Text>
                      <TextInput
                        ref={el => { fieldRefs.current[`day_${day.id}_accommodation`] = el; }}
                        style={styles.itineraryInput}
                        placeholder="e.g. Luxus Grand Hotel / Boutique Glamping"
                        placeholderTextColor="rgba(89, 92, 93, 0.4)"
                        value={day.accommodation}
                        onChangeText={(v) => updateDay(day.id, 'accommodation', v)}
                        onFocus={() => handleFocus(`day_${day.id}_accommodation`, 48)}
                        onSubmitEditing={() => fieldRefs.current[`day_${day.id}_location`]?.focus()}
                        returnKeyType="next"
                      />
                    </View>

                    {/* Stay Location */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Accommodation Location</Text>
                      <TextInput
                        ref={el => { fieldRefs.current[`day_${day.id}_location`] = el; }}
                        style={styles.itineraryInput}
                        placeholder="e.g. Karimabad, Hunza Valley"
                        placeholderTextColor="rgba(89, 92, 93, 0.4)"
                        value={day.location || ''}
                        onChangeText={(v) => updateDay(day.id, 'location', v)}
                        onFocus={() => handleFocus(`day_${day.id}_location`, 48)}
                        onSubmitEditing={() => {
                          const nextDay = days[idx + 1];
                          if (nextDay) {
                            fieldRefs.current[`day_${nextDay.id}_title`]?.focus();
                          } else {
                            fieldRefs.current['inclusions']?.focus();
                          }
                        }}
                        returnKeyType="next"
                      />
                    </View>

                    {/* Daily Transport */}
                    <View style={styles.field}>
                      <Text style={styles.label}>Daily Transport Mode</Text>
                      <View style={styles.btnRow}>
                        {availableTransports.map((trsp) => {
                          const isSelected = day.transport.includes(trsp);
                          return (
                            <TouchableOpacity
                              key={trsp}
                              style={[
                                styles.chipBtn,
                                isSelected ? styles.chipBtnActive : styles.chipBtnInactiveOutline,
                              ]}
                              onPress={() => toggleItineraryTransport(day.id, trsp)}
                              onLongPress={() => handleLongPressTransport(trsp)}
                              delayLongPress={500}
                            >
                              <Text
                                style={[
                                  styles.chipBtnTxt,
                                  isSelected ? styles.chipBtnTxtActive : styles.chipBtnTxtInactive,
                                ]}
                              >
                                {trsp}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}

                        {showAddTransport ? (
                          <View style={styles.inlineAddRow}>
                            <TextInput
                              ref={el => { fieldRefs.current[`add_transport_${day.id}`] = el; }}
                              style={styles.inlineInput}
                              placeholder="Transport..."
                              placeholderTextColor="rgba(89, 92, 93, 0.4)"
                              value={newTransportText}
                              onChangeText={setNewTransportText}
                              autoFocus
                              onFocus={() => handleFocus(`add_transport_${day.id}`, 40)}
                              onSubmitEditing={confirmAddTransport}
                              returnKeyType="done"
                            />
                            <TouchableOpacity style={styles.inlineConfirmBtn} onPress={confirmAddTransport}>
                              <MaterialIcons name="check" size={16} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.inlineCancelBtn} onPress={() => setShowAddTransport(false)}>
                              <MaterialIcons name="close" size={16} color={C.onSurfVar} />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.addOutlineChip}
                            onPress={() => setShowAddTransport(true)}
                          >
                            <MaterialIcons name="add" size={18} color={C.primary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={addDay} style={styles.addDayBtn} activeOpacity={0.8}>
                <MaterialIcons name="add" size={18} color={C.primary} />
                <Text style={styles.addDayBtnTxt}>Add Another Day</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 4: Financials & Policies */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="policy" size={20} color={C.primary} />
              <Text style={styles.sectionTitle}>4. Financials & Policies (Building Trust)</Text>
            </View>

            <View style={styles.formGroup}>
              {/* Inclusions */}
              <View style={styles.field}>
                <Text style={styles.label}>Price Inclusions</Text>
                <TextInput
                  ref={el => { fieldRefs.current['inclusions'] = el; }}
                  style={styles.textArea}
                  placeholder="What is covered in this package? (e.g. Standard entry tickets, All museum entry, Private guide fee)"
                  placeholderTextColor="rgba(89, 92, 93, 0.4)"
                  multiline
                  numberOfLines={3}
                  value={inclusions}
                  onChangeText={setInclusions}
                  onFocus={() => handleFocus('inclusions', 100)}
                  onSubmitEditing={() => fieldRefs.current['exclusions']?.focus()}
                  returnKeyType="next"
                  blurOnSubmit={true}
                />
              </View>

              {/* Exclusions */}
              <View style={styles.field}>
                <Text style={styles.label}>Price Exclusions</Text>
                <TextInput
                  ref={el => { fieldRefs.current['exclusions'] = el; }}
                  style={styles.textArea}
                  placeholder="What is NOT covered? (e.g. Airfare, Tips, Personal shopping, Travel insurance)"
                  placeholderTextColor="rgba(89, 92, 93, 0.4)"
                  multiline
                  numberOfLines={3}
                  value={exclusions}
                  onChangeText={setExclusions}
                  onFocus={() => handleFocus('exclusions', 100)}
                  onSubmitEditing={() => fieldRefs.current['minGroup']?.focus()}
                  returnKeyType="next"
                  blurOnSubmit={true}
                />
              </View>

              {/* Cancellation Policy */}
              <View style={styles.field}>
                <Text style={styles.label}>Cancellation Policy</Text>
                <View style={styles.btnRow}>
                  {['Super Flexible (24h)', 'Moderate (7 days)', 'Strict (Non-refundable)'].map((pol) => (
                    <TouchableOpacity
                      key={pol}
                      style={[
                        styles.chipBtn,
                        cancellationPolicy === pol ? styles.chipBtnActive : styles.chipBtnInactiveOutline,
                      ]}
                      onPress={() => setCancellationPolicy(pol)}
                    >
                      <Text
                        style={[
                          styles.chipBtnTxt,
                          cancellationPolicy === pol ? styles.chipBtnTxtActive : styles.chipBtnTxtInactive,
                        ]}
                      >
                        {pol}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Advance Deposit Configurator */}
              <View style={styles.field}>
                <Text style={styles.label}>Advance Deposit Required (%)</Text>
                <View style={styles.btnRow}>
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pct) => (
                    <TouchableOpacity
                      key={pct}
                      style={[
                        styles.chipBtn,
                        depositPercentage === pct ? styles.chipBtnActive : styles.chipBtnInactive,
                        { marginHorizontal: 2, marginVertical: 4, minWidth: 42 }
                      ]}
                      onPress={() => setDepositPercentage(pct)}
                    >
                      <Text
                        style={[
                          styles.chipBtnTxt,
                          depositPercentage === pct ? styles.chipBtnTxtActive : styles.chipBtnTxtInactive,
                          { fontSize: 11 }
                        ]}
                      >
                        {pct}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Dynamic Billing Breakdown */}
              {price.trim() !== '' && !isNaN(parseFloat(price)) && (
                <View style={styles.breakdownCard}>
                  <Text style={styles.breakdownTitle}>Booking Payment Breakdown</Text>
                  
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Total Package Price</Text>
                    <Text style={styles.breakdownVal}>{parseFloat(price).toLocaleString()} PKR</Text>
                  </View>
                  
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Deposit Required ({depositPercentage}%)</Text>
                    <Text style={styles.breakdownVal}>
                      {(parseFloat(price) * (depositPercentage / 100)).toLocaleString()} PKR
                    </Text>
                  </View>

                  <View style={styles.breakdownDivider} />

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Platform Fee (10% of Deposit)</Text>
                    <Text style={styles.breakdownVal}>
                      {(parseFloat(price) * (depositPercentage / 100) * 0.1).toLocaleString()} PKR
                    </Text>
                  </View>

                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Net Payout to Agency</Text>
                    <Text style={[styles.breakdownVal, { color: C.success, fontWeight: '700' }]}>
                      {(parseFloat(price) * (depositPercentage / 100) * 0.9).toLocaleString()} PKR
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Section 5: Group & Logistics Detail */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="settings" size={20} color={C.primary} />
              <Text style={styles.sectionTitle}>5. Group & Logistics Detail</Text>
            </View>

            <View style={styles.formGroup}>
              {/* Group Size Row */}
              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Min Group Size</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      ref={el => { fieldRefs.current['minGroup'] = el; }}
                      style={styles.input}
                      placeholder="e.g. 4"
                      placeholderTextColor="rgba(89, 92, 93, 0.4)"
                      keyboardType="numeric"
                      value={minGroup}
                      onChangeText={setMinGroup}
                      onFocus={() => handleFocus('minGroup', 56)}
                      onSubmitEditing={() => fieldRefs.current['maxGroup']?.focus()}
                      returnKeyType="next"
                    />
                  </View>
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Max Group Size</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      ref={el => { fieldRefs.current['maxGroup'] = el; }}
                      style={styles.input}
                      placeholder="e.g. 12"
                      placeholderTextColor="rgba(89, 92, 93, 0.4)"
                      keyboardType="numeric"
                      value={maxGroup}
                      onChangeText={setMaxGroup}
                      onFocus={() => handleFocus('maxGroup', 56)}
                      onSubmitEditing={() => fieldRefs.current['startPoint']?.focus()}
                      returnKeyType="next"
                    />
                  </View>
                </View>
              </View>

              {/* Departure City */}
              <View style={styles.field}>
                <Text style={styles.label}>Departure City / Start Point</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="flight-takeoff" size={20} color="rgba(89, 92, 93, 0.4)" style={styles.inputIcon} />
                  <TextInput
                    ref={el => { fieldRefs.current['startPoint'] = el; }}
                    style={styles.input}
                    placeholder="e.g. Departing from Islamabad / Lahore"
                    placeholderTextColor="rgba(89, 92, 93, 0.4)"
                    value={startPoint}
                    onChangeText={setStartPoint}
                    onFocus={() => handleFocus('startPoint', 56)}
                    onSubmitEditing={() => Keyboard.dismiss()}
                    returnKeyType="done"
                  />
                </View>
              </View>

              {/* Meal Plan */}
              <View style={styles.field}>
                <Text style={styles.label}>Meal Plans Included</Text>
                <View style={styles.btnRow}>
                  {['All-Inclusive', 'Breakfast & Dinner', 'Breakfast Only'].map((mp) => (
                    <TouchableOpacity
                      key={mp}
                      style={[
                        styles.chipBtn,
                        mealPlan === mp ? styles.chipBtnActive : styles.chipBtnInactiveOutline,
                      ]}
                      onPress={() => setMealPlan(mp)}
                    >
                      <Text
                        style={[
                          styles.chipBtnTxt,
                          mealPlan === mp ? styles.chipBtnTxtActive : styles.chipBtnTxtInactive,
                        ]}
                      >
                        {mp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Languages */}
              <View style={styles.field}>
                <Text style={styles.label}>Languages Spoken by Guide</Text>
                <View style={styles.btnRow}>
                  {availableLanguages.map((lang) => {
                    const isSelected = languages.includes(lang);
                    return (
                      <TouchableOpacity
                        key={lang}
                        style={[
                          styles.chipBtn,
                          isSelected ? styles.chipBtnActive : styles.chipBtnInactiveOutline,
                        ]}
                        onPress={() => toggleLanguage(lang)}
                        onLongPress={() => handleLongPressLanguage(lang)}
                        delayLongPress={500}
                      >
                        <Text
                          style={[
                            styles.chipBtnTxt,
                            isSelected ? styles.chipBtnTxtActive : styles.chipBtnTxtInactive,
                          ]}
                        >
                          {lang}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {showAddLanguage ? (
                    <View style={styles.inlineAddRow}>
                      <TextInput
                        ref={el => { fieldRefs.current['add_language'] = el; }}
                        style={styles.inlineInput}
                        placeholder="Language..."
                        placeholderTextColor="rgba(89, 92, 93, 0.4)"
                        value={newLanguageText}
                        onChangeText={setNewLanguageText}
                        autoFocus
                        onFocus={() => handleFocus('add_language', 40)}
                        onSubmitEditing={confirmAddLanguage}
                        returnKeyType="done"
                      />
                      <TouchableOpacity style={styles.inlineConfirmBtn} onPress={confirmAddLanguage}>
                        <MaterialIcons name="check" size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.inlineCancelBtn} onPress={() => setShowAddLanguage(false)}>
                        <MaterialIcons name="close" size={16} color={C.onSurfVar} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addOutlineChip}
                      onPress={() => setShowAddLanguage(true)}
                    >
                      <MaterialIcons name="add" size={18} color={C.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Submit Actions */}
          <View style={styles.actionsContainer}>
            {loading ? (
              <ActivityIndicator color={C.primary} size="large" style={{ marginVertical: 12 }} />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => handleAction('Publish')}
                  activeOpacity={0.88}
                  style={styles.publishBtn}
                >
                  <Text style={styles.publishBtnTxt}>Publish Package</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleAction('Draft')}
                  activeOpacity={0.8}
                  style={styles.draftBtn}
                >
                  <Text style={styles.draftBtnTxt}>Save as Draft</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footnote */}
          <View style={styles.footnote}>
            <Text style={styles.footnoteTxt}>© DESTIN8 LUXURY TRAVEL. ALL RIGHTS RESERVED. 2024.</Text>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Draft Resume Modal overlay */}
      {showResumeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="restore" size={24} color={C.primary} />
              <Text style={styles.modalTitle}>Resume Draft?</Text>
            </View>
            <Text style={styles.modalDesc}>
              An unsaved draft for this package from <Text style={{ fontFamily: 'Manrope_700Bold', color: C.onSurf }}>{draftTimestamp}</Text> was found. Would you like to resume editing?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalResumeBtn}
                onPress={resumeDraft}
                activeOpacity={0.85}
              >
                <Text style={styles.modalResumeBtnTxt}>Resume Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDiscardBtn}
                onPress={discardDraft}
                activeOpacity={0.7}
              >
                <Text style={styles.modalDiscardBtnTxt}>Start Fresh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 28,
  },

  // Background blur elements
  bgOrb1: {
    position: 'absolute',
    top: 100,
    left: -64,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#E8E1F0',
    opacity: 0.2,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: 120,
    right: -64,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#cecdff',
    opacity: 0.3,
  },

  // Success Notification
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.successBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  successText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: C.success,
  },

  // Section card layout
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.04)',
    gap: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 47, 48, 0.06)',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: C.onSurf,
  },

  formGroup: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    color: C.onSurfVar,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surfLow,
    borderRadius: 32,
    height: 56,
    paddingHorizontal: 20,
  },
  inputIcon: {
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  input: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: C.onSurf,
    flex: 1,
    padding: 0,
    height: '100%',
    backgroundColor: 'transparent',
  },
  textArea: {
    backgroundColor: C.surfLow,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    fontFamily: 'Manrope_500Medium',
    fontSize: 15,
    color: C.onSurf,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },

  // Chip buttons
  btnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 4,
  },
  chipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBtnActive: {
    backgroundColor: C.primary,
  },
  chipBtnInactive: {
    backgroundColor: C.surfLow,
  },
  chipBtnInactiveOutline: {
    borderWidth: 1,
    borderColor: 'rgba(171, 173, 174, 0.4)',
    backgroundColor: 'transparent',
  },
  chipBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
  },
  chipBtnTxtActive: {
    color: '#ffffff',
  },
  chipBtnTxtInactive: {
    color: C.onSurfVar,
  },

  // Icon chips
  chipIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },

  // Image preview
  previewContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    backgroundColor: C.surfLow,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(171, 173, 174, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  placeholderText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: C.onSurfVar,
    marginTop: 8,
  },
  placeholderSubtext: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: 'rgba(89, 92, 93, 0.5)',
    marginTop: 4,
  },
  previewActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#967BB6',
    borderRadius: 20,
    flex: 1,
    height: 44,
  },
  previewBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#967BB6',
  },
  primaryCoverBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(150, 123, 182, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  primaryCoverBadgeText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 9,
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  galleryScroller: {
    gap: 12,
    paddingRight: 16,
  },
  galleryCard: {
    width: 120,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EFF1F2',
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryDeleteBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(180, 19, 64, 0.85)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  galleryCoverIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(44, 47, 48, 0.75)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  galleryCoverIndicatorTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 8,
    color: '#ffffff',
  },
  galleryAddCard: {
    width: 120,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#967BB6',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  galleryAddCardTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: '#967BB6',
  },

  // Day Box Itinerary
  dayBox: {
    borderWidth: 1,
    borderColor: 'rgba(44, 47, 48, 0.08)',
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 47, 48, 0.04)',
    paddingBottom: 12,
    marginBottom: 16,
  },
  dayNumTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 16,
    color: C.primary,
  },
  removeDayBtn: {
    padding: 4,
  },
  itineraryInput: {
    backgroundColor: C.surfLow,
    borderRadius: 20,
    height: 48,
    paddingHorizontal: 16,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: C.onSurf,
  },
  itineraryTextArea: {
    backgroundColor: C.surfLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: C.onSurf,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  addDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.primary,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
  },
  addDayBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: C.primary,
  },

  // Toggle field
  toggleField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(44, 47, 48, 0.06)',
    paddingTop: 16,
    marginTop: 8,
  },
  toggleTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: C.onSurf,
  },
  toggleDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: C.onSurfVar,
    lineHeight: 16,
  },

  // Submit Actions
  actionsContainer: {
    gap: 16,
    marginTop: 12,
  },
  publishBtn: {
    backgroundColor: C.primary,
    borderRadius: 32,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  publishBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#ffffff',
  },
  draftBtn: {
    borderWidth: 1.5,
    borderColor: C.primary,
    backgroundColor: 'transparent',
    borderRadius: 32,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: C.primary,
  },

  // Footnote Disclaimer
  footnote: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(44, 47, 48, 0.06)',
    paddingTop: 24,
    marginTop: 16,
  },
  footnoteTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    color: 'rgba(89, 92, 93, 0.4)',
    letterSpacing: 1,
    textAlign: 'center',
  },

  // Switch elements
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: '#967BB6',
  },
  switchTrackInactive: {
    backgroundColor: '#E1E3E4',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    alignSelf: 'flex-start',
  },
  addOutlineChip: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#967BB6',
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF1F2',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  inlineInput: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: '#2C2F30',
    width: 100,
    padding: 0,
  },
  inlineConfirmBtn: {
    backgroundColor: '#967BB6',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineCancelBtn: {
    padding: 2,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 47, 48, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    gap: 16,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 18,
    color: '#2C2F30',
  },
  modalDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#595C5D',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalResumeBtn: {
    backgroundColor: '#967BB6',
    borderRadius: 20,
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalResumeBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#ffffff',
  },
  modalDiscardBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(171, 173, 174, 0.4)',
    borderRadius: 20,
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDiscardBtnTxt: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#595C5D',
  },
  breakdownCard: {
    backgroundColor: '#EFF1F2',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(150, 123, 182, 0.2)',
  },
  breakdownTitle: {
    fontFamily: 'Epilogue_700Bold',
    fontSize: 14,
    color: '#2C2F30',
    marginBottom: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#595C5D',
  },
  breakdownVal: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: '#2C2F30',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(171, 173, 174, 0.2)',
    marginVertical: 4,
  },
});
