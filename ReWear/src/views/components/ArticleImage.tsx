import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { colorHex } from '@/models/catalog';
import type { Category, ColorKey } from '@/models/types';

import { Icon } from './Icon';

interface ArticleImageProps {
  uri: string | null;
  category: Category;
  color: ColorKey;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  dimmed?: boolean;
}

/** Produktfoto oder ein dezenter Platzhalter in der Artikelfarbe. */
export function ArticleImage({ uri, category, color, style, iconSize = 40, dimmed }: ArticleImageProps) {
  const theme = useTheme();
  const hex = colorHex(color);

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceMuted }, style]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.placeholder,
            { experimental_backgroundImage: `linear-gradient(160deg, ${theme.surfaceMuted} 0%, ${hex}66 100%)` },
          ]}>
          <Icon name={category} size={iconSize} color={theme.textSecondary} />
        </View>
      )}
      {dimmed && <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background, opacity: 0.55 }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
