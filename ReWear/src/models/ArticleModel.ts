import * as Crypto from 'expo-crypto';
import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';

import { sizesFor } from './catalog';
import { deleteImage } from './ImageStorage';
import { requireSeller } from './SellerModel';
import type {
  Article,
  ArticleInput,
  ArticleStatus,
  Category,
  Department,
  SearchParams,
  Usage,
} from './types';

type ArticleRow = {
  id: string;
  title: string;
  department: Article['department'];
  category: Article['category'];
  subcategory: string;
  size: string;
  color: Article['color'];
  brand: string | null;
  condition: Article['condition'];
  price: number;
  description: string | null;
  image_url: string | null;
  status: ArticleStatus;
  sold_price: number | null;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
  usage_list: string | null;
};

const SELECT_ARTICLE = `
  SELECT a.*, (SELECT GROUP_CONCAT(u.usage) FROM article_usages u WHERE u.article_id = a.id) AS usage_list
  FROM articles a`;

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    category: row.category,
    subcategory: row.subcategory,
    size: row.size,
    color: row.color,
    usage: (row.usage_list ? row.usage_list.split(',') : []) as Usage[],
    brand: row.brand,
    condition: row.condition,
    price: row.price,
    description: row.description,
    imageUrl: row.image_url,
    status: row.status,
    soldPrice: row.sold_price,
    soldAt: row.sold_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function placeholders(count: number): string {
  return Array.from({ length: count }, () => '?').join(', ');
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function buildWhere(params: SearchParams): { sql: string; values: SQLiteBindValue[] } {
  const clauses = ["a.status != 'sold'"];
  const values: SQLiteBindValue[] = [];

  if (params.department) {
    clauses.push('a.department = ?');
    values.push(params.department);
  }
  if (params.category) {
    clauses.push('a.category = ?');
    values.push(params.category);
  }
  if (params.subcategory) {
    clauses.push('a.subcategory = ?');
    values.push(params.subcategory);
  }
  const query = params.query?.trim();
  if (query) {
    clauses.push("(a.title LIKE ? ESCAPE '\\' OR a.brand LIKE ? ESCAPE '\\')");
    const pattern = `%${escapeLike(query)}%`;
    values.push(pattern, pattern);
  }
  const f = params.filters;
  if (f?.conditions.length) {
    clauses.push(`a.condition IN (${placeholders(f.conditions.length)})`);
    values.push(...f.conditions);
  }
  if (f?.sizes.length) {
    clauses.push(`a.size IN (${placeholders(f.sizes.length)})`);
    values.push(...f.sizes);
  }
  if (f?.colors.length) {
    clauses.push(`a.color IN (${placeholders(f.colors.length)})`);
    values.push(...f.colors);
  }
  if (f?.usages.length) {
    clauses.push(
      `EXISTS (SELECT 1 FROM article_usages u WHERE u.article_id = a.id AND u.usage IN (${placeholders(f.usages.length)}))`
    );
    values.push(...f.usages);
  }
  return { sql: clauses.join(' AND '), values };
}

const ORDER_BY: Record<NonNullable<SearchParams['sort']>, string> = {
  newest: 'a.created_at DESC',
  price_asc: 'a.price ASC, a.created_at DESC',
  price_desc: 'a.price DESC, a.created_at DESC',
};

// ---------- Lesen (für alle) ----------

export async function listLatest(db: SQLiteDatabase, limit = 40): Promise<Article[]> {
  const rows = await db.getAllAsync<ArticleRow>(
    `${SELECT_ARTICLE} WHERE a.status != 'sold' ORDER BY a.created_at DESC LIMIT ?`,
    limit
  );
  return rows.map(toArticle);
}

export async function search(db: SQLiteDatabase, params: SearchParams): Promise<Article[]> {
  const where = buildWhere(params);
  const rows = await db.getAllAsync<ArticleRow>(
    `${SELECT_ARTICLE} WHERE ${where.sql} ORDER BY ${ORDER_BY[params.sort ?? 'newest']}`,
    where.values
  );
  return rows.map(toArticle);
}

export async function count(db: SQLiteDatabase, params: SearchParams): Promise<number> {
  const where = buildWhere(params);
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM articles a WHERE ${where.sql}`,
    where.values
  );
  return row?.n ?? 0;
}

/** Grössen, die bei der aktuellen Auswahl (ohne Grössenfilter) tatsächlich vorkommen. */
export async function availableSizes(db: SQLiteDatabase, params: SearchParams): Promise<string[]> {
  const where = buildWhere({
    ...params,
    filters: params.filters ? { ...params.filters, sizes: [] } : undefined,
  });
  const rows = await db.getAllAsync<{ size: string }>(
    `SELECT DISTINCT a.size AS size FROM articles a WHERE ${where.sql}`,
    where.values
  );
  const order = sizesFor(params.department, params.category);
  const rank = (s: string) => {
    const i = order.indexOf(s);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return rows.map((r) => r.size).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export async function countByCategory(
  db: SQLiteDatabase,
  department?: Department
): Promise<Record<string, number>> {
  const rows = await db.getAllAsync<{ key: string; n: number }>(
    `SELECT category AS key, COUNT(*) AS n FROM articles
     WHERE status != 'sold' AND (?1 IS NULL OR department = ?1)
     GROUP BY category`,
    department ?? null
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.n]));
}

export async function countBySubcategory(
  db: SQLiteDatabase,
  category: Category,
  department?: Department
): Promise<Record<string, number>> {
  const rows = await db.getAllAsync<{ key: string; n: number }>(
    `SELECT subcategory AS key, COUNT(*) AS n FROM articles
     WHERE status != 'sold' AND category = ?1 AND (?2 IS NULL OR department = ?2)
     GROUP BY subcategory`,
    category,
    department ?? null
  );
  return Object.fromEntries(rows.map((r) => [r.key, r.n]));
}

export async function getById(db: SQLiteDatabase, id: string): Promise<Article | null> {
  const row = await db.getFirstAsync<ArticleRow>(`${SELECT_ARTICLE} WHERE a.id = ?`, id);
  return row ? toArticle(row) : null;
}

export async function getByIds(db: SQLiteDatabase, ids: string[]): Promise<Article[]> {
  if (ids.length === 0) return [];
  const rows = await db.getAllAsync<ArticleRow>(
    `${SELECT_ARTICLE} WHERE a.id IN (${placeholders(ids.length)})`,
    ids
  );
  const byId = new Map(rows.map((r) => [r.id, toArticle(r)]));
  return ids.map((id) => byId.get(id)).filter((a): a is Article => !!a);
}

// ---------- Verkäufer ----------

export async function listAllForSeller(db: SQLiteDatabase, sellerId: string): Promise<Article[]> {
  await requireSeller(db, sellerId);
  const rows = await db.getAllAsync<ArticleRow>(
    `${SELECT_ARTICLE}
     ORDER BY CASE a.status WHEN 'reserved' THEN 0 WHEN 'available' THEN 1 ELSE 2 END, a.created_at DESC`
  );
  return rows.map(toArticle);
}

export async function listSold(
  db: SQLiteDatabase,
  sellerId: string,
  fromIso: string,
  toIso: string
): Promise<Article[]> {
  await requireSeller(db, sellerId);
  const rows = await db.getAllAsync<ArticleRow>(
    `${SELECT_ARTICLE} WHERE a.status = 'sold' AND a.sold_at >= ? AND a.sold_at <= ?
     ORDER BY a.sold_at DESC`,
    fromIso,
    toIso
  );
  return rows.map(toArticle);
}

async function writeUsages(db: SQLiteDatabase, articleId: string, usages: Usage[]) {
  await db.runAsync('DELETE FROM article_usages WHERE article_id = ?', articleId);
  for (const usage of usages) {
    await db.runAsync('INSERT INTO article_usages (article_id, usage) VALUES (?, ?)', articleId, usage);
  }
}

export async function create(db: SQLiteDatabase, sellerId: string, input: ArticleInput): Promise<string> {
  await requireSeller(db, sellerId);
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO articles (id, title, department, category, subcategory, size, color, brand,
         condition, price, description, image_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
      id,
      input.title,
      input.department,
      input.category,
      input.subcategory,
      input.size,
      input.color,
      input.brand,
      input.condition,
      input.price,
      input.description,
      input.imageUrl,
      now,
      now
    );
    await writeUsages(db, id, input.usage);
  });
  return id;
}

export async function update(
  db: SQLiteDatabase,
  sellerId: string,
  id: string,
  input: ArticleInput
): Promise<void> {
  await requireSeller(db, sellerId);
  const previous = await getById(db, id);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE articles SET title = ?, department = ?, category = ?, subcategory = ?, size = ?, color = ?,
         brand = ?, condition = ?, price = ?, description = ?, image_url = ?, updated_at = ?
       WHERE id = ?`,
      input.title,
      input.department,
      input.category,
      input.subcategory,
      input.size,
      input.color,
      input.brand,
      input.condition,
      input.price,
      input.description,
      input.imageUrl,
      new Date().toISOString(),
      id
    );
    await writeUsages(db, id, input.usage);
  });
  if (previous?.imageUrl && previous.imageUrl !== input.imageUrl) {
    deleteImage(previous.imageUrl);
  }
}

export async function updateStatus(
  db: SQLiteDatabase,
  sellerId: string,
  id: string,
  status: ArticleStatus,
  soldPrice?: number
): Promise<void> {
  await requireSeller(db, sellerId);
  const now = new Date().toISOString();
  if (status === 'sold') {
    await db.runAsync(
      `UPDATE articles SET status = 'sold', sold_price = COALESCE(?, price), sold_at = ?, updated_at = ?
       WHERE id = ?`,
      soldPrice ?? null,
      now,
      now,
      id
    );
    return;
  }
  await db.runAsync(
    'UPDATE articles SET status = ?, sold_price = NULL, sold_at = NULL, updated_at = ? WHERE id = ?',
    status,
    now,
    id
  );
}

export async function remove(db: SQLiteDatabase, sellerId: string, id: string): Promise<void> {
  await requireSeller(db, sellerId);
  const article = await getById(db, id);
  await db.runAsync('DELETE FROM articles WHERE id = ?', id);
  if (article?.imageUrl) deleteImage(article.imageUrl);
}
