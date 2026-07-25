import { useEffect } from 'react';
import { View, ActivityIndicator, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Epilogue_400Regular, Epilogue_600SemiBold, Epilogue_700Bold, Epilogue_800ExtraBold, Epilogue_900Black } from '@expo-google-fonts/epilogue';
import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
  'ImagePicker.MediaTypeOptions',
]);

export default function App() {
  const [fontsLoaded] = useFonts({
    Epilogue_400Regular,
    Epilogue_600SemiBold,
    Epilogue_700Bold,
    Epilogue_800ExtraBold,
    Epilogue_900Black,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDE8F5' }}>
        <ActivityIndicator size="large" color="#52396F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
