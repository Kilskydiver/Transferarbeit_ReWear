import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';

import * as ArticleModel from '@/models/ArticleModel';
import { CATEGORIES, labelOf } from '@/models/catalog';
import {
  EMPTY_FILTERS,
  type Article,
  type ArticleFilters,
  type Category,
  type Department,
  type SearchParams,
  type SortOrder,
} from '@/models/types';

import { openArticle } from './useHomeController';
import { useFavorites } from './FavoritesController';
import { useFocusedQuery } from './useFocusedQuery';

export type FilterGroup = keyof ArticleFilters;

export const SORT_OPTIONS: { key: SortOrder; label: string }[] = [
  { key: 'newest', label: 'Neueste' },
  { key: 'price_asc', label: 'Preis aufsteigend' },
  { key: 'price_desc', label: 'Preis absteigend' },
];

interface SearchData {
  results: Article[];
  categoryCounts: Record<string, number>;
  subcategoryCounts: Record<string, number>;
  sizes: string[];
}

const EMPTY_DATA: SearchData = { results: [], categoryCounts: {}, subcategoryCounts: {}, sizes: [] };

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function useSearchController() {
  const db = useSQLiteContext();
  const favorites = useFavorites();

  const [department, setDepartment] = useState<Department | undefined>();
  const [category, setCategory] = useState<Category | undefined>();
  const [subcategory, setSubcategory] = useState<string | undefined>();
  const [queryText, setQueryText] = useState('');
  const [filters, setFilters] = useState<ArticleFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOrder>('newest');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [draft, setDraft] = useState<ArticleFilters>(EMPTY_FILTERS);
  const [draftCount, setDraftCount] = useState<number | null>(null);

  const query = useDeferredValue(queryText);
  const showResults = !!category || query.trim().length > 0;

  const params: SearchParams = useMemo(
    () => ({ department, category, subcategory, query, filters, sort }),
    [department, category, subcategory, query, filters, sort]
  );

  const load = useCallback(async (): Promise<SearchData> => {
    const [results, categoryCounts, subcategoryCounts, sizes] = await Promise.all([
      showResults ? ArticleModel.search(db, params) : Promise.resolve([]),
      ArticleModel.countByCategory(db, department),
      category ? ArticleModel.countBySubcategory(db, category, department) : Promise.resolve({}),
      ArticleModel.availableSizes(db, params),
    ]);
    return { results, categoryCounts, subcategoryCounts, sizes };
  }, [db, params, showResults, department, category]);

  const data = useFocusedQuery(load, EMPTY_DATA);

  // Live-Trefferanzahl im Filter-Sheet
  useEffect(() => {
    if (!filterSheetOpen) return;
    let active = true;
    ArticleModel.count(db, { ...params, filters: draft })
      .then((n) => active && setDraftCount(n))
      .catch(() => active && setDraftCount(null));
    return () => {
      active = false;
    };
  }, [db, draft, filterSheetOpen, params]);

  const activeFilterCount =
    filters.conditions.length + filters.sizes.length + filters.usages.length + filters.colors.length;

  const breadcrumb = useMemo(() => {
    const items: { label: string; onPress?: () => void }[] = [
      {
        label: 'Alle',
        onPress: () => {
          setCategory(undefined);
          setSubcategory(undefined);
        },
      },
    ];
    if (department) items.push({ label: labelOf.department(department), onPress: () => setSubcategory(undefined) });
    if (category) {
      items.push({ label: labelOf.category(category), onPress: () => setSubcategory(undefined) });
    }
    if (subcategory) items.push({ label: subcategory });
    return items;
  }, [department, category, subcategory]);

  return {
    // Zustand
    department,
    category,
    subcategory,
    queryText,
    filters,
    sort,
    sortLabel: SORT_OPTIONS.find((o) => o.key === sort)?.label ?? '',
    showResults,
    activeFilterCount,
    breadcrumb,
    categories: CATEGORIES.map((c) => ({ ...c, count: data.data.categoryCounts[c.key] ?? 0 })),
    subcategories: category
      ? (CATEGORIES.find((c) => c.key === category)?.subcategories ?? []).map((label) => ({
          label,
          count: data.data.subcategoryCounts[label] ?? 0,
        }))
      : [],
    availableSizes: data.data.sizes,
    results: data.data.results,
    loading: data.loading,
    refreshing: data.refreshing,
    error: data.error,
    refresh: data.refresh,

    // Aktionen
    setQueryText,
    setDepartment: (d: Department | undefined) => {
      setDepartment(d);
      setSubcategory(undefined);
      setFilters((f) => ({ ...f, sizes: [] }));
    },
    selectCategory: (c: Category) => {
      setCategory(c);
      setSubcategory(undefined);
      setFilters((f) => ({ ...f, sizes: [] }));
    },
    selectSubcategory: (s: string) => setSubcategory((current) => (current === s ? undefined : s)),
    resetCategory: () => {
      setCategory(undefined);
      setSubcategory(undefined);
    },
    setSort: (s: SortOrder) => {
      setSort(s);
      setSortMenuOpen(false);
    },
    sortMenuOpen,
    openSortMenu: () => setSortMenuOpen(true),
    closeSortMenu: () => setSortMenuOpen(false),
    removeFilter: <G extends FilterGroup>(group: G, value: ArticleFilters[G][number]) =>
      setFilters((f) => ({ ...f, [group]: (f[group] as string[]).filter((v) => v !== value) })),
    resetAll: () => {
      setFilters(EMPTY_FILTERS);
      setQueryText('');
      setSubcategory(undefined);
    },

    // Filter-Sheet
    filterSheetOpen,
    draft,
    draftCount,
    openFilters: () => {
      setDraft(filters);
      setDraftCount(null);
      setFilterSheetOpen(true);
    },
    closeFilters: () => setFilterSheetOpen(false),
    toggleDraft: <G extends FilterGroup>(group: G, value: ArticleFilters[G][number]) =>
      setDraft((d) => ({ ...d, [group]: toggleIn(d[group] as string[], value) })),
    resetDraft: () => setDraft(EMPTY_FILTERS),
    applyFilters: () => {
      setFilters(draft);
      setFilterSheetOpen(false);
    },

    // Favoriten & Navigation
    isFavorite: favorites.isFavorite,
    toggleFavorite: favorites.toggle,
    openArticle,
  };
}
