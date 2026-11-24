import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useAuth } from '@/controllers/AuthController';
import { useTheme } from '@/hooks/use-theme';
import { Icon, type IconName } from '@/views/components/Icon';

function tabIcon(name: IconName) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return <Icon name={name} size={22} color={typeof color === 'string' ? color : undefined} />;
  };
}

export default function TabLayout() {
  const theme = useTheme();
  const { seller } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabelStyle: { fontFamily: Fonts.sans, fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="search" options={{ title: 'Suche', tabBarIcon: tabIcon('search') }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoriten', tabBarIcon: tabIcon('heart') }} />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Hinzufügen',
          tabBarIcon: tabIcon('add'),
          // Nur Bedienung – der eigentliche Schutz liegt im Model (requireSeller).
          href: seller ? undefined : null,
        }}
      />
    </Tabs>
  );
}
