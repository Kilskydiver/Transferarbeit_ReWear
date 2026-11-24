import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.surfaceMuted }]}>
        <Icon name={icon} size={30} color={theme.textSecondary} />
      </View>
      <AppText variant="title" style={styles.center}>
        {title}
      </AppText>
      {message && (
        <AppText tone="secondary" style={styles.center}>
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} variant="secondary" compact />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.six, paddingHorizontal: Spacing.four, gap: Spacing.two },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  center: { textAlign: 'center' },
  action: { marginTop: Spacing.three },
});
