import type { Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  ref?: Ref<TextInputInstance>;
}

export function FormField({ label, error, hint, optional, style, multiline, ref, ...rest }: FormFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <AppText variant="small" style={styles.label}>
          {label}
        </AppText>
        {optional && (
          <AppText variant="small" tone="muted">
            optional
          </AppText>
        )}
      </View>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={theme.textMuted}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: theme.text,
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <AppText variant="small" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="small" tone="muted">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.one + 2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontWeight: '600' },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
});
