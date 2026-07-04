import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ensureAnonymousSession } from '@/lib/supabase';
import { configureRevenueCat } from '@/lib/revenuecat';
import { registerForPush } from '@/lib/notifications';
import { track } from '@/lib/analytics';
import { colors } from '@/theme';

/**
 * Root layout: silently establishes an anonymous Supabase session and wires
 * RevenueCat to that user id before rendering the app (spec §1, §6). No signup
 * wall — browsing is always allowed.
 */
export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      track('app_open');
      const userId = await ensureAnonymousSession();
      if (userId) {
        await configureRevenueCat(userId);
        void registerForPush(userId); // best-effort, don't block first paint
      }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="template/[id]" options={{ presentation: 'modal', title: '' }} />
        <Stack.Screen name="upload" options={{ title: 'Choose a photo' }} />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen name="generating/[jobId]" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="result/[jobId]" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
});
