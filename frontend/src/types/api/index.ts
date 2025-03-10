
/**
 * 基础响应结构
 * @template T 数据类型泛型
 */
export interface BaseResponse<T = any> {
  code: number;    // 业务状态码
  data: T;         // 响应数据
  message?: string; // 可选错误信息
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;   // 页码
  size?: number;   // 每页数量
  [key: string]: any; // 其他查询参数
}

/**
 * 分页结果
 * @template T 数据类型泛型
 */
export interface PaginationResult<T> {
  items: T[];      // 数据列表
  total: number;    // 总条数
  currentPage: number; // 当前页码
}