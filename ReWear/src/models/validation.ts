import { sizesFor, subcategoriesOf } from './catalog';
import type { Category, ColorKey, Condition, Department, Usage } from './types';

export type ValidationErrors<K extends string> = Partial<Record<K, string>>;

export interface ArticleFormValues {
  title: string;
  brand: string;
  department?: Department;
  category?: Category;
  subcategory?: string;
  size?: string;
  color?: ColorKey;
  condition?: Condition;
  usage: Usage[];
  price: string;
  description: string;
  imageUrl: string | null;
}

export function parsePrice(value: string): number | null {
  const normalized = value.trim().replace(/['’\s]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Number(normalized);
}

export function validateArticle(v: ArticleFormValues): ValidationErrors<keyof ArticleFormValues> {
  const errors: ValidationErrors<keyof ArticleFormValues> = {};
  const title = v.title.trim();
  if (title.length < 3) errors.title = 'Bitte einen Titel mit mindestens 3 Zeichen eingeben.';
  else if (title.length > 80) errors.title = 'Der Titel darf höchstens 80 Zeichen lang sein.';
  if (v.brand.trim().length > 40) errors.brand = 'Die Marke darf höchstens 40 Zeichen lang sein.';
  if (!v.department) errors.department = 'Bitte eine Abteilung wählen.';
  if (!v.category) errors.category = 'Bitte eine Kategorie wählen.';
  if (!v.subcategory || !subcategoriesOf(v.category).includes(v.subcategory)) {
    errors.subcategory = 'Bitte eine Unterkategorie wählen.';
  }
  if (!v.size || !sizesFor(v.department, v.category).includes(v.size)) {
    errors.size = 'Bitte eine Grösse wählen.';
  }
  if (!v.color) errors.color = 'Bitte eine Farbe wählen.';
  if (!v.condition) errors.condition = 'Bitte den Zustand wählen.';
  if (v.usage.length === 0) errors.usage = 'Bitte mindestens eine Verwendung wählen.';
  const price = parsePrice(v.price);
  if (price === null || price <= 0) errors.price = 'Bitte einen gültigen Preis grösser als 0 eingeben.';
  else if (price > 10000) errors.price = 'Der Preis darf höchstens CHF 10’000 betragen.';
  if (v.description.trim().length > 1000) {
    errors.description = 'Die Beschreibung darf höchstens 1000 Zeichen lang sein.';
  }
  return errors;
}

export interface ReservationFormValues {
  buyerName: string;
  buyerContact: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\+?[0-9\s/-]{9,20}$/;

export function validateReservation(
  v: ReservationFormValues
): ValidationErrors<keyof ReservationFormValues> {
  const errors: ValidationErrors<keyof ReservationFormValues> = {};
  const name = v.buyerName.trim();
  if (name.length < 2) errors.buyerName = 'Bitte deinen Namen eingeben.';
  else if (name.length > 60) errors.buyerName = 'Der Name darf höchstens 60 Zeichen lang sein.';
  const contact = v.buyerContact.trim();
  if (!EMAIL_REGEX.test(contact) && !PHONE_REGEX.test(contact)) {
    errors.buyerContact = 'Bitte eine gültige E-Mail-Adresse oder Telefonnummer eingeben.';
  }
  if (v.message.trim().length > 500) errors.message = 'Die Nachricht darf höchstens 500 Zeichen lang sein.';
  return errors;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export function validateLogin(v: LoginFormValues): ValidationErrors<keyof LoginFormValues> {
  const errors: ValidationErrors<keyof LoginFormValues> = {};
  if (!EMAIL_REGEX.test(v.email.trim())) errors.email = 'Bitte eine gültige E-Mail-Adresse eingeben.';
  if (v.password.length === 0) errors.password = 'Bitte das Passwort eingeben.';
  return errors;
}

/** Erwartet das Format TT.MM.JJJJ und liefert ein Datum (lokale Zeit) oder null. */
export function parseSwissDate(value: string): Date | null {
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}
