// src/api/search.ts
import { httpClient } from '@/utils/request.ts';
import { BaseCrudService } from './base.ts';
import type { SearchResult } from '@/types/api/search.ts';
import type { PaginationParams,PaginationResult } from '@/types/api/comment.ts';



export class SearchService extends BaseCrudService<SearchResult> {
  constructor() {
    super('/search', httpClient);
  }
  //根据关键字和分页参数进行全局搜索
  async globalSearch(
    keyword: string,
    params: PaginationParams
  ): Promise<PaginationResult<SearchResult>> {
    return this.request({
      method: 'GET',
      url: '/global',
      params: { keyword, ...params }
    });
  }
  //获取热门关键词
  async getHotKeywords(limit = 10): Promise<string[]> {
    return this.request({
      method: 'GET',
      url: '/hot',
      params: { limit }
    });
  }
}

export const searchService = new SearchService();