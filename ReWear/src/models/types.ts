export type Department = 'women' | 'men' | 'kids';
export type Category = 'clothing' | 'shoes' | 'accessories';
export type Condition = 'new' | 'like_new' | 'good' | 'used' | 'defects';
export type Usage = 'winter' | 'summer' | 'sport' | 'all_year';
export type ColorKey =
  | 'black'
  | 'white'
  | 'grey'
  | 'beige'
  | 'brown'
  | 'blue'
  | 'green'
  | 'red'
  | 'pink'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'multi';
export type ArticleStatus = 'available' | 'reserved' | 'sold';
export type ReservationStatus = 'open' | 'confirmed' | 'rejected';
export type SortOrder = 'newest' | 'price_asc' | 'price_desc';

export interface Article {
  id: string;
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
  description: string | null;
  imageUrl: string | null;
  status: ArticleStatus;
  soldPrice: number | null;
  soldAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ArticleInput = Omit<
  Article,
  'id' | 'status' | 'soldPrice' | 'soldAt' | 'createdAt' | 'updatedAt'
>;

export interface Reservation {
  id: string;
  articleId: string;
  buyerName: string;
  buyerContact: string;
  message: string | null;
  status: ReservationStatus;
  createdAt: string;
}

export interface ReservationWithArticle extends Reservation {
  articleTitle: string;
  articlePrice: number;
  articleImageUrl: string | null;
  articleStatus: ArticleStatus;
}

export type ReservationInput = Pick<Reservation, 'articleId' | 'buyerName' | 'buyerContact' | 'message'>;

export interface ArticleFilters {
  conditions: Condition[];
  sizes: string[];
  usages: Usage[];
  colors: ColorKey[];
}

export interface SearchParams {
  department?: Department;
  category?: Category;
  subcategory?: string;
  query?: string;
  filters?: ArticleFilters;
  sort?: SortOrder;
}

export interface Seller {
  id: string;
  email: string;
  displayName: string;
}

export const EMPTY_FILTERS: ArticleFilters = { conditions: [], sizes: [], usages: [], colors: [] };
