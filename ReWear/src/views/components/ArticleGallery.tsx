import { useState } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { Category, ColorKey } from '@/models/types';

import { ArticleImage } from './ArticleImage';

interface ArticleGalleryProps {
  images: string[];
  category: Category;
  color: ColorKey;
  style?: StyleProp<ViewStyle>;
  dimmed?: boolean;
}

/** Wischbare Fotogalerie mit Seitenindikator; ohne Fotos wird der Platzhalter gezeigt. */
export function ArticleGallery({ images, category, color, style, dimmed }: ArticleGalleryProps) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  if (images.length <= 1) {
    return (
      <ArticleImage uri={images[0] ?? null} category={category} color={color} iconSize={72} style={style} dimmed={dimmed} />
    );
  }

  return (
    <View style={style} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          if (width) setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={64}
        style={StyleSheet.absoluteFill}>
        {images.map((uri, i) => (
          <ArticleImage
            key={`${uri}-${i}`}
            uri={uri}
            category={category}
            color={color}
            dimmed={dimmed}
            style={{ width, height: '100%' }}
          />
        ))}
      </ScrollView>
      <View style={styles.dots} pointerEvents="none" accessibilityLabel={`Foto ${index + 1} von ${images.length}`}>
        {images.map((uri, i) => (
          <View
            key={`${uri}-${i}`}
            style={[styles.dot, { opacity: i === index ? 1 : 0.5 }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Spacing.five + Spacing.two,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one + 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
});
