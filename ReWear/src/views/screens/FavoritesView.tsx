import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { useFavoritesController } from '@/controllers/useFavoritesController';
import { useTheme } from '@/hooks/use-theme';
import { EmptyState } from '@/views/components/EmptyState';
import { ErrorMessage } from '@/views/components/ErrorMessage';
import { LoadingState } from '@/views/components/LoadingState';
import { ProductTile } from '@/views/components/ProductTile';
import { Screen } from '@/views/components/Screen';
import { ScreenHeader } from '@/views/components/ScreenHeader';

type FavoritesViewProps = ReturnType<typeof useFavoritesController>;

export function FavoritesView(c: FavoritesViewProps) {
  const theme = useTheme();
  const count = c.articles.length;

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
          ListHeaderComponent={
            <View style={styles.header}>
              <ScreenHeader
                title="Favoriten"
                subtitle={count > 0 ? `${count} gemerkte${count === 1 ? 's Stück' : ' Stücke'}` : undefined}
              />
              {c.error && <ErrorMessage message={c.error} onRetry={c.refresh} />}
            </View>
          }
          ListEmptyComponent={
            c.error ? undefined : (
              <EmptyState
                icon="heart"
                title="Noch keine Favoriten"
                message="Tippe bei einem Artikel auf das Herz, um ihn hier zu speichern."
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
                unavailableLabel="Nicht mehr verfügbar"
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
  header: { gap: Spacing.three, paddingTop: Spacing.three },
  column: { gap: Spacing.three },
  cell: { flex: 1, maxWidth: '50%' },
});
