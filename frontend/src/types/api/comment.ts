
export interface Comment {
  id: string;
  content: string;
  rating: number;
  productId: string;
  userId: string;
}

export interface AddCommentParams {
  productId: string;
  content: string;
  rating: number;
}

export interface CommentStats {
  averageRating: number;
  totalComments: number;
}


export interface PaginationParams {
  page?: number;   // 当前页码，默认为1
  size?: number;   // 每页数量，默认为10
  [key: string]: any; // 其他可选的查询参数
}
export interface PaginationResult<T> {
  items: T[];          // 数据列表，类型为 T
  total: number;       // 总条数
  currentPage: number; // 当前页码
}