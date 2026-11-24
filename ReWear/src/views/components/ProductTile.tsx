import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { labelOf } from '@/models/catalog';
import type { Article } from '@/models/types';
import { formatPrice } from '@/utils/format';

import { AppText } from './AppText';
import { ArticleImage } from './ArticleImage';
import { FavoriteButton } from './FavoriteButton';
import { StatusBadge } from './StatusBadge';

interface ProductTileProps {
  article: Article;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  unavailableLabel?: string;
}

export function ProductTile({ article, isFavorite, onPress, onToggleFavorite, unavailableLabel }: ProductTileProps) {
  const theme = useTheme();
  const unavailable = article.status === 'sold';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${article.title}, ${formatPrice(article.price)}, Grösse ${article.size}`}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View style={[styles.imageWrap, Shadow]}>
        <ArticleImage
          uri={article.imageUrl}
          category={article.category}
          color={article.color}
          style={[styles.image, { borderColor: theme.border }]}
          dimmed={unavailable}
        />
        {article.status !== 'available' && (
          <View style={styles.badge}>
            <StatusBadge status={article.status} solid />
          </View>
        )}
        <View style={styles.favorite}>
          <FavoriteButton active={isFavorite} onPress={onToggleFavorite} size={34} />
        </View>
      </View>
      <View style={styles.info}>
        {article.brand ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {article.brand}
          </AppText>
        ) : null}
        <AppText variant="bodyStrong" numberOfLines={1}>
          {article.title}
        </AppText>
        <AppText variant="small" tone="secondary" numberOfLines={1}>
          {article.size} · {labelOf.condition(article.condition)}
        </AppText>
        {unavailable && unavailableLabel ? (
          <AppText variant="small" tone="danger">
            {unavailableLabel}
          </AppText>
        ) : (
          <AppText variant="price" style={styles.price}>
            {formatPrice(article.price)}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: Spacing.two },
  pressed: { opacity: 0.85 },
  imageWrap: { borderRadius: Radius.lg },
  image: { aspectRatio: 4 / 5, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  badge: { position: 'absolute', left: Spacing.two, top: Spacing.two },
  favorite: { position: 'absolute', right: Spacing.two, top: Spacing.two },
  info: { gap: 2, paddingHorizontal: Spacing.one },
  price: { marginTop: Spacing.one },
});
