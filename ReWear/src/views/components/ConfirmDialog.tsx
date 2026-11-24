import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

/** Plattformunabhängiger Bestätigungsdialog (Alert mit Buttons funktioniert im Web nicht). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  destructive,
  loading,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <View accessibilityViewIsModal style={[styles.card, { backgroundColor: theme.background }]}>
          <AppText variant="title">{title}</AppText>
          {message && <AppText tone="secondary">{message}</AppText>}
          {children}
          <View style={styles.actions}>
            <View style={styles.flex}>
              <PrimaryButton label="Abbrechen" variant="secondary" onPress={onCancel} compact />
            </View>
            <View style={styles.flex}>
              <PrimaryButton
                label={confirmLabel}
                variant={destructive ? 'danger' : 'primary'}
                onPress={onConfirm}
                loading={loading}
                compact
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  card: { width: '100%', maxWidth: 420, borderRadius: Radius.lg + 4, padding: Spacing.four, gap: Spacing.three },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  flex: { flex: 1 },
});
