import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { SORT_OPTIONS, type useSearchController } from '@/controllers/useSearchController';
import { useTheme } from '@/hooks/use-theme';
import { COLORS, CONDITIONS, DEPARTMENTS, USAGES, colorHex, labelOf } from '@/models/catalog';
import type { Department } from '@/models/types';
import { AppText } from '@/views/components/AppText';
import { BottomSheet } from '@/views/components/BottomSheet';
import { Breadcrumb } from '@/views/components/Breadcrumb';
import { CategoryTile } from '@/views/components/CategoryTile';
import { EmptyState } from '@/views/components/EmptyState';
import { ErrorMessage } from '@/views/components/ErrorMessage';
import { FilterChip } from '@/views/components/FilterChip';
import { Icon } from '@/views/components/Icon';
import { OptionGroup } from '@/views/components/OptionGroup';
import { PrimaryButton } from '@/views/components/PrimaryButton';
import { ProductListItem } from '@/views/components/ProductListItem';
import { Screen } from '@/views/components/Screen';
import { ScreenHeader } from '@/views/components/ScreenHeader';
import { SegmentedControl } from '@/views/components/SegmentedControl';

type SearchViewProps = ReturnType<typeof useSearchController>;

const DEPARTMENT_OPTIONS: { key: Department | 'all'; label: string }[] = [
  { key: 'all', label: 'Alle' },
  ...DEPARTMENTS,
];

export function SearchView(c: SearchViewProps) {
  const theme = useTheme();

  const activeChips: { key: string; label: string; swatch?: string; remove: () => void }[] = [
    ...c.filters.conditions.map((v) => ({ key: `c-${v}`, label: labelOf.condition(v), remove: () => c.removeFilter('conditions', v) })),
    ...c.filters.sizes.map((v) => ({ key: `s-${v}`, label: `Gr. ${v}`, remove: () => c.removeFilter('sizes', v) })),
    ...c.filters.usages.map((v) => ({ key: `u-${v}`, label: labelOf.usage(v), remove: () => c.removeFilter('usages', v) })),
    ...c.filters.colors.map((v) => ({ key: `f-${v}`, label: labelOf.color(v), swatch: colorHex(v), remove: () => c.removeFilter('colors', v) })),
  ];

  const header = (
    <View style={styles.header}>
      <ScreenHeader title="Suche" subtitle="Finde dein nächstes Lieblingsstück." />

      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Icon name="search" size={18} color={theme.textMuted} />
        <TextInput
          value={c.queryText}
          onChangeText={c.setQueryText}
          placeholder="Titel oder Marke suchen"
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Suche nach Titel oder Marke"
          returnKeyType="search"
          autoCorrect={false}
          style={[styles.searchInput, { color: theme.text }]}
        />
        {c.queryText.length > 0 && (
          <Pressable accessibilityLabel="Suche leeren" onPress={() => c.setQueryText('')} hitSlop={10}>
            <Icon name="close" size={14} color={theme.textMuted} />
          </Pressable>
        )}
      </View>

      <SegmentedControl
        accessibilityLabel="Abteilung"
        options={DEPARTMENT_OPTIONS}
        value={c.department ?? 'all'}
        onChange={(k) => c.setDepartment(k === 'all' ? undefined : k)}
      />

      {c.error && <ErrorMessage message={c.error} onRetry={c.refresh} />}

      {!c.showResults ? (
        <View style={styles.categories}>
          <AppText variant="caption" tone="muted">
            Kategorien
          </AppText>
          {c.categories.map((cat) => (
            <CategoryTile
              key={cat.key}
              label={cat.label}
              count={cat.count}
              icon={cat.key}
              onPress={() => c.selectCategory(cat.key)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.resultsHeader}>
          <Breadcrumb items={c.breadcrumb} />

          {c.subcategories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {c.subcategories.map((s) => (
                <FilterChip
                  key={s.label}
                  label={s.label}
                  count={s.count}
                  selected={c.subcategory === s.label}
                  onPress={() => c.selectSubcategory(s.label)}
                />
              ))}
            </ScrollView>
          )}

          <View style={styles.toolbar}>
            <AppText variant="bodyStrong" accessibilityLiveRegion="polite">
              {c.results.length} Treffer
            </AppText>
            <View style={styles.toolbarActions}>
              <ToolbarButton icon="sort" label={c.sortLabel} onPress={c.openSortMenu} />
              <ToolbarButton
                icon="filter"
                label={c.activeFilterCount ? `Filter (${c.activeFilterCount})` : 'Filter'}
                active={c.activeFilterCount > 0}
                onPress={c.openFilters}
              />
            </View>
          </View>

          {activeChips.length > 0 && (
            <View style={styles.activeChips}>
              {activeChips.map((chip) => (
                <FilterChip key={chip.key} label={chip.label} swatch={chip.swatch} onRemove={chip.remove} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={c.showResults ? c.results : []}
        keyExtractor={(a) => a.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          c.showResults && !c.loading && !c.error ? (
            <EmptyState
              icon="search"
              title="Keine Treffer"
              message="Versuche es mit weniger Filtern oder einem anderen Suchbegriff."
              actionLabel="Filter zurücksetzen"
              onAction={c.resetAll}
            />
          ) : undefined
        }
        refreshControl={
          <RefreshControl refreshing={c.refreshing} onRefresh={c.refresh} tintColor={theme.primary} />
        }
        renderItem={({ item }) => (
          <ProductListItem
            article={item}
            onPress={() => c.openArticle(item.id)}
            isFavorite={c.isFavorite(item.id)}
            onToggleFavorite={() => c.toggleFavorite(item.id)}
            showStatus={item.status !== 'available'}
          />
        )}
      />

      <BottomSheet
        visible={c.filterSheetOpen}
        title="Filter"
        onClose={c.closeFilters}
        footer={
          <>
            <View style={styles.flex}>
              <PrimaryButton label="Zurücksetzen" variant="secondary" onPress={c.resetDraft} />
            </View>
            <View style={styles.flex2}>
              <PrimaryButton
                label={c.draftCount === null ? 'Anzeigen' : `${c.draftCount} Artikel anzeigen`}
                onPress={c.applyFilters}
              />
            </View>
          </>
        }>
        <ScrollView contentContainerStyle={styles.sheetContent}>
          <OptionGroup
            label="Zustand"
            options={CONDITIONS}
            selected={c.draft.conditions}
            onToggle={(k) => c.toggleDraft('conditions', k)}
          />
          <OptionGroup
            label="Grösse"
            hint={c.availableSizes.length === 0 ? 'Keine Grössen in dieser Auswahl.' : undefined}
            options={c.availableSizes.map((s) => ({ key: s, label: s }))}
            selected={c.draft.sizes}
            onToggle={(k) => c.toggleDraft('sizes', k)}
          />
          <OptionGroup
            label="Verwendung"
            options={USAGES}
            selected={c.draft.usages}
            onToggle={(k) => c.toggleDraft('usages', k)}
          />
          <OptionGroup
            label="Farbe"
            options={COLORS.map((col) => ({ key: col.key, label: col.label, swatch: col.hex }))}
            selected={c.draft.colors}
            onToggle={(k) => c.toggleDraft('colors', k)}
          />
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={c.sortMenuOpen} title="Sortieren" onClose={c.closeSortMenu}>
        <View style={styles.sheetContent}>
          {SORT_OPTIONS.map((o) => {
            const active = o.key === c.sort;
            return (
              <Pressable
                key={o.key}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => c.setSort(o.key)}
                style={[styles.sortRow, { borderColor: active ? theme.primary : theme.border, backgroundColor: theme.surface }]}>
                <AppText variant={active ? 'bodyStrong' : 'body'}>{o.label}</AppText>
                {active && <Icon name="check" size={16} color={theme.primary} />}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </Screen>
  );
}

function ToolbarButton({
  icon,
  label,
  onPress,
  active,
}: {
  icon: 'sort' | 'filter';
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={icon === 'sort' ? `Sortierung: ${label}` : label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.toolbarButton,
        {
          backgroundColor: active ? theme.primary : theme.surface,
          borderColor: active ? theme.primary : theme.border,
        },
        pressed && { opacity: 0.8 },
      ]}>
      <Icon name={icon} size={14} color={active ? theme.onPrimary : theme.text} />
      <AppText variant="small" style={{ fontWeight: '600', color: active ? theme.onPrimary : theme.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.four - 4, paddingBottom: Spacing.five, gap: Spacing.three },
  header: { gap: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.one },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    minHeight: 50,
  },
  searchInput: { flex: 1, fontFamily: Fonts.sans, fontSize: 16, paddingVertical: Spacing.two },
  categories: { gap: Spacing.three, marginTop: Spacing.two },
  resultsHeader: { gap: Spacing.three },
  chipRow: { gap: Spacing.two },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  toolbarActions: { flexDirection: 'row', gap: Spacing.two },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three - 2,
    minHeight: 36,
  },
  activeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  sheetContent: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four, gap: Spacing.four },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
    marginBottom: -Spacing.two,
  },
  flex: { flex: 1 },
  flex2: { flex: 1.6 },
});
