import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

export function errorMessage(error: unknown, fallback = 'Etwas ist schiefgelaufen. Bitte versuche es erneut.') {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Lädt Daten bei jedem Fokus des Screens neu und verwaltet Lade-/Fehlerzustand. */
export function useFocusedQuery<T>(load: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const run = useCallback(
    async (mode: 'refresh' | 'silent') => {
      const id = ++requestId.current;
      if (mode === 'refresh') setRefreshing(true);
      try {
        const result = await load();
        if (id === requestId.current) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        if (id === requestId.current) setError(errorMessage(e, 'Daten konnten nicht geladen werden.'));
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [load]
  );

  useFocusEffect(
    useCallback(() => {
      run('silent');
    }, [run])
  );

  const refresh = useCallback(() => run('refresh'), [run]);
  const reload = useCallback(() => run('silent'), [run]);

  return { data, loading, refreshing, error, refresh, reload };
}
