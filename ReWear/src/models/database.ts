import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { createPasswordHash } from './SellerModel';
import type { Category, ColorKey, Condition, Department, Usage } from './types';

export const DATABASE_NAME = 'rewear.db';
const DATABASE_VERSION = 2;

// Demo-Zugang für den lokalen Prototyp (wird später durch Backend-Auth ersetzt).
export const DEMO_SELLER = {
  email: 'verkaeufer@rewear.ch',
  password: 'ReWear2026!',
  displayName: 'Rodrigo',
};

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // foreign_keys gilt pro Verbindung und muss bei jedem Start gesetzt werden.
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = result?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS sellers (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        department TEXT NOT NULL CHECK (department IN ('women', 'men', 'kids')),
        category TEXT NOT NULL CHECK (category IN ('clothing', 'shoes', 'accessories')),
        subcategory TEXT NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        brand TEXT,
        condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'used', 'defects')),
        price REAL NOT NULL CHECK (price > 0),
        description TEXT,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
        sold_price REAL,
        sold_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS article_usages (
        article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        usage TEXT NOT NULL CHECK (usage IN ('winter', 'summer', 'sport', 'all_year')),
        PRIMARY KEY (article_id, usage)
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY NOT NULL,
        article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        buyer_name TEXT NOT NULL,
        buyer_contact TEXT NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'confirmed', 'rejected')),
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_articles_status_created ON articles(status, created_at);
      CREATE INDEX IF NOT EXISTS idx_articles_catalog ON articles(department, category, subcategory);
      CREATE INDEX IF NOT EXISTS idx_articles_sold_at ON articles(sold_at);
      CREATE INDEX IF NOT EXISTS idx_reservations_article ON reservations(article_id);
    `);
    await seed(db);
    currentVersion = 1;
  }

  if (currentVersion === 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS article_images (
        article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        uri TEXT NOT NULL,
        PRIMARY KEY (article_id, position)
      );
      INSERT INTO article_images (article_id, position, uri)
        SELECT id, 0, image_url FROM articles WHERE image_url IS NOT NULL;
      ALTER TABLE articles DROP COLUMN image_url;
    `);
    await seedImages(db);
    currentVersion = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

type SeedArticle = {
  title: string;
  department: Department;
  category: Category;
  subcategory: string;
  size: string;
  color: ColorKey;
  usage: Usage[];
  brand: string | null;
  condition: Condition;
  price: number;
  description: string;
  daysAgo: number;
  images: string[];
  sold?: { price: number; daysAgo: number };
  reservedBy?: { name: string; contact: string; message: string };
};

// Beispielfotos von Wikimedia Commons (freie Lizenzen), werden nur per URL angezeigt.
const WIKIMEDIA = 'https://upload.wikimedia.org/wikipedia/commons';

const SEED_ARTICLES: SeedArticle[] = [
  {
    title: 'Nike Air Max 90',
    department: 'men',
    category: 'shoes',
    subcategory: 'Sneaker',
    size: '42',
    color: 'white',
    usage: ['all_year', 'sport'],
    brand: 'Nike',
    condition: 'like_new',
    price: 65,
    description: 'Kaum getragen, Originalkarton vorhanden.',
    daysAgo: 0,
    images: [
      `${WIKIMEDIA}/thumb/f/fa/Nike_Air_Max_90_women_-_white.jpg/960px-Nike_Air_Max_90_women_-_white.jpg`,
      `${WIKIMEDIA}/thumb/b/b3/Nike_Air_Max_90.jpg/960px-Nike_Air_Max_90.jpg`,
      `${WIKIMEDIA}/thumb/a/ae/Air_max_90.JPG/960px-Air_max_90.JPG`,
    ],
  },
  {
    title: 'Wollmantel Camel',
    department: 'women',
    category: 'clothing',
    subcategory: 'Jacken & Mäntel',
    size: 'M',
    color: 'beige',
    usage: ['winter'],
    brand: 'COS',
    condition: 'good',
    price: 89,
    description: 'Zeitloser Mantel aus 80 % Wolle. Sehr warm, leicht tailliert.',
    daysAgo: 1,
    images: [
      `${WIKIMEDIA}/7/7f/Pierre_Balmain%2C_Swing_Coat_%281954-56%29_01.jpg`,
      `${WIKIMEDIA}/7/78/Pierre_Balmain%2C_Swing_Coat_%281954-56%29_02.jpg`,
      `${WIKIMEDIA}/f/fe/Pierre_Balmain%2C_Swing_Coat_%281954-56%29_03.jpg`,
    ],
  },
  {
    title: 'Merino Rollkragenpullover',
    department: 'men',
    category: 'clothing',
    subcategory: 'Pullover & Strick',
    size: 'L',
    color: 'grey',
    usage: ['winter'],
    brand: 'Uniqlo',
    condition: 'like_new',
    price: 28,
    description: 'Feine Merinowolle, kratzt nicht.',
    daysAgo: 2,
    images: [`${WIKIMEDIA}/thumb/a/a1/Grey_knitted_sweater.jpg/960px-Grey_knitted_sweater.jpg`],
  },
  {
    title: 'Leinenkleid Sommer',
    department: 'women',
    category: 'clothing',
    subcategory: 'Kleider & Röcke',
    size: 'S',
    color: 'green',
    usage: ['summer'],
    brand: 'Zara',
    condition: 'good',
    price: 24,
    description: 'Luftiges Leinenkleid, knielang.',
    daysAgo: 3,
    images: [
      `${WIKIMEDIA}/thumb/2/29/Green_Pleated_Linen_Dress%2C_%27Irish_Moss%27_by_Sybil_Connolly_-_Full_Length_Front.jpg/960px-Green_Pleated_Linen_Dress%2C_%27Irish_Moss%27_by_Sybil_Connolly_-_Full_Length_Front.jpg`,
      `${WIKIMEDIA}/thumb/5/5c/Green_Pleated_Linen_Dress%2C_%27Irish_Moss%27_by_Sybil_Connolly_-_Full_Length_Back.jpg/960px-Green_Pleated_Linen_Dress%2C_%27Irish_Moss%27_by_Sybil_Connolly_-_Full_Length_Back.jpg`,
    ],
    reservedBy: {
      name: 'Anna M.',
      contact: 'anna@example.ch',
      message: 'Kann ich es am Samstag abholen?',
    },
  },
  {
    title: 'Chelsea Boots Leder',
    department: 'women',
    category: 'shoes',
    subcategory: 'Stiefel',
    size: '39',
    color: 'brown',
    usage: ['winter', 'all_year'],
    brand: 'Dr. Martens',
    condition: 'used',
    price: 70,
    description: 'Echtleder, leichte Gebrauchsspuren an der Spitze.',
    daysAgo: 4,
    images: [
      `${WIKIMEDIA}/0/0a/VeggieChelseaBoots.jpg`,
      `${WIKIMEDIA}/thumb/8/8f/Chelsea_boot%2C_black.jpg/960px-Chelsea_boot%2C_black.jpg`,
      `${WIKIMEDIA}/thumb/6/64/Person_wearing_black_Chelsea_boots_on_a_textured_pavement.jpg/960px-Person_wearing_black_Chelsea_boots_on_a_textured_pavement.jpg`,
    ],
  },
  {
    title: 'Regenjacke Kinder',
    department: 'kids',
    category: 'clothing',
    subcategory: 'Jacken & Mäntel',
    size: '128',
    color: 'yellow',
    usage: ['all_year'],
    brand: 'Name It',
    condition: 'good',
    price: 18,
    description: 'Wasserdicht, mit Kapuze und Reflektoren.',
    daysAgo: 5,
    images: [`${WIKIMEDIA}/2/29/Yellow_Raincoat.jpg`],
  },
  {
    title: 'Laufschuhe Ultraboost',
    department: 'men',
    category: 'shoes',
    subcategory: 'Sportschuhe',
    size: '44',
    color: 'black',
    usage: ['sport'],
    brand: 'Adidas',
    condition: 'used',
    price: 45,
    description: 'Ca. 200 km gelaufen, Sohle noch gut.',
    daysAgo: 6,
    images: [`${WIKIMEDIA}/thumb/5/5a/Adidas_Ultra_Boost_4_running_shoes.jpeg/960px-Adidas_Ultra_Boost_4_running_shoes.jpeg`],
  },
  {
    title: 'Ledertasche Shopper',
    department: 'women',
    category: 'accessories',
    subcategory: 'Taschen',
    size: 'Einheitsgrösse',
    color: 'black',
    usage: ['all_year'],
    brand: null,
    condition: 'like_new',
    price: 55,
    description: 'Geräumiger Shopper mit Innenfach.',
    daysAgo: 8,
    images: [
      `${WIKIMEDIA}/thumb/a/a3/Leather_handbag_by_Les_cuirs_d%27Agathe_%28DSC07738%29.jpg/960px-Leather_handbag_by_Les_cuirs_d%27Agathe_%28DSC07738%29.jpg`,
      `${WIKIMEDIA}/thumb/1/13/Kelly_Bag.jpg/960px-Kelly_Bag.jpg`,
    ],
  },
  {
    title: 'Slim Fit Jeans',
    department: 'men',
    category: 'clothing',
    subcategory: 'Hosen & Jeans',
    size: 'M',
    color: 'blue',
    usage: ['all_year'],
    brand: "Levi's",
    condition: 'good',
    price: 32,
    description: '511 Slim, W32/L32.',
    daysAgo: 10,
    images: [
      `${WIKIMEDIA}/0/02/Blue_Jeans_from_the_rear.jpg`,
      `${WIKIMEDIA}/5/54/High_waisted_jeans_1435042736.jpg`,
    ],
  },
  {
    title: 'Strickmütze & Schal Set',
    department: 'kids',
    category: 'accessories',
    subcategory: 'Mützen & Schals',
    size: 'Einheitsgrösse',
    color: 'red',
    usage: ['winter'],
    brand: null,
    condition: 'new',
    price: 15,
    description: 'Ungetragen, Geschenk in falscher Grösse.',
    daysAgo: 12,
    images: [
      `${WIKIMEDIA}/thumb/4/4a/Beanie_-_Knit_Cap_%2851013511676%29.jpg/960px-Beanie_-_Knit_Cap_%2851013511676%29.jpg`,
      `${WIKIMEDIA}/thumb/b/b6/Blue_knit-cap_beanie_by_RobertLender.jpeg/960px-Blue_knit-cap_beanie_by_RobertLender.jpeg`,
    ],
  },
  {
    title: 'Daunenjacke Puffer',
    department: 'women',
    category: 'clothing',
    subcategory: 'Jacken & Mäntel',
    size: 'S',
    color: 'black',
    usage: ['winter'],
    brand: 'The North Face',
    condition: 'good',
    price: 120,
    description: 'Sehr warm, kleiner Fleck am Ärmel.',
    daysAgo: 40,
    images: [`${WIKIMEDIA}/thumb/e/e1/Men%27s_black_PVC_down_jacket_02.jpg/960px-Men%27s_black_PVC_down_jacket_02.jpg`],
    sold: { price: 110, daysAgo: 20 },
  },
  {
    title: 'Sandalen Birkenstock Arizona',
    department: 'women',
    category: 'shoes',
    subcategory: 'Sandalen',
    size: '38',
    color: 'brown',
    usage: ['summer'],
    brand: 'Birkenstock',
    condition: 'used',
    price: 35,
    description: 'Fussbett gut eingelaufen.',
    daysAgo: 120,
    images: [
      `${WIKIMEDIA}/thumb/a/a2/Birkenstock_Sandals_CNE_01.jpg/960px-Birkenstock_Sandals_CNE_01.jpg`,
      `${WIKIMEDIA}/thumb/3/37/Birkenstock_Sandals_CNE_02.jpg/960px-Birkenstock_Sandals_CNE_02.jpg`,
      `${WIKIMEDIA}/thumb/b/bc/Birkenstock_Sandals_CNE_03.jpg/960px-Birkenstock_Sandals_CNE_03.jpg`,
    ],
    sold: { price: 30, daysAgo: 95 },
  },
  {
    title: 'Ledergürtel klassisch',
    department: 'men',
    category: 'accessories',
    subcategory: 'Gürtel',
    size: 'Einheitsgrösse',
    color: 'brown',
    usage: ['all_year'],
    brand: 'Tommy Hilfiger',
    condition: 'good',
    price: 20,
    description: 'Länge 95 cm.',
    daysAgo: 300,
    images: [
      `${WIKIMEDIA}/4/46/Belt_%28clothing%29.jpg`,
      `${WIKIMEDIA}/thumb/9/91/Belt-clothing.jpg/960px-Belt-clothing.jpg`,
    ],
    sold: { price: 20, daysAgo: 250 },
  },
];

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function seed(db: SQLiteDatabase) {
  const { hash, salt } = await createPasswordHash(DEMO_SELLER.password);
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO sellers (id, email, display_name, password_hash, password_salt, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    Crypto.randomUUID(),
    DEMO_SELLER.email,
    DEMO_SELLER.displayName,
    hash,
    salt,
    now
  );

  for (const a of SEED_ARTICLES) {
    const id = Crypto.randomUUID();
    const createdAt = isoDaysAgo(a.daysAgo);
    const status = a.sold ? 'sold' : a.reservedBy ? 'reserved' : 'available';
    await db.runAsync(
      `INSERT INTO articles (id, title, department, category, subcategory, size, color, brand,
         condition, price, description, image_url, status, sold_price, sold_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)`,
      id,
      a.title,
      a.department,
      a.category,
      a.subcategory,
      a.size,
      a.color,
      a.brand,
      a.condition,
      a.price,
      a.description,
      status,
      a.sold?.price ?? null,
      a.sold ? isoDaysAgo(a.sold.daysAgo) : null,
      createdAt,
      createdAt
    );
    for (const usage of a.usage) {
      await db.runAsync('INSERT INTO article_usages (article_id, usage) VALUES (?, ?)', id, usage);
    }
    if (a.reservedBy) {
      await db.runAsync(
        `INSERT INTO reservations (id, article_id, buyer_name, buyer_contact, message, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'open', ?)`,
        Crypto.randomUUID(),
        id,
        a.reservedBy.name,
        a.reservedBy.contact,
        a.reservedBy.message,
        now
      );
    }
  }
}

/** Hängt die Beispielfotos an die Demo-Artikel (auch bei bestehenden Installationen). */
async function seedImages(db: SQLiteDatabase) {
  for (const a of SEED_ARTICLES) {
    const rows = await db.getAllAsync<{ id: string }>(
      `SELECT id FROM articles
       WHERE title = ? AND NOT EXISTS (SELECT 1 FROM article_images i WHERE i.article_id = articles.id)`,
      a.title
    );
    for (const { id } of rows) {
      for (const [position, uri] of a.images.entries()) {
        await db.runAsync(
          'INSERT INTO article_images (article_id, position, uri) VALUES (?, ?, ?)',
          id,
          position,
          uri
        );
      }
    }
  }
}
