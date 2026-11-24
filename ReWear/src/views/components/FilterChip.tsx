import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  swatch?: string;
  count?: number;
}

/** Auswählbarer oder entfernbarer Chip. Auswahl wird mit ✓ und Farbe angezeigt. */
export function FilterChip({ label, selected, onPress, onRemove, swatch, count }: FilterChipProps) {
  const theme = useTheme();
  const removable = !!onRemove;
  const active = selected || removable;

  return (
    <Pressable
      accessibilityRole={removable ? 'button' : 'checkbox'}
      accessibilityState={removable ? undefined : { checked: !!selected }}
      accessibilityLabel={removable ? `Filter ${label} entfernen` : label}
      onPress={onRemove ?? onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? theme.primary : theme.surface,
          borderColor: active ? theme.primary : theme.border,
        },
        pressed && { opacity: 0.75 },
      ]}>
      {selected && !removable && <Icon name="check" size={13} color={theme.onPrimary} />}
      {swatch && (
        <View style={[styles.swatch, { backgroundColor: swatch, borderColor: active ? theme.onPrimary : theme.border }]} />
      )}
      <AppText variant="small" style={[styles.label, { color: active ? theme.onPrimary : theme.text }]}>
        {label}
        {count !== undefined ? ` (${count})` : ''}
      </AppText>
      {removable && <Icon name="close" size={12} color={theme.onPrimary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    paddingHorizontal: Spacing.three - 2,
    minHeight: 36,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  label: { fontWeight: '500' },
  swatch: { width: 14, height: 14, borderRadius: 7, borderWidth: 1 },
});
