import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { ReportsProvider } from '@/context/ReportsProvider';
import { WatchThemeProvider, useAppTheme } from '@/context/ThemeProvider';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <WatchThemeProvider>
      <ThemedRoot />
    </WatchThemeProvider>
  );
}

function ThemedRoot() {
  const { colors, scheme } = useAppTheme();
  const navigationTheme = useMemo(
    () => ({
      ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.line,
        primary: colors.forest,
      },
    }),
    [colors, scheme],
  );

  return (
    <ReportsProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="dump" />
          <Stack.Screen name="water" />
          <Stack.Screen name="watch/[kind]" />
          <Stack.Screen name="province/[name]" />
          <Stack.Screen name="report/[id]" />
        </Stack>
      </ThemeProvider>
    </ReportsProvider>
  );
}
