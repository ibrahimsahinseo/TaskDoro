import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { AppProvider, useApp } from '../contexts/AppContext';
import { getThemeColors } from '../constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform } from 'react-native';
import ErrorBoundary from '../components/ErrorBoundary';

function AppContent() {
  const { state } = useApp();
  const c = getThemeColors(state.settings.darkTheme);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
      }
    })();
  }, []);

  return (
    <>
      <StatusBar style={state.settings.darkTheme ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="goals" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="profile" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="calendar" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="schedule" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
