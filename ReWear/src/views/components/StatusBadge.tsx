import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ARTICLE_STATUS } from '@/models/catalog';
import type { ArticleStatus } from '@/models/types';

import { AppText } from './AppText';

export function StatusBadge({ status, solid }: { status: ArticleStatus; solid?: boolean }) {
  const theme = useTheme();
  const color = { available: theme.success, reserved: theme.warning, sold: theme.textMuted }[status];
  return (
    <View
      accessibilityLabel={`Status: ${ARTICLE_STATUS[status]}`}
      style={[
        styles.badge,
        { backgroundColor: solid ? theme.surface : `${color}1F`, borderColor: `${color}55` },
      ]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="small" style={[styles.label, { color }]}>
        {ARTICLE_STATUS[status]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one + 2,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  label: { fontWeight: '600', fontSize: 12 },
});
