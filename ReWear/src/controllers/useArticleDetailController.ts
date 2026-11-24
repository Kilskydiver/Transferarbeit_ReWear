import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import * as ArticleModel from '@/models/ArticleModel';
import type { Article, ArticleStatus } from '@/models/types';
import { parsePrice } from '@/models/validation';

import { useAuth } from './AuthController';
import { useFavorites } from './FavoritesController';
import { errorMessage, useFocusedQuery } from './useFocusedQuery';

export type DetailDialog = 'none' | 'status' | 'sold' | 'delete';

export function useArticleDetailController(id: string) {
  const db = useSQLiteContext();
  const { seller } = useAuth();
  const favorites = useFavorites();

  const load = useCallback(() => ArticleModel.getById(db, id), [db, id]);
  const query = useFocusedQuery<Article | null>(load, null);
  const article = query.data;

  const [dialog, setDialog] = useState<DetailDialog>('none');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [soldPriceText, setSoldPriceText] = useState('');
  const [soldPriceError, setSoldPriceError] = useState<string | undefined>();

  const run = async (action: () => Promise<void>) => {
    if (!seller) return;
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = (status: ArticleStatus) => {
    if (!article || !seller) return;
    if (status === 'sold') {
      setSoldPriceText(article.price.toFixed(2));
      setSoldPriceError(undefined);
      setDialog('sold');
      return;
    }
    setDialog('none');
    run(async () => {
      await ArticleModel.updateStatus(db, seller.id, article.id, status);
      await query.reload();
    });
  };

  const confirmSold = () => {
    if (!article || !seller) return;
    const price = parsePrice(soldPriceText);
    if (price === null || price <= 0) {
      setSoldPriceError('Bitte einen gültigen Verkaufspreis eingeben.');
      return;
    }
    run(async () => {
      await ArticleModel.updateStatus(db, seller.id, article.id, 'sold', price);
      setDialog('none');
      await query.reload();
    });
  };

  const confirmDelete = () => {
    if (!article || !seller) return;
    run(async () => {
      await ArticleModel.remove(db, seller.id, article.id);
      setDialog('none');
      router.back();
    });
  };

  return {
    article,
    loading: query.loading,
    error: query.error,
    reload: query.reload,
    isSeller: !!seller,
    isFavorite: article ? favorites.isFavorite(article.id) : false,
    toggleFavorite: () => article && favorites.toggle(article.id),
    canReserve: !seller && article?.status === 'available',
    reserve: () => article && router.push({ pathname: '/article/[id]/reserve', params: { id: article.id } }),
    edit: () => article && router.push({ pathname: '/article/[id]/edit', params: { id: article.id } }),

    dialog,
    openDialog: (type: DetailDialog) => {
      setActionError(null);
      setDialog(type);
    },
    closeDialog: () => setDialog('none'),
    busy,
    actionError,
    changeStatus,
    soldPriceText,
    setSoldPriceText,
    soldPriceError,
    confirmSold,
    confirmDelete,
  };
}
