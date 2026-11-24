import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect } from 'react';

import * as ArticleModel from '@/models/ArticleModel';
import type { Article } from '@/models/types';

import { useFavorites } from './FavoritesController';
import { openArticle } from './useHomeController';
import { useFocusedQuery } from './useFocusedQuery';

export function useFavoritesController() {
  const db = useSQLiteContext();
  const { ids, isFavorite, toggle, prune } = useFavorites();

  const load = useCallback(async () => {
    const articles = await ArticleModel.getByIds(db, ids);
    const found = new Set(articles.map((a) => a.id));
    return { articles, missing: ids.filter((id) => !found.has(id)) };
  }, [db, ids]);
  const query = useFocusedQuery<{ articles: Article[]; missing: string[] }>(load, {
    articles: [],
    missing: [],
  });

  // Gelöschte Artikel automatisch aus den Favoriten entfernen
  const { missing } = query.data;
  useEffect(() => {
    if (missing.length > 0) prune(missing);
  }, [missing, prune]);

  return {
    articles: query.data.articles.filter((a) => ids.includes(a.id)),
    loading: query.loading,
    refreshing: query.refreshing,
    error: query.error,
    refresh: query.refresh,
    isFavorite,
    toggleFavorite: toggle,
    openArticle,
  };
}
