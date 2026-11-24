import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import * as ArticleModel from '@/models/ArticleModel';
import type { Article } from '@/models/types';

import { useAuth } from './AuthController';
import { useFavorites } from './FavoritesController';
import { useFocusedQuery } from './useFocusedQuery';

export function openArticle(id: string) {
  router.push({ pathname: '/article/[id]', params: { id } });
}

export function useHomeController() {
  const db = useSQLiteContext();
  const { seller } = useAuth();
  const favorites = useFavorites();

  const load = useCallback(() => ArticleModel.listLatest(db), [db]);
  const query = useFocusedQuery<Article[]>(load, []);

  return {
    articles: query.data,
    loading: query.loading,
    refreshing: query.refreshing,
    error: query.error,
    refresh: query.refresh,
    isSeller: !!seller,
    sellerName: seller?.displayName,
    isFavorite: favorites.isFavorite,
    toggleFavorite: favorites.toggle,
    openArticle,
    openProfile: () => router.push(seller ? '/seller' : '/login'),
  };
}
