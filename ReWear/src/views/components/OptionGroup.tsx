import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { AppText } from './AppText';
import { FilterChip } from './FilterChip';

interface Option<K extends string> {
  key: K;
  label: string;
  swatch?: string;
}

interface OptionGroupProps<K extends string> {
  label: string;
  options: Option<K>[];
  selected: K[] | K | undefined;
  onToggle: (key: K) => void;
  error?: string;
  hint?: string;
}

export function OptionGroup<K extends string>({
  label,
  options,
  selected,
  onToggle,
  error,
  hint,
}: OptionGroupProps<K>) {
  const isSelected = (key: K) => (Array.isArray(selected) ? selected.includes(key) : selected === key);
  return (
    <View style={styles.wrapper} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <AppText variant="small" style={styles.label}>
        {label}
      </AppText>
      {hint && (
        <AppText variant="small" tone="muted">
          {hint}
        </AppText>
      )}
      <View style={styles.chips}>
        {options.map((o) => (
          <FilterChip
            key={o.key}
            label={o.label}
            swatch={o.swatch}
            selected={isSelected(o.key)}
            onPress={() => onToggle(o.key)}
          />
        ))}
      </View>
      {error && (
        <AppText variant="small" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.two },
  label: { fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
