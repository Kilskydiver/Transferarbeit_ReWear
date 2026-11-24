import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import type { useArticleDetailController } from '@/controllers/useArticleDetailController';
import { useTheme } from '@/hooks/use-theme';
import { ARTICLE_STATUS, labelOf } from '@/models/catalog';
import type { ArticleStatus } from '@/models/types';
import { formatPrice, formatRelative } from '@/utils/format';
import { AppText } from '@/views/components/AppText';
import { ArticleImage } from '@/views/components/ArticleImage';
import { BottomSheet } from '@/views/components/BottomSheet';
import { ColorChip } from '@/views/components/ColorChip';
import { ConfirmDialog } from '@/views/components/ConfirmDialog';
import { EmptyState } from '@/views/components/EmptyState';
import { ErrorMessage } from '@/views/components/ErrorMessage';
import { FavoriteButton } from '@/views/components/FavoriteButton';
import { FormField } from '@/views/components/FormField';
import { Icon } from '@/views/components/Icon';
import { LoadingState } from '@/views/components/LoadingState';
import { PrimaryButton } from '@/views/components/PrimaryButton';
import { Screen } from '@/views/components/Screen';
import { StatusBadge } from '@/views/components/StatusBadge';

type ArticleDetailViewProps = ReturnType<typeof useArticleDetailController>;

const STATUS_ORDER: ArticleStatus[] = ['available', 'reserved', 'sold'];

export function ArticleDetailView(c: ArticleDetailViewProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const a = c.article;

  if (c.loading) return <LoadingState />;
  if (!a) {
    return (
      <Screen edges={[]}>
        {c.error ? (
          <View style={styles.padded}>
            <ErrorMessage message={c.error} onRetry={c.reload} />
          </View>
        ) : (
          <EmptyState icon="info" title="Artikel nicht gefunden" message="Er wurde möglicherweise gelöscht." />
        )}
      </Screen>
    );
  }

  const reserveLabel =
    a.status === 'available' ? 'Reservieren' : a.status === 'reserved' ? 'Bereits reserviert' : 'Verkauft';

  return (
    <Screen edges={[]}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.six + insets.bottom + 40 }}>
        <View>
          <ArticleImage
            uri={a.imageUrl}
            category={a.category}
            color={a.color}
            iconSize={72}
            style={styles.image}
            dimmed={a.status === 'sold'}
          />
          <View style={styles.favorite}>
            <FavoriteButton active={c.isFavorite} onPress={c.toggleFavorite} size={44} />
          </View>
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={styles.titleBlock}>
            <View style={styles.badgeRow}>
              <StatusBadge status={a.status} />
              <AppText variant="small" tone="muted">
                {formatRelative(a.createdAt)} hinzugefügt
              </AppText>
            </View>
            {a.brand && (
              <AppText variant="caption" tone="muted">
                {a.brand}
              </AppText>
            )}
            <AppText variant="display" accessibilityRole="header">
              {a.title}
            </AppText>
            <AppText variant="title" tone="primary">
              {formatPrice(a.price)}
            </AppText>
          </View>

          {c.actionError && <ErrorMessage message={c.actionError} />}

          {c.isSeller && (
            <View style={[styles.sellerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <AppText variant="caption" tone="muted">
                Verkäufer-Aktionen
              </AppText>
              <View style={styles.sellerActions}>
                <SellerAction icon="edit" label="Bearbeiten" onPress={c.edit} />
                <SellerAction icon="tag" label="Status ändern" onPress={() => c.openDialog('status')} />
                <SellerAction icon="trash" label="Löschen" danger onPress={() => c.openDialog('delete')} />
              </View>
            </View>
          )}

          <View style={[styles.details, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <DetailRow label="Abteilung" value={labelOf.department(a.department)} />
            <DetailRow label="Kategorie" value={`${labelOf.category(a.category)} › ${a.subcategory}`} />
            <DetailRow label="Grösse" value={a.size} />
            <DetailRow label="Farbe">
              <ColorChip color={a.color} />
            </DetailRow>
            <DetailRow label="Zustand" value={labelOf.condition(a.condition)} />
            <DetailRow label="Verwendung" value={a.usage.map(labelOf.usage).join(', ')} last />
          </View>

          {a.description ? (
            <View style={styles.description}>
              <AppText variant="heading">Beschreibung</AppText>
              <AppText tone="secondary">{a.description}</AppText>
            </View>
          ) : null}

          {!c.isSeller && (
            <View style={[styles.note, { backgroundColor: theme.surfaceMuted }]}>
              <Icon name="info" size={16} color={theme.textSecondary} />
              <AppText variant="small" tone="secondary" style={styles.flex}>
                Übergabe und Bezahlung erfolgen persönlich (bar oder TWINT). Du brauchst kein Konto zum
                Reservieren.
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>

      {!c.isSeller && (
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.three },
          ]}>
          <View style={styles.bottomInner}>
            <View>
              <AppText variant="small" tone="secondary">
                Preis
              </AppText>
              <AppText variant="price">{formatPrice(a.price)}</AppText>
            </View>
            <View style={styles.flex}>
              <PrimaryButton
                label={reserveLabel}
                icon={a.status === 'available' ? 'bag' : undefined}
                onPress={c.reserve}
                disabled={!c.canReserve}
              />
            </View>
          </View>
        </View>
      )}

      <BottomSheet visible={c.dialog === 'status'} title="Status ändern" onClose={c.closeDialog}>
        <View style={styles.sheetContent}>
          {STATUS_ORDER.map((s) => {
            const active = s === a.status;
            return (
              <Pressable
                key={s}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => c.changeStatus(s)}
                style={[
                  styles.statusRow,
                  { backgroundColor: theme.surface, borderColor: active ? theme.primary : theme.border },
                ]}>
                <StatusBadge status={s} />
                <AppText variant="small" tone="secondary" style={styles.flex}>
                  {s === 'available' && 'Im Shop sichtbar und reservierbar'}
                  {s === 'reserved' && 'Für eine Käuferin / einen Käufer zurückgelegt'}
                  {s === 'sold' && 'Verschwindet aus dem Shop, zählt zu den Einnahmen'}
                </AppText>
                {active && <Icon name="check" size={16} color={theme.primary} />}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={c.dialog === 'sold'}
        title={`Als «${ARTICLE_STATUS.sold}» markieren`}
        message="Gib den tatsächlich erzielten Preis ein. Er fliesst in die Verkaufsübersicht ein."
        confirmLabel="Verkauft"
        loading={c.busy}
        onConfirm={c.confirmSold}
        onCancel={c.closeDialog}>
        <FormField
          label="Verkaufspreis (CHF)"
          value={c.soldPriceText}
          onChangeText={c.setSoldPriceText}
          keyboardType="decimal-pad"
          error={c.soldPriceError}
        />
      </ConfirmDialog>

      <ConfirmDialog
        visible={c.dialog === 'delete'}
        title="Artikel löschen?"
        message={`«${a.title}» und alle zugehörigen Reservationen werden endgültig gelöscht.`}
        confirmLabel="Löschen"
        destructive
        loading={c.busy}
        onConfirm={c.confirmDelete}
        onCancel={c.closeDialog}
      />
    </Screen>
  );
}

function DetailRow({
  label,
  value,
  children,
  last,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <AppText variant="small" tone="secondary" style={styles.rowLabel}>
        {label}
      </AppText>
      <View style={styles.rowValue}>{children ?? <AppText>{value}</AppText>}</View>
    </View>
  );
}

function SellerAction({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: 'edit' | 'tag' | 'trash';
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.sellerAction, { backgroundColor: theme.surfaceMuted }, pressed && { opacity: 0.75 }]}>
      <Icon name={icon} size={20} color={color} />
      <AppText variant="small" style={{ color, fontWeight: '600' }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  padded: { padding: Spacing.four },
  image: { width: '100%', aspectRatio: 4 / 4.4, maxHeight: 560 },
  favorite: { position: 'absolute', right: Spacing.four, bottom: Spacing.five + Spacing.two },
  sheet: {
    marginTop: -Spacing.five,
    borderTopLeftRadius: Radius.lg + 8,
    borderTopRightRadius: Radius.lg + 8,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  titleBlock: { gap: Spacing.two },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  sellerCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.three, gap: Spacing.three },
  sellerActions: { flexDirection: 'row', gap: Spacing.two },
  sellerAction: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one + 2,
    paddingVertical: Spacing.three - 2,
    borderRadius: Radius.md,
  },
  details: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, paddingHorizontal: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.three - 2, gap: Spacing.three },
  rowLabel: { width: 100 },
  rowValue: { flex: 1, alignItems: 'flex-start' },
  description: { gap: Spacing.two },
  note: { flexDirection: 'row', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.md, alignItems: 'flex-start' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  bottomInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four, width: '100%', maxWidth: MaxContentWidth },
  sheetContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.two },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  flex: { flex: 1 },
});
