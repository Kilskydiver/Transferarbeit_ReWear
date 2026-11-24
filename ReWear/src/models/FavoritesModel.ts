import Storage from 'expo-sqlite/kv-store';

const FAVORITES_KEY = 'rewear.favorites';

export async function loadFavorites(): Promise<string[]> {
  const raw = await Storage.getItem(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveFavorites(ids: string[]): Promise<void> {
  await Storage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}
