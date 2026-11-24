import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="alert"
      style={[styles.box, { backgroundColor: `${theme.danger}14`, borderColor: `${theme.danger}55` }]}>
      <Icon name="warning" size={18} color={theme.danger} />
      <AppText variant="small" style={[styles.text, { color: theme.danger }]}>
        {message}
      </AppText>
      {onRetry && (
        <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={8}>
          <AppText variant="small" style={[styles.retry, { color: theme.danger }]}>
            Erneut versuchen
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  text: { flex: 1 },
  retry: { fontWeight: '700', textDecorationLine: 'underline' },
});
