import { SymbolView, type SFSymbol, type AndroidSymbol } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

const ICONS = {
  home: { ios: 'house', android: 'home' },
  search: { ios: 'magnifyingglass', android: 'search' },
  heart: { ios: 'heart', android: 'favorite' },
  heartFill: { ios: 'heart.fill', android: 'favorite' },
  add: { ios: 'plus.circle', android: 'add_circle' },
  person: { ios: 'person.crop.circle', android: 'account_circle' },
  close: { ios: 'xmark', android: 'close' },
  filter: { ios: 'slider.horizontal.3', android: 'tune' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more' },
  camera: { ios: 'camera', android: 'photo_camera' },
  photo: { ios: 'photo.on.rectangle', android: 'photo_library' },
  check: { ios: 'checkmark', android: 'check' },
  trash: { ios: 'trash', android: 'delete' },
  edit: { ios: 'pencil', android: 'edit' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout' },
  tag: { ios: 'tag', android: 'sell' },
  bag: { ios: 'bag', android: 'shopping_bag' },
  clothing: { ios: 'tshirt', android: 'checkroom' },
  shoes: { ios: 'shoeprints.fill', android: 'steps' },
  accessories: { ios: 'handbag', android: 'shopping_bag' },
  chart: { ios: 'chart.bar', android: 'bar_chart' },
  calendar: { ios: 'calendar', android: 'calendar_month' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome' },
  sort: { ios: 'arrow.up.arrow.down', android: 'swap_vert' },
  inbox: { ios: 'tray', android: 'inbox' },
  warning: { ios: 'exclamationmark.triangle', android: 'warning' },
  info: { ios: 'info.circle', android: 'info' },
  lock: { ios: 'lock', android: 'lock' },
  settings: { ios: 'gearshape', android: 'settings' },
} satisfies Record<string, { ios: SFSymbol; android: AndroidSymbol }>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function Icon({ name, size = 22, color, style }: IconProps) {
  const theme = useTheme();
  const icon = ICONS[name];
  return (
    <SymbolView
      name={{ ios: icon.ios, android: icon.android, web: icon.android }}
      size={size}
      tintColor={color ?? theme.text}
      style={style}
    />
  );
}
