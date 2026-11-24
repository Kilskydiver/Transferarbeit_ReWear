import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { requireSeller } from './SellerModel';
import type { Reservation, ReservationInput, ReservationWithArticle } from './types';

export class ReservationError extends Error {}

type ReservationRow = {
  id: string;
  article_id: string;
  buyer_name: string;
  buyer_contact: string;
  message: string | null;
  status: Reservation['status'];
  created_at: string;
  article_title: string;
  article_price: number;
  article_image_url: string | null;
  article_status: ReservationWithArticle['articleStatus'];
};

function toReservation(row: ReservationRow): ReservationWithArticle {
  return {
    id: row.id,
    articleId: row.article_id,
    buyerName: row.buyer_name,
    buyerContact: row.buyer_contact,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    articleTitle: row.article_title,
    articlePrice: row.article_price,
    articleImageUrl: row.article_image_url,
    articleStatus: row.article_status,
  };
}

const SELECT_RESERVATION = `
  SELECT r.*, a.title AS article_title, a.price AS article_price,
         (SELECT i.uri FROM article_images i WHERE i.article_id = a.id ORDER BY i.position LIMIT 1)
           AS article_image_url,
         a.status AS article_status
  FROM reservations r JOIN articles a ON a.id = r.article_id`;

/** Käufer: Reservation senden. Reserviert nur, wenn der Artikel noch verfügbar ist. */
export async function create(db: SQLiteDatabase, input: ReservationInput): Promise<string> {
  const id = Crypto.randomUUID();
  await db.withTransactionAsync(async () => {
    const updated = await db.runAsync(
      `UPDATE articles SET status = 'reserved', updated_at = ? WHERE id = ? AND status = 'available'`,
      new Date().toISOString(),
      input.articleId
    );
    if (updated.changes === 0) {
      throw new ReservationError(
        'Dieser Artikel wurde soeben von jemand anderem reserviert oder ist nicht mehr verfügbar.'
      );
    }
    await db.runAsync(
      `INSERT INTO reservations (id, article_id, buyer_name, buyer_contact, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'open', ?)`,
      id,
      input.articleId,
      input.buyerName,
      input.buyerContact,
      input.message,
      new Date().toISOString()
    );
  });
  return id;
}

/** Verkäufer: offene und bestätigte Reservationen von nicht verkauften Artikeln. */
export async function listActive(db: SQLiteDatabase, sellerId: string): Promise<ReservationWithArticle[]> {
  await requireSeller(db, sellerId);
  const rows = await db.getAllAsync<ReservationRow>(
    `${SELECT_RESERVATION}
     WHERE r.status IN ('open', 'confirmed') AND a.status != 'sold'
     ORDER BY CASE r.status WHEN 'open' THEN 0 ELSE 1 END, r.created_at DESC`
  );
  return rows.map(toReservation);
}

export async function confirm(db: SQLiteDatabase, sellerId: string, id: string): Promise<void> {
  await requireSeller(db, sellerId);
  await db.withTransactionAsync(async () => {
    const reservation = await db.getFirstAsync<{ article_id: string }>(
      'SELECT article_id FROM reservations WHERE id = ?',
      id
    );
    if (!reservation) throw new ReservationError('Reservation nicht gefunden.');
    await db.runAsync("UPDATE reservations SET status = 'confirmed' WHERE id = ?", id);
    await db.runAsync(
      "UPDATE reservations SET status = 'rejected' WHERE article_id = ? AND id != ? AND status = 'open'",
      reservation.article_id,
      id
    );
  });
}

export async function reject(db: SQLiteDatabase, sellerId: string, id: string): Promise<void> {
  await requireSeller(db, sellerId);
  await db.withTransactionAsync(async () => {
    const reservation = await db.getFirstAsync<{ article_id: string }>(
      'SELECT article_id FROM reservations WHERE id = ?',
      id
    );
    if (!reservation) throw new ReservationError('Reservation nicht gefunden.');
    await db.runAsync("UPDATE reservations SET status = 'rejected' WHERE id = ?", id);
    const active = await db.getFirstAsync<{ n: number }>(
      "SELECT COUNT(*) AS n FROM reservations WHERE article_id = ? AND status IN ('open', 'confirmed')",
      reservation.article_id
    );
    if ((active?.n ?? 0) === 0) {
      await db.runAsync(
        "UPDATE articles SET status = 'available', updated_at = ? WHERE id = ? AND status = 'reserved'",
        new Date().toISOString(),
        reservation.article_id
      );
    }
  });
}

export async function remove(db: SQLiteDatabase, sellerId: string, id: string): Promise<void> {
  await requireSeller(db, sellerId);
  await db.runAsync('DELETE FROM reservations WHERE id = ?', id);
}
