import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenProps {
  children: ReactNode;
  edges?: Edge[];
}

/** Grundlayout eines Screens: Hintergrund, Safe Area und maximale Inhaltsbreite (Tablet/Web). */
export function Screen({ children, edges = ['top'] }: ScreenProps) {
  const theme = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center' },
  inner: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
});
