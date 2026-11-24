import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';

import * as ArticleModel from '@/models/ArticleModel';
import type { Article } from '@/models/types';
import { parseSwissDate } from '@/models/validation';
import { formatDate } from '@/utils/format';

import { useAuth } from './AuthController';
import { openArticle } from './useHomeController';
import { useFocusedQuery } from './useFocusedQuery';

export type SalesPeriod = '3m' | '1y' | 'custom';

export const SALES_PERIODS: { key: SalesPeriod; label: string }[] = [
  { key: '3m', label: '3 Monate' },
  { key: '1y', label: '1 Jahr' },
  { key: 'custom', label: 'Zeitraum' },
];

function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(d: Date): Date {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e;
}

export function useSalesController() {
  const db = useSQLiteContext();
  const { seller } = useAuth();

  const [period, setPeriod] = useState<SalesPeriod>('3m');
  const [fromText, setFromText] = useState(formatDate(monthsAgo(1)));
  const [toText, setToText] = useState(formatDate(new Date()));

  const range = useMemo(():
    | { from: Date; to: Date; error?: undefined }
    | { error: { from?: string; to?: string; range?: string } } => {
    if (period === '3m') return { from: monthsAgo(3), to: endOfDay(new Date()) };
    if (period === '1y') return { from: monthsAgo(12), to: endOfDay(new Date()) };
    const from = parseSwissDate(fromText);
    const to = parseSwissDate(toText);
    const error: { from?: string; to?: string; range?: string } = {};
    if (!from) error.from = 'Format TT.MM.JJJJ';
    if (!to) error.to = 'Format TT.MM.JJJJ';
    if (from && to && from > to) error.range = 'Das Datum «von» muss vor dem Datum «bis» liegen.';
    if (!from || !to || error.range) return { error };
    return { from, to: endOfDay(to) };
  }, [period, fromText, toText]);

  const load = useCallback(async () => {
    if (!seller || range.error) return [];
    return ArticleModel.listSold(db, seller.id, range.from.toISOString(), range.to.toISOString());
  }, [db, seller, range]);

  const query = useFocusedQuery<Article[]>(load, []);
  const total = query.data.reduce((sum, a) => sum + (a.soldPrice ?? a.price), 0);

  return {
    period,
    setPeriod,
    fromText,
    toText,
    setFromText,
    setToText,
    rangeError: range.error,
    rangeLabel: range.error ? null : `${formatDate(range.from)} – ${formatDate(range.to)}`,
    sold: query.data,
    total,
    loading: query.loading,
    error: query.error,
    refresh: query.refresh,
    refreshing: query.refreshing,
    openArticle,
  };
}
