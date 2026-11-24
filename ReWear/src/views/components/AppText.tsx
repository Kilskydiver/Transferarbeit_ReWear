import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'small' | 'caption' | 'price';
type Tone = 'default' | 'secondary' | 'muted' | 'primary' | 'danger' | 'onPrimary';

interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
}

export function AppText({ variant = 'body', tone = 'default', style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const color = {
    default: theme.text,
    secondary: theme.textSecondary,
    muted: theme.textMuted,
    primary: theme.primary,
    danger: theme.danger,
    onPrimary: theme.onPrimary,
  }[tone];
  return <Text style={[styles[variant], { color }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  display: { fontFamily: Fonts.serif, fontSize: 32, lineHeight: 38, fontWeight: '600', letterSpacing: -0.5 },
  title: { fontFamily: Fonts.serif, fontSize: 22, lineHeight: 28, fontWeight: '600' },
  heading: { fontFamily: Fonts.sans, fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontFamily: Fonts.sans, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: Fonts.sans, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  small: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 18 },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  price: { fontFamily: Fonts.sans, fontSize: 16, lineHeight: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
