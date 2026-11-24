import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import Storage from 'expo-sqlite/kv-store';

import type { Seller } from './types';

const SESSION_KEY = 'rewear.session.sellerId';

type SellerRow = {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  password_salt: string;
};

export class AuthError extends Error {}
export class PermissionError extends Error {}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export async function createPasswordHash(password: string) {
  const salt = toHex(Crypto.getRandomBytes(16));
  return { salt, hash: await hashPassword(password, salt) };
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function toSeller(row: SellerRow): Seller {
  return { id: row.id, email: row.email, displayName: row.display_name };
}

export async function login(db: SQLiteDatabase, email: string, password: string): Promise<Seller> {
  const row = await db.getFirstAsync<SellerRow>(
    'SELECT * FROM sellers WHERE email = ? COLLATE NOCASE',
    email.trim()
  );
  const hash = row ? await hashPassword(password, row.password_salt) : '';
  if (!row || !safeEqual(hash, row.password_hash)) {
    throw new AuthError('E-Mail oder Passwort ist falsch.');
  }
  await Storage.setItem(SESSION_KEY, row.id);
  return toSeller(row);
}

export async function logout(): Promise<void> {
  await Storage.removeItem(SESSION_KEY);
}

export async function restoreSession(db: SQLiteDatabase): Promise<Seller | null> {
  const id = await Storage.getItem(SESSION_KEY);
  if (!id) return null;
  const row = await db.getFirstAsync<SellerRow>('SELECT * FROM sellers WHERE id = ?', id);
  if (!row) {
    await logout();
    return null;
  }
  return toSeller(row);
}

/** Prüft, ob die Aktion von einem gültigen Verkäufer ausgeführt wird (ersetzt später Backend-Regeln). */
export async function requireSeller(db: SQLiteDatabase, sellerId: string | undefined): Promise<void> {
  if (!sellerId) throw new PermissionError('Nur der Verkäufer darf diese Aktion ausführen.');
  const row = await db.getFirstAsync<{ id: string }>('SELECT id FROM sellers WHERE id = ?', sellerId);
  if (!row) throw new PermissionError('Nur der Verkäufer darf diese Aktion ausführen.');
}
