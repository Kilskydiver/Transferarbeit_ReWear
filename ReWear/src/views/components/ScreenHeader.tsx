import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function ScreenHeader({ eyebrow, title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        {eyebrow && (
          <AppText variant="caption" tone="muted">
            {eyebrow}
          </AppText>
        )}
        <AppText variant="display" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle && <AppText tone="secondary">{subtitle}</AppText>}
      </View>
      {right}
    </View>
  );
}

interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  badge?: number;
}

export function IconButton({ icon, label, onPress, badge }: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} neu` : label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && { opacity: 0.7 },
      ]}>
      <Icon name={icon} size={20} />
      {!!badge && (
        <View style={[styles.badge, { backgroundColor: theme.favorite }]}>
          <AppText variant="small" style={styles.badgeText}>
            {badge}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  text: { flex: 1, gap: Spacing.one },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', lineHeight: 14 },
});
