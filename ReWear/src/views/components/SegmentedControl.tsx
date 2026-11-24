import { Pressable, StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';

interface SegmentedControlProps<K extends string> {
  options: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  accessibilityLabel: string;
}

export function SegmentedControl<K extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<K>) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: theme.surfaceMuted }]}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.key)}
            style={[styles.segment, active && [styles.active, { backgroundColor: theme.surface }]]}>
            <AppText
              variant="small"
              style={{ fontWeight: active ? '700' : '500', color: active ? theme.text : theme.textSecondary }}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 3, borderRadius: Radius.pill },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 36, borderRadius: Radius.pill },
  active: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
