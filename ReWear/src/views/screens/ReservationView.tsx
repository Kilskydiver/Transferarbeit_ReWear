import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { useReservationController } from '@/controllers/useReservationController';
import { useTheme } from '@/hooks/use-theme';
import { AppText } from '@/views/components/AppText';
import { EmptyState } from '@/views/components/EmptyState';
import { ErrorMessage } from '@/views/components/ErrorMessage';
import { FormField } from '@/views/components/FormField';
import { Icon } from '@/views/components/Icon';
import { LoadingState } from '@/views/components/LoadingState';
import { PrimaryButton } from '@/views/components/PrimaryButton';
import { ProductListItem } from '@/views/components/ProductListItem';
import { Screen } from '@/views/components/Screen';

type ReservationViewProps = ReturnType<typeof useReservationController>;

export function ReservationView(c: ReservationViewProps) {
  const theme = useTheme();

  if (c.loading) return <LoadingState />;
  if (!c.article) {
    return (
      <Screen edges={['bottom']}>
        <EmptyState icon="info" title="Artikel nicht gefunden" message={c.loadError ?? undefined} />
      </Screen>
    );
  }

  if (c.success) {
    return (
      <Screen edges={['bottom']}>
        <View style={styles.success}>
          <View style={[styles.successIcon, { backgroundColor: `${theme.success}22` }]}>
            <Icon name="check" size={36} color={theme.success} />
          </View>
          <AppText variant="display" style={styles.center} accessibilityRole="header">
            Reservation gesendet
          </AppText>
          <AppText tone="secondary" style={styles.center}>
            «{c.article.title}» ist jetzt für dich reserviert. Ich melde mich bei dir unter{' '}
            <AppText variant="bodyStrong">{c.values.buyerContact.trim()}</AppText>, um die Übergabe zu
            vereinbaren.
          </AppText>
          <View style={styles.successAction}>
            <PrimaryButton label="Weiter stöbern" onPress={c.done} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppText tone="secondary">
            Reserviere den Artikel unverbindlich – ohne Konto. Ich melde mich für die Übergabe bei dir.
          </AppText>

          <ProductListItem article={c.article} showStatus />

          {c.article.status !== 'available' && (
            <ErrorMessage message="Dieser Artikel ist aktuell nicht verfügbar und kann nicht reserviert werden." />
          )}

          <FormField
            label="Name"
            value={c.values.buyerName}
            onChangeText={(t) => c.setField('buyerName', t)}
            error={c.errors.buyerName}
            autoComplete="name"
            textContentType="name"
            placeholder="z. B. Anna Muster"
            maxLength={60}
          />
          <FormField
            label="E-Mail oder Telefonnummer"
            value={c.values.buyerContact}
            onChangeText={(t) => c.setField('buyerContact', t)}
            error={c.errors.buyerContact}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="anna@example.ch oder 079 123 45 67"
            maxLength={80}
          />
          <FormField
            label="Nachricht"
            optional
            multiline
            value={c.values.message}
            onChangeText={(t) => c.setField('message', t)}
            error={c.errors.message}
            placeholder="z. B. Kann ich am Samstag abholen?"
            maxLength={500}
          />

          <View style={[styles.privacy, { backgroundColor: theme.surfaceMuted }]}>
            <Icon name="lock" size={16} color={theme.textSecondary} />
            <AppText variant="small" tone="secondary" style={styles.flex}>
              Deine Angaben werden nur für diese Reservation verwendet und nach Abschluss gelöscht.
            </AppText>
          </View>

          {c.submitError && <ErrorMessage message={c.submitError} />}

          <PrimaryButton
            label="Reservation senden"
            onPress={c.submit}
            loading={c.submitting}
            disabled={c.article.status !== 'available'}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.four, paddingBottom: Spacing.six },
  privacy: { flexDirection: 'row', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.md },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.three },
  successIcon: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  successAction: { alignSelf: 'stretch', marginTop: Spacing.three },
  center: { textAlign: 'center' },
});
