import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { useSellerController } from '@/controllers/useSellerController';
import { useTheme } from '@/hooks/use-theme';
import { AppText } from '@/views/components/AppText';
import { ConfirmDialog } from '@/views/components/ConfirmDialog';
import { EmptyState } from '@/views/components/EmptyState';
import { ErrorMessage } from '@/views/components/ErrorMessage';
import { FormField } from '@/views/components/FormField';
import { LoadingState } from '@/views/components/LoadingState';
import { PrimaryButton } from '@/views/components/PrimaryButton';
import { ProductListItem } from '@/views/components/ProductListItem';
import { ReservationCard } from '@/views/components/ReservationCard';
import { Screen } from '@/views/components/Screen';
import { IconButton, ScreenHeader } from '@/views/components/ScreenHeader';

type SellerViewProps = ReturnType<typeof useSellerController>;

export function SellerView(c: SellerViewProps) {
  const theme = useTheme();
  if (c.loading) return <LoadingState />;

  return (
    <Screen edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={c.refreshing} onRefresh={c.refresh} tintColor={theme.primary} />}>
        <ScreenHeader
          eyebrow="Verkäufer-Bereich"
          title={`Hallo, ${c.seller?.displayName ?? ''}`}
          right={<IconButton icon="logout" label="Abmelden" onPress={c.logout} />}
        />

        {c.error && <ErrorMessage message={c.error} onRetry={c.refresh} />}
        {c.actionError && <ErrorMessage message={c.actionError} />}

        <View style={styles.stats}>
          <Stat label="Verfügbar" value={c.stats.available} color={theme.success} />
          <Stat label="Reserviert" value={c.stats.reserved} color={theme.warning} />
          <Stat label="Verkauft" value={c.stats.sold} color={theme.textMuted} />
        </View>

        <View style={styles.row}>
          <View style={styles.flex}>
            <PrimaryButton label="Neuer Artikel" icon="add" compact onPress={c.addArticle} />
          </View>
          <View style={styles.flex}>
            <PrimaryButton label="Einnahmen" icon="chart" variant="secondary" compact onPress={c.openSales} />
          </View>
        </View>

        <Section title="Offene Reservationen" count={c.openReservations.length}>
          {c.openReservations.length === 0 ? (
            <AppText tone="secondary">Keine offenen Reservationen.</AppText>
          ) : (
            c.openReservations.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                busy={c.busyId === r.id}
                onOpenArticle={() => c.openArticle(r.articleId)}
                onConfirm={() => c.confirm(r.id)}
                onReject={() => c.reject(r.id)}
              />
            ))
          )}
        </Section>

        {c.confirmedReservations.length > 0 && (
          <Section title="Bereit zur Übergabe" count={c.confirmedReservations.length}>
            {c.confirmedReservations.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                busy={c.busyId === r.id}
                onOpenArticle={() => c.openArticle(r.articleId)}
                onReject={() => c.reject(r.id)}
                onSold={() => c.askSold(r)}
              />
            ))}
          </Section>
        )}

        <Section title="Meine Artikel" count={c.articles.length}>
          {c.articles.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="Noch keine Artikel"
              message="Erfasse deinen ersten Artikel über den Tab «Hinzufügen»."
            />
          ) : (
            c.articles.map((a) => (
              <ProductListItem key={a.id} article={a} onPress={() => c.openArticle(a.id)} showStatus />
            ))
          )}
        </Section>
      </ScrollView>

      <ConfirmDialog
        visible={!!c.soldTarget}
        title="Als verkauft markieren"
        message={c.soldTarget ? `«${c.soldTarget.articleTitle}» an ${c.soldTarget.buyerName}` : undefined}
        confirmLabel="Verkauft"
        onConfirm={c.confirmSold}
        onCancel={c.cancelSold}>
        <FormField
          label="Verkaufspreis (CHF)"
          value={c.soldPriceText}
          onChangeText={c.setSoldPriceText}
          keyboardType="decimal-pad"
          error={c.soldPriceError}
        />
      </ConfirmDialog>
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <AppText variant="title">{value}</AppText>
      <AppText variant="small" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="title" accessibilityRole="header">
        {title} <AppText variant="title" tone="muted">({count})</AppText>
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four - 4, paddingTop: Spacing.four, gap: Spacing.four, paddingBottom: Spacing.six },
  stats: { flexDirection: 'row', gap: Spacing.two },
  stat: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.three, gap: 2 },
  statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  section: { gap: Spacing.three },
});
