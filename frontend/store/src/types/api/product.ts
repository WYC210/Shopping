import type { Category } from '@/types/store/HomeType';

export interface Product {
  productId: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  sales?: number;
  createTime?: string;
  stock?: number;
}

export interface ProductResponse {
  list: Product[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

export interface PaginationParams {
  page: number;
  size: number;
  category?: string | null;
  minPrice?: number;
  maxPrice?: number;
  hasStock?: boolean;
  hasDiscount?: boolean;
}

export interface PaginationResult<T> {
  list?: T[];
  data?: T[];
  items?: T[];
  total: number;
  currentPage: number;
}

export interface CategoryResponse {
  categories: Category[];
}
