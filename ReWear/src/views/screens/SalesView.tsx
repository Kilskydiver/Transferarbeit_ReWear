import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { SALES_PERIODS, type useSalesController } from '@/controllers/useSalesController';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatPrice } from '@/utils/format';
import { AppText } from '@/views/components/AppText';
import { EmptyState } from '@/views/components/EmptyState';
import { ErrorMessage } from '@/views/components/ErrorMessage';
import { FormField } from '@/views/components/FormField';
import { ProductListItem } from '@/views/components/ProductListItem';
import { Screen } from '@/views/components/Screen';
import { SegmentedControl } from '@/views/components/SegmentedControl';

type SalesViewProps = ReturnType<typeof useSalesController>;

export function SalesView(c: SalesViewProps) {
  const theme = useTheme();

  const header = (
    <View style={styles.header}>
      <SegmentedControl accessibilityLabel="Zeitraum" options={SALES_PERIODS} value={c.period} onChange={c.setPeriod} />

      {c.period === 'custom' && (
        <View style={styles.dates}>
          <View style={styles.flex}>
            <FormField
              label="Von"
              value={c.fromText}
              onChangeText={c.setFromText}
              placeholder="TT.MM.JJJJ"
              keyboardType="numbers-and-punctuation"
              error={c.rangeError?.from}
              maxLength={10}
            />
          </View>
          <View style={styles.flex}>
            <FormField
              label="Bis"
              value={c.toText}
              onChangeText={c.setToText}
              placeholder="TT.MM.JJJJ"
              keyboardType="numbers-and-punctuation"
              error={c.rangeError?.to}
              maxLength={10}
            />
          </View>
        </View>
      )}
      {c.rangeError?.range && <ErrorMessage message={c.rangeError.range} />}

      <View style={[styles.total, { backgroundColor: theme.primary }]}>
        <AppText variant="caption" style={{ color: theme.onPrimary, opacity: 0.75 }}>
          Einnahmen {c.rangeLabel ? `· ${c.rangeLabel}` : ''}
        </AppText>
        <AppText variant="display" style={[styles.totalValue, { color: theme.onPrimary }]} accessibilityLiveRegion="polite">
          {formatPrice(c.total)}
        </AppText>
        <AppText variant="small" style={{ color: theme.onPrimary, opacity: 0.85 }}>
          {c.sold.length} verkaufte{c.sold.length === 1 ? 'r Artikel' : ' Artikel'}
        </AppText>
      </View>

      {c.error && <ErrorMessage message={c.error} onRetry={c.refresh} />}
    </View>
  );

  return (
    <Screen edges={['bottom']}>
      <FlatList
        data={c.sold}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={c.refreshing} onRefresh={c.refresh} tintColor={theme.primary} />}
        ListEmptyComponent={
          c.loading || c.rangeError ? undefined : (
            <EmptyState icon="calendar" title="Keine Verkäufe" message="Im gewählten Zeitraum wurde nichts verkauft." />
          )
        }
        renderItem={({ item }) => (
          <ProductListItem
            article={item}
            onPress={() => c.openArticle(item.id)}
            meta={item.soldAt ? `Verkauft am ${formatDate(item.soldAt)}` : undefined}
            priceOverride={item.soldPrice ?? item.price}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.four - 4, gap: Spacing.three, paddingBottom: Spacing.six },
  header: { gap: Spacing.three, marginBottom: Spacing.one },
  dates: { flexDirection: 'row', gap: Spacing.two },
  flex: { flex: 1 },
  total: { borderRadius: Radius.lg + 4, padding: Spacing.four, gap: Spacing.one },
  totalValue: { fontVariant: ['tabular-nums'] },
});
