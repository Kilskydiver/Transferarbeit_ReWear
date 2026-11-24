import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { useHomeController } from '@/controllers/useHomeController';
import { useTheme } from '@/hooks/use-theme';
import { AppText } from '@/views/components/AppText';
import { EmptyState } from '@/views/components/EmptyState';
import { ErrorMessage } from '@/views/components/ErrorMessage';
import { LoadingState } from '@/views/components/LoadingState';
import { ProductTile } from '@/views/components/ProductTile';
import { Screen } from '@/views/components/Screen';
import { IconButton, ScreenHeader } from '@/views/components/ScreenHeader';

type HomeViewProps = ReturnType<typeof useHomeController>;

export function HomeView(c: HomeViewProps) {
  const theme = useTheme();

  const header = (
    <View style={styles.header}>
      <ScreenHeader
        eyebrow="Second-Hand · Kleider & Schuhe"
        title="ReWear"
        right={
          <IconButton
            icon="person"
            label={c.isSeller ? 'Verkäufer-Bereich öffnen' : 'Als Verkäufer anmelden'}
            onPress={c.openProfile}
          />
        }
      />
      <View style={[styles.hero, { backgroundColor: theme.primary }]}>
        <AppText variant="caption" style={{ color: theme.onPrimary, opacity: 0.75 }}>
          {c.isSeller ? `Willkommen zurück, ${c.sellerName}` : 'Fair · Lokal · Ohne Gebühren'}
        </AppText>
        <AppText variant="title" style={{ color: theme.onPrimary }}>
          Gut erhaltene Lieblingsstücke – direkt aus meinem Kleiderschrank.
        </AppText>
      </View>
      <View style={styles.sectionRow}>
        <AppText variant="title">Neu eingetroffen</AppText>
        {c.articles.length > 0 && (
          <AppText variant="small" tone="secondary">
            {c.articles.length} Artikel
          </AppText>
        )}
      </View>
      {c.error && <ErrorMessage message={c.error} onRetry={c.refresh} />}
    </View>
  );

  return (
    <Screen>
      {c.loading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={c.articles}
          keyExtractor={(a) => a.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          ListEmptyComponent={
            c.error ? undefined : (
              <EmptyState
                icon="sparkles"
                title="Noch keine Artikel"
                message="Schau bald wieder vorbei – neue Stücke kommen laufend dazu."
              />
            )
          }
          refreshControl={
            <RefreshControl refreshing={c.refreshing} onRefresh={c.refresh} tintColor={theme.primary} />
          }
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <ProductTile
                article={item}
                isFavorite={c.isFavorite(item.id)}
                onPress={() => c.openArticle(item.id)}
                onToggleFavorite={() => c.toggleFavorite(item.id)}
              />
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.four - 4, paddingBottom: Spacing.five, gap: Spacing.four },
  header: { gap: Spacing.four, paddingTop: Spacing.three },
  hero: { borderRadius: 24, padding: Spacing.four, gap: Spacing.two },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  column: { gap: Spacing.three },
  cell: { flex: 1, maxWidth: '50%' },
});
