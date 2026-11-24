import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';

import { Fonts } from '@/constants/theme';
import { AuthProvider } from '@/controllers/AuthController';
import { FavoritesProvider } from '@/controllers/FavoritesController';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/models/database';
import { LoadingState } from '@/views/components/LoadingState';

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Suspense fallback={<LoadingState />}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded} useSuspense>
          <AuthProvider>
            <FavoritesProvider>
              <Stack
                screenOptions={{
                  headerShadowVisible: false,
                  headerStyle: { backgroundColor: theme.background },
                  headerTintColor: theme.text,
                  headerTitleStyle: { fontFamily: Fonts.serif, fontWeight: '600' },
                  headerBackButtonDisplayMode: 'minimal',
                  contentStyle: { backgroundColor: theme.background },
                }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="article/[id]/index" options={{ title: '', headerTransparent: true }} />
                <Stack.Screen name="article/[id]/reserve" options={{ title: 'Reservieren' }} />
                <Stack.Screen name="article/[id]/edit" options={{ title: 'Artikel bearbeiten' }} />
                <Stack.Screen name="login" options={{ title: '', presentation: 'modal' }} />
                <Stack.Screen name="seller/index" options={{ title: '' }} />
                <Stack.Screen name="seller/sales" options={{ title: 'Verkaufsübersicht' }} />
              </Stack>
            </FavoritesProvider>
          </AuthProvider>
        </SQLiteProvider>
      </Suspense>
    </ThemeProvider>
  );
}
