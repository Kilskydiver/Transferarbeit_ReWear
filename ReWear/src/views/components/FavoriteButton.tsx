import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { Icon } from './Icon';

interface FavoriteButtonProps {
  active: boolean;
  onPress: () => void;
  size?: number;
}

export function FavoriteButton({ active, onPress, size = 36 }: FavoriteButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={active ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      accessibilityState={{ selected: active }}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? theme.favorite : theme.surface,
          borderColor: active ? theme.favorite : theme.border,
        },
        pressed && { transform: [{ scale: 0.92 }] },
      ]}>
      <Icon name={active ? 'heartFill' : 'heart'} size={size * 0.5} color={active ? '#FFFFFF' : theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
});
