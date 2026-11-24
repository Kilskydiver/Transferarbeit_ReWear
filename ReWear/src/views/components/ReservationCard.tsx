import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ReservationWithArticle } from '@/models/types';
import { formatPrice, formatRelative } from '@/utils/format';

import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';

interface ReservationCardProps {
  reservation: ReservationWithArticle;
  busy: boolean;
  onOpenArticle: () => void;
  onConfirm?: () => void;
  onReject: () => void;
  onSold?: () => void;
}

export function ReservationCard({ reservation: r, busy, onOpenArticle, onConfirm, onReject, onSold }: ReservationCardProps) {
  const theme = useTheme();
  const confirmed = r.status === 'confirmed';

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <AppText variant="bodyStrong" numberOfLines={1} onPress={onOpenArticle} accessibilityRole="link">
            {r.articleTitle}
          </AppText>
          <AppText variant="small" tone="secondary">
            {formatPrice(r.articlePrice)} · {formatRelative(r.createdAt)}
          </AppText>
        </View>
        <View
          style={[
            styles.pill,
            { backgroundColor: confirmed ? `${theme.success}1F` : `${theme.warning}1F` },
          ]}>
          <AppText variant="small" style={{ color: confirmed ? theme.success : theme.warning, fontWeight: '700' }}>
            {confirmed ? 'Bestätigt' : 'Offen'}
          </AppText>
        </View>
      </View>

      <View style={[styles.buyer, { backgroundColor: theme.surfaceMuted }]}>
        <AppText variant="bodyStrong">{r.buyerName}</AppText>
        <AppText variant="small" tone="secondary" selectable>
          {r.buyerContact}
        </AppText>
        {r.message ? (
          <AppText variant="small" style={styles.message}>
            «{r.message}»
          </AppText>
        ) : null}
      </View>

      <View style={styles.actions}>
        <View style={styles.flex}>
          <PrimaryButton label="Ablehnen" variant="danger" compact onPress={onReject} disabled={busy} />
        </View>
        <View style={styles.flex}>
          {confirmed ? (
            <PrimaryButton label="Verkauft" icon="tag" compact onPress={onSold ?? (() => {})} loading={busy} />
          ) : (
            <PrimaryButton label="Bestätigen" icon="check" compact onPress={onConfirm ?? (() => {})} loading={busy} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.three, gap: Spacing.three },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  flex: { flex: 1 },
  pill: { paddingHorizontal: Spacing.two + 2, paddingVertical: 3, borderRadius: Radius.pill },
  buyer: { padding: Spacing.three, borderRadius: Radius.md, gap: 2 },
  message: { fontStyle: 'italic', marginTop: Spacing.one },
  actions: { flexDirection: 'row', gap: Spacing.two },
});
