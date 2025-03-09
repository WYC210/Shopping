// src/api/comment.ts
import { httpClient } from '@/utils/request';
import { BaseCrudService } from './base';
import type { Comment, CommentStats } from '@/types/api/comment.ts';
import type { AddCommentParams } from '@/types/api/comment';
import type { PaginationResult } from '@/types/api';
import type { PaginationParams } from '@/types/api';

export class CommentService extends BaseCrudService<Comment> {
  constructor() {
    super('/comments', httpClient);
  }

  //获取特定商品的评论
  async getProductComments(
    productId: string, 
    params: PaginationParams
  ): Promise<PaginationResult<Comment>> {
    return this.request({
      method: 'GET',
      url: '/comments',
      params: { productId, ...params }
    });
  }
  //添加新评论
  async addComment(data: AddCommentParams): Promise<Comment> {
    if (!data.content?.trim()) throw new Error('评论内容不能为空');
    return this.create(data);
  }
  
}

export const commentService = new CommentService();