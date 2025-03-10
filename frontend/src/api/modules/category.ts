// src/api/category.ts
import { httpClient } from '@/utils/request';
import { BaseCrudService } from './base';
import type { CategoryResponse } from '@/types/api/category';

export class CategoryService extends BaseCrudService {
  constructor() {
    super('/categories', httpClient);
  }

  async getCategoryTree(): Promise<CategoryResponse> {
    return this.request<CategoryResponse>({ 
      method: 'GET', 
      url: '' 
    });
  }
}

export const categoryService = new CategoryService();