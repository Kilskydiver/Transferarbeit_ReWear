import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { colorHex, labelOf } from '@/models/catalog';
import type { ColorKey } from '@/models/types';

import { AppText } from './AppText';

/** Farbpunkt mit Namen – die Information hängt nie nur an der Farbe. */
export function ColorChip({ color }: { color: ColorKey }) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessibilityLabel={`Farbe: ${labelOf.color(color)}`}>
      <View style={[styles.dot, { backgroundColor: colorHex(color), borderColor: theme.border }]} />
      <AppText variant="body">{labelOf.color(color)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1 },
});
