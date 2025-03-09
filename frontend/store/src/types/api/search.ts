// src/types/api/search.type.ts
export interface SearchResult {
  type: 'product' | 'article';
  id: string;
  title: string;
  description: string;
}
