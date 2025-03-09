// src/types/api/category.type.ts
export interface Category {
  id: string;
  name: string;
  children?: Category[];
}

export interface CategoryResponse {
  status: string;
  data: Category[];
}

