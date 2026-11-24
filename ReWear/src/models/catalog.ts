import type {
  ArticleStatus,
  Category,
  ColorKey,
  Condition,
  Department,
  ReservationStatus,
  Usage,
} from './types';

export const DEPARTMENTS: { key: Department; label: string }[] = [
  { key: 'women', label: 'Damen' },
  { key: 'men', label: 'Herren' },
  { key: 'kids', label: 'Kinder' },
];

export const CATEGORIES: { key: Category; label: string; subcategories: string[] }[] = [
  {
    key: 'clothing',
    label: 'Bekleidung',
    subcategories: [
      'Jacken & Mäntel',
      'Pullover & Strick',
      'T-Shirts & Tops',
      'Hosen & Jeans',
      'Kleider & Röcke',
    ],
  },
  {
    key: 'shoes',
    label: 'Schuhe',
    subcategories: ['Sneaker', 'Stiefel', 'Halbschuhe', 'Sandalen', 'Sportschuhe'],
  },
  {
    key: 'accessories',
    label: 'Accessoires',
    subcategories: ['Taschen', 'Mützen & Schals', 'Gürtel'],
  },
];

export const CONDITIONS: { key: Condition; label: string }[] = [
  { key: 'new', label: 'Neu' },
  { key: 'like_new', label: 'Wie neu' },
  { key: 'good', label: 'Gut' },
  { key: 'used', label: 'Gebrauchsspuren' },
  { key: 'defects', label: 'Kleine Defekte' },
];

export const USAGES: { key: Usage; label: string }[] = [
  { key: 'winter', label: 'Winter' },
  { key: 'summer', label: 'Sommer' },
  { key: 'sport', label: 'Sport' },
  { key: 'all_year', label: 'Ganzjährig' },
];

export const COLORS: { key: ColorKey; label: string; hex: string }[] = [
  { key: 'black', label: 'Schwarz', hex: '#1F1F1F' },
  { key: 'white', label: 'Weiss', hex: '#FAFAFA' },
  { key: 'grey', label: 'Grau', hex: '#9A9A9A' },
  { key: 'beige', label: 'Beige', hex: '#D9C7A7' },
  { key: 'brown', label: 'Braun', hex: '#7A5236' },
  { key: 'blue', label: 'Blau', hex: '#2F5D9A' },
  { key: 'green', label: 'Grün', hex: '#3F7A4E' },
  { key: 'red', label: 'Rot', hex: '#B83A32' },
  { key: 'pink', label: 'Rosa', hex: '#E8A6B8' },
  { key: 'yellow', label: 'Gelb', hex: '#E7C24A' },
  { key: 'orange', label: 'Orange', hex: '#E07B39' },
  { key: 'purple', label: 'Violett', hex: '#7A4E9A' },
  { key: 'multi', label: 'Mehrfarbig', hex: '#C9A27E' },
];

export const ARTICLE_STATUS: Record<ArticleStatus, string> = {
  available: 'Verfügbar',
  reserved: 'Reserviert',
  sold: 'Verkauft',
};

export const RESERVATION_STATUS: Record<ReservationStatus, string> = {
  open: 'Offen',
  confirmed: 'Bestätigt',
  rejected: 'Abgelehnt',
};

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = Array.from({ length: 14 }, (_, i) => String(35 + i));
const KIDS_SIZES = ['92', '98', '104', '110', '116', '122', '128', '134', '140', '146', '152', '158', '164'];
const KIDS_SHOE_SIZES = Array.from({ length: 16 }, (_, i) => String(20 + i));
const ONE_SIZE = ['Einheitsgrösse'];

export function sizesFor(department?: Department, category?: Category): string[] {
  if (category === 'accessories') return ONE_SIZE;
  if (category === 'shoes') {
    if (department === 'kids') return KIDS_SHOE_SIZES;
    if (department) return SHOE_SIZES;
    return unique([...KIDS_SHOE_SIZES, ...SHOE_SIZES]);
  }
  if (category === 'clothing') {
    if (department === 'kids') return KIDS_SIZES;
    if (department) return CLOTHING_SIZES;
    return [...CLOTHING_SIZES, ...KIDS_SIZES];
  }
  return unique([...CLOTHING_SIZES, ...KIDS_SIZES, ...KIDS_SHOE_SIZES, ...SHOE_SIZES, ...ONE_SIZE]);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export const labelOf = {
  department: (key: Department) => DEPARTMENTS.find((d) => d.key === key)?.label ?? key,
  category: (key: Category) => CATEGORIES.find((c) => c.key === key)?.label ?? key,
  condition: (key: Condition) => CONDITIONS.find((c) => c.key === key)?.label ?? key,
  usage: (key: Usage) => USAGES.find((u) => u.key === key)?.label ?? key,
  color: (key: ColorKey) => COLORS.find((c) => c.key === key)?.label ?? key,
};

export function colorHex(key: ColorKey): string {
  return COLORS.find((c) => c.key === key)?.hex ?? '#CCCCCC';
}

export function subcategoriesOf(category?: Category): string[] {
  return CATEGORIES.find((c) => c.key === category)?.subcategories ?? [];
}
