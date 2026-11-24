import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

export interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
}

/** Brotkrumen-Navigation, z. B. «Herren › Schuhe › Sneaker». Das letzte Element ist aktiv. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="toolbar"
      accessibilityLabel="Navigationspfad">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            <Pressable
              accessibilityRole="link"
              accessibilityState={{ disabled: last }}
              disabled={last || !item.onPress}
              onPress={item.onPress}
              hitSlop={6}>
              <AppText
                variant="small"
                style={{
                  color: last ? theme.text : theme.textSecondary,
                  fontWeight: last ? '700' : '500',
                  textDecorationLine: last ? 'none' : 'underline',
                }}>
                {item.label}
              </AppText>
            </Pressable>
            {!last && <Icon name="chevronRight" size={11} color={theme.textMuted} />}
          </Fragment>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.one },
});
