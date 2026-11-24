import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Gekapselter Foto-Schritt: speichert das Bild dauerhaft (heute lokal, später Upload ins Backend
 * bzw. Hintergrundentfernung), damit der Rest der App nicht angepasst werden muss.
 */
export async function persistImage(uri: string): Promise<string> {
  // Auf dem Web liefert der Image Picker bereits eine Data-URL, die direkt gespeichert werden kann.
  if (Platform.OS === 'web') return uri;

  const directory = new Directory(Paths.document, 'article-images');
  directory.create({ idempotent: true, intermediates: true });
  if (uri.startsWith(directory.uri)) return uri;

  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
  const target = new File(directory, `${Crypto.randomUUID()}.${extension}`);
  await new File(uri).copy(target);
  return target.uri;
}

export function deleteImage(uri: string): void {
  if (Platform.OS === 'web') return;
  try {
    const file = new File(uri);
    if (file.exists && uri.startsWith(Paths.document.uri)) file.delete();
  } catch {
    // Bild konnte nicht gelöscht werden – kein Einfluss auf die Daten.
  }
}
