import type { Category } from '@/types/store/HomeType';

export interface Product {
  productId: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl: string;
  sales?: number;
  createTime?: string;
  stock: number;
  status: number;
  isActive?: number;
  rating?: number;
  reviewCount?: number;
  tags: string;
  categoryId: string;
  brand: string;
}

export interface ProductResponse {
  data: Product[];
  list: Product[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  categoryId?: string;
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

export interface ProductDetail extends Product {
  stock: number;
  brand?: string;
  categoryId?: string;
  description?: string;
  images?: string[];
}
