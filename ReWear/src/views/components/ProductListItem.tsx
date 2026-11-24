import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { labelOf } from '@/models/catalog';
import type { Article } from '@/models/types';
import { formatPrice } from '@/utils/format';

import { AppText } from './AppText';
import { ArticleImage } from './ArticleImage';
import { FavoriteButton } from './FavoriteButton';
import { StatusBadge } from './StatusBadge';

interface ProductListItemProps {
  article: Article;
  onPress?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showStatus?: boolean;
  meta?: string;
  priceOverride?: number;
  trailing?: ReactNode;
}

export function ProductListItem({
  article,
  onPress,
  isFavorite,
  onToggleFavorite,
  showStatus,
  meta,
  priceOverride,
  trailing,
}: ProductListItemProps) {
  const theme = useTheme();
  const price = priceOverride ?? article.price;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${article.title}, ${formatPrice(price)}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && { opacity: 0.85 },
      ]}>
      <ArticleImage
        uri={article.imageUrl}
        category={article.category}
        color={article.color}
        iconSize={28}
        style={styles.image}
        dimmed={article.status === 'sold' && showStatus}
      />
      <View style={styles.body}>
        {article.brand ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {article.brand}
          </AppText>
        ) : null}
        <AppText variant="bodyStrong" numberOfLines={2}>
          {article.title}
        </AppText>
        <AppText variant="small" tone="secondary" numberOfLines={1}>
          {meta ?? `Grösse ${article.size} · ${labelOf.condition(article.condition)}`}
        </AppText>
        <View style={styles.footer}>
          <AppText variant="price">{formatPrice(price)}</AppText>
          {showStatus && <StatusBadge status={article.status} />}
        </View>
      </View>
      {onToggleFavorite && (
        <FavoriteButton active={!!isFavorite} onPress={onToggleFavorite} size={34} />
      )}
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two + 2,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
  },
  image: { width: 92, height: 115, borderRadius: Radius.md },
  body: { flex: 1, gap: 3, paddingVertical: Spacing.one },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: Spacing.two,
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
});
