import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import * as ArticleModel from '@/models/ArticleModel';
import * as ReservationModel from '@/models/ReservationModel';
import type { Article, ReservationWithArticle } from '@/models/types';
import { parsePrice } from '@/models/validation';

import { useAuth } from './AuthController';
import { openArticle } from './useHomeController';
import { errorMessage, useFocusedQuery } from './useFocusedQuery';

interface SellerData {
  articles: Article[];
  reservations: ReservationWithArticle[];
}

export function useSellerController() {
  const db = useSQLiteContext();
  const { seller, logout } = useAuth();

  const load = useCallback(async (): Promise<SellerData> => {
    if (!seller) return { articles: [], reservations: [] };
    const [articles, reservations] = await Promise.all([
      ArticleModel.listAllForSeller(db, seller.id),
      ReservationModel.listActive(db, seller.id),
    ]);
    return { articles, reservations };
  }, [db, seller]);

  const query = useFocusedQuery<SellerData>(load, { articles: [], reservations: [] });
  const { articles, reservations } = query.data;

  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [soldTarget, setSoldTarget] = useState<ReservationWithArticle | null>(null);
  const [soldPriceText, setSoldPriceText] = useState('');
  const [soldPriceError, setSoldPriceError] = useState<string | undefined>();

  const run = async (id: string, action: (sellerId: string) => Promise<void>) => {
    if (!seller) return;
    setBusyId(id);
    setActionError(null);
    try {
      await action(seller.id);
      await query.reload();
    } catch (e) {
      setActionError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return {
    seller,
    loading: query.loading,
    refreshing: query.refreshing,
    error: query.error,
    refresh: query.refresh,
    actionError,
    busyId,
    articles,
    openReservations: reservations.filter((r) => r.status === 'open'),
    confirmedReservations: reservations.filter((r) => r.status === 'confirmed'),
    stats: {
      available: articles.filter((a) => a.status === 'available').length,
      reserved: articles.filter((a) => a.status === 'reserved').length,
      sold: articles.filter((a) => a.status === 'sold').length,
    },
    confirm: (id: string) => run(id, (sellerId) => ReservationModel.confirm(db, sellerId, id)),
    reject: (id: string) => run(id, (sellerId) => ReservationModel.reject(db, sellerId, id)),

    soldTarget,
    soldPriceText,
    setSoldPriceText,
    soldPriceError,
    askSold: (reservation: ReservationWithArticle) => {
      setSoldTarget(reservation);
      setSoldPriceText(reservation.articlePrice.toFixed(2));
      setSoldPriceError(undefined);
    },
    cancelSold: () => setSoldTarget(null),
    confirmSold: () => {
      if (!soldTarget) return;
      const price = parsePrice(soldPriceText);
      if (price === null || price <= 0) {
        setSoldPriceError('Bitte einen gültigen Verkaufspreis eingeben.');
        return;
      }
      const target = soldTarget;
      setSoldTarget(null);
      run(target.id, (sellerId) => ArticleModel.updateStatus(db, sellerId, target.articleId, 'sold', price));
    },

    openArticle,
    openSales: () => router.push('/seller/sales'),
    addArticle: () => router.navigate('/add'),
    logout: async () => {
      // Zuerst navigieren, sonst leitet die geschützte Route sofort zum Login um.
      router.dismissTo('/');
      await logout();
    },
  };
}
