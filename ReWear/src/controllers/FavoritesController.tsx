import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as FavoritesModel from '@/models/FavoritesModel';

interface FavoritesState {
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
  prune: (missingIds: string[]) => void;
}

const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    FavoritesModel.loadFavorites()
      .then(setIds)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) FavoritesModel.saveFavorites(ids).catch(() => {});
  }, [ids, loaded]);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    setIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]));
  }, []);

  /** Entfernt Favoriten von Artikeln, die gelöscht wurden. */
  const prune = useCallback((missingIds: string[]) => {
    setIds((current) => {
      const next = current.filter((id) => !missingIds.includes(id));
      return next.length === current.length ? current : next;
    });
  }, []);

  const value = useMemo(() => ({ ids, isFavorite, toggle, prune }), [ids, isFavorite, toggle, prune]);
  return <FavoritesContext value={value}>{children}</FavoritesContext>;
}

export function useFavorites(): FavoritesState {
  const context = use(FavoritesContext);
  if (!context) throw new Error('useFavorites muss innerhalb von <FavoritesProvider> verwendet werden.');
  return context;
}
