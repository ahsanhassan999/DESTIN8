import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography, Spacing, Radius } from '../theme';

// ── Auth
import RoleSelectionScreen  from '../screens/auth/RoleSelectionScreen';
import LoginScreen          from '../screens/auth/LoginScreen';
import TravelerSignUpScreen from '../screens/auth/TravelerSignUpScreen';
import AgencySignUpScreen   from '../screens/auth/AgencySignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import SuspendedScreen      from '../screens/auth/SuspendedScreen';

// ── Traveler
import TravelerDashboardScreen from '../screens/traveler/TravelerDashboardScreen';
import PackageDetailScreen     from '../screens/traveler/PackageDetailScreen';
import WishlistScreen          from '../screens/traveler/WishlistScreen';
import TravelerProfileScreen   from '../screens/traveler/TravelerProfileScreen';
import ChatListScreen          from '../screens/traveler/ChatListScreen';
import ChatDetailScreen        from '../screens/traveler/ChatDetailScreen';
import MyTripsScreen           from '../screens/traveler/MyTripsScreen';
import PaymentReceiptsScreen   from '../screens/traveler/PaymentReceiptsScreen';

// ── Agency
import AgencyDashboardScreen from '../screens/agency/AgencyDashboardScreen';
import PostPackageScreen     from '../screens/agency/PostPackageScreen';
import MyPackagesScreen      from '../screens/agency/MyPackagesScreen';
import AgencyProfileScreen   from '../screens/agency/AgencyProfileScreen';
import BankDetailsScreen     from '../screens/agency/BankDetailsScreen';
import AgencyWalletScreen    from '../screens/agency/AgencyWalletScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const NO_HEADER = { headerShown: false };

// ─── Inline small screens ──────────────────────────────────────────────────

function AgencyPendingScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#EDE8F5', '#F5F2FA']} style={StyleSheet.absoluteFillObject} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: Spacing.lg }}>
        <Text style={{ fontSize: 64 }}>⏳</Text>
        <Text style={{ fontFamily: 'Epilogue_700Bold', fontSize: 28, color: Colors.plum, textAlign: 'center' }}>
          Application Submitted!
        </Text>
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 16, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 24 }}>
          Your agency registration is under review. We'll notify you within 24–48 hours once approved.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.replace('Login')}
          style={{ backgroundColor: Colors.plum, borderRadius: Radius.full, paddingVertical: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



// ─── Custom Tab Bar ─────────────────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation, isAgency }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 12;
  const barHeight = 64 + bottomPadding;

  const activeColor = isAgency ? '#967BB6' : '#52396F';
  const inactiveColor = '#595C5D';
  const activeBg = isAgency ? 'rgba(150, 123, 182, 0.2)' : 'rgba(82, 57, 111, 0.15)';

  return (
    <View style={[styles.customTabBar, { height: barHeight, paddingBottom: bottomPadding }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        let iconName = 'home';
        if (route.name === 'Home' || route.name === 'Dashboard') {
          iconName = 'home';
        } else if (route.name === 'Packages' || route.name === 'Post Package') {
          iconName = 'inventory';
        } else if (route.name === 'Explore') {
          iconName = 'explore';
        } else if (route.name === 'Chat') {
          iconName = 'forum';
        } else if (route.name === 'Wishlist') {
          iconName = isFocused ? 'favorite' : 'favorite-border';
        } else if (route.name === 'My Trips') {
          iconName = 'auto-awesome-motion';
        } else if (route.name === 'Profile') {
          iconName = isAgency ? 'business' : 'person-outline';
        }

        const tint = isFocused ? activeColor : inactiveColor;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              isFocused && { backgroundColor: activeBg }
            ]}
            activeOpacity={0.8}
          >
            <MaterialIcons name={iconName} size={22} color={tint} />
            <Text style={[styles.tabItemLabel, { color: tint }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Tabs Navigators ────────────────────────────────────────────────────────

function TravelerTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} isAgency={false} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Explore"
        component={TravelerDashboardScreen}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ tabBarLabel: 'Wishlist' }}
      />
      <Tab.Screen
        name="My Trips"
        component={MyTripsScreen}
        options={{ tabBarLabel: 'My Trips' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
    </Tab.Navigator>
  );
}

function AgencyTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} isAgency={true} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AgencyDashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Post Package"
        component={MyPackagesScreen}
        options={{ tabBarLabel: 'Packages' }}
      />
      <Tab.Screen
        name="Explore"
        component={TravelerDashboardScreen}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{ tabBarLabel: 'Chat' }}
      />
    </Tab.Navigator>
  );
}

// ─── Stacks ────────────────────────────────────────────────────────────────

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={NO_HEADER} initialRouteName="Login">
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="RoleSelection"  component={RoleSelectionScreen} />
      <Stack.Screen name="TravelerSignUp" component={TravelerSignUpScreen} />
      <Stack.Screen name="AgencySignUp"   component={AgencySignUpScreen} />
      <Stack.Screen name="AgencyPending"  component={AgencyPendingScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Suspended"      component={SuspendedScreen} />
    </Stack.Navigator>
  );
}

function TravelerStack() {
  return (
    <Stack.Navigator screenOptions={NO_HEADER} initialRouteName="TravelerTabs">
      <Stack.Screen name="TravelerTabs"   component={TravelerTabs} />
      <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
      <Stack.Screen name="ChatDetail"    component={ChatDetailScreen} />
      <Stack.Screen name="Profile"       component={TravelerProfileScreen} />
      <Stack.Screen name="PaymentReceipts" component={PaymentReceiptsScreen} />
    </Stack.Navigator>
  );
}

function AgencyStack() {
  return (
    <Stack.Navigator screenOptions={NO_HEADER} initialRouteName="AgencyTabs">
      <Stack.Screen name="AgencyTabs" component={AgencyTabs} />
      <Stack.Screen name="PostPackageForm" component={PostPackageScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="Profile"    component={AgencyProfileScreen} />
      <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
      <Stack.Screen name="AgencyWallet" component={AgencyWalletScreen} />
    </Stack.Navigator>
  );
}

// ─── Root Navigator ────────────────────────────────────────────────────────

export default function AppNavigator() {
  const { user, restoreSession } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lavenderLight }}>
        <ActivityIndicator size="large" color={Colors.plum} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user
        ? <AuthStack />
        : user.role === 'agency'
          ? <AgencyStack />
          : <TravelerStack />
      }
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#2C2F30',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  tabItemLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
