import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface CategoryTileProps {
  label: string;
  count: number;
  icon: IconName;
  onPress: () => void;
}

export function CategoryTile({ label, count, icon, onPress }: CategoryTileProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${count} Artikel`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && { opacity: 0.85 },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.surfaceMuted }]}>
        <Icon name={icon} size={26} color={theme.primary} />
      </View>
      <View style={styles.text}>
        <AppText variant="heading">{label}</AppText>
        <AppText variant="small" tone="secondary">
          {count} Artikel verfügbar
        </AppText>
      </View>
      <Icon name="chevronRight" size={16} color={theme.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
