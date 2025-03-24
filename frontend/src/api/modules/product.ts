// src/api/modules/product.ts
import { BaseApiService } from './base';
import { httpClient } from '@/utils/request';
import type { Product, ProductResponse, PaginationParams } from '@/types/api/product';

interface ProductSearchParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string | null;
  sortField?: string;
  sortOrder?: string;
  imageUrl?: string;
}

interface ProductDetailParams {
  includeOptions?: boolean;
  includeComments?: boolean;
}

// 商品创建/更新的数据接口
export interface ProductData {
  name: string;
  price: number;
  description: string;
  stock: number;
  imageUrl: string;
  categoryId: string;
}

// 商品详情响应接口
interface ProductDetailResponse {
  data: {
    product: Product;
    images: string[];
  };
  status: number;
  message?: string;
}



// 评论接口
interface ReviewRequest {
  content: string;
  rating: number;
}

interface Review {
  reviewId: string;
  productId: string;
  userId: string;
  content: string;
  rating: number;
  createdTime: string;
  modifiedTime: string;
}

interface ReviewResponse {
  records: Review[];
  total: number;
  page: number;
  size: number;
}

/**
 * 商品服务
 * - 管理商品信息查询
 * - 处理商品上下架
 */
export class ProductService extends BaseApiService<Product> {
  constructor() {
    super('/products', httpClient);
  }

  /**
   * 获取所有商品列表
   */
  async getProducts(params?: ProductSearchParams): Promise<ProductResponse> {
    const queryParams = new URLSearchParams();
    
    // 修改分页参数名称
    if (params?.pageNum) queryParams.append('pageNum', params.pageNum.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    
    // 添加其他查询参数
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.sortField) queryParams.append('sortField', params.sortField);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.request<ProductResponse>({
      method: 'GET',
      url: `?${queryParams.toString()}`
    });
  }

  /**
   * 获取我的商品列表
   */
  async getMyProducts(params?: { page: number; size: number }, headers?: Record<string, string>): Promise<ProductResponse> {
    return this.request<ProductResponse>({
      method: 'GET',
      url: '/my/products', // 这里是获取我的商品的接口
      params,
      headers
    });
  }

  /**
   * 获取商品详情
   */
  async getProductDetail(productId: string): Promise<ProductDetailResponse> {
    if (!productId) throw new Error('商品ID不能为空');
    return this.request({
      url: `/${productId}`,
      method: 'GET'
    });
  }

  /**
   * 创建商品
   */
  async createProduct(data: ProductData & {
    productId?: string; // 可选字段
    brand?: string; // 可选字段
    tags?: string; // 可选字段
    imageUrl?: string; // 可选字段
    rating?: number; // 可选字段
    reviewCount?: number; // 可选字段
    modifiedUser?: string; // 可选字段
    modifiedTime?: string; // 可选字段
  }): Promise<any> {
    const requestBody = {
      productId: '', // 生成唯一的商品ID
      name: data.name,
      description: data.description || '',
      price: data.price,
      stock: data.stock,
      brand: data.brand || '',
      tags: data.tags || '',
      imageUrl: data.imageUrl || '',
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      isActive: 1,
      createdUser: 'currentUser', // 这里可以替换为当前用户的用户名
      createdTime: new Date().toISOString(),
      modifiedUser: 'currentUser', // 这里可以替换为当前用户的用户名
      modifiedTime: new Date().toISOString(),
      categoryId: data.categoryId // 确保这里是一个字符串
    };

    return this.request({
      url: '/create',
      method: 'POST',
      data: requestBody // 发送构造的请求体
    });
  }

  /**
   * 更新商品
   */
  async updateProduct(data: {
    productId: string;
    name?: string;
    price?: number;
    stock?: number;
    description?: string;
    brand?: string;
    tags?: string;
    imageUrl?: string;
    status?: number;  // 添加 status 字段
  }): Promise<any> {
    if (!data.productId) {
      throw new Error('商品ID不能为空');
    }

    return this.request({
      url: '/update',
      method: 'PUT',
      data,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,  // 添加认证头
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 下架商品
   */
  async deactivateProduct(productId: string): Promise<any> {
    if (!productId) throw new Error('商品ID不能为空');
    return this.request({
      url: `/${productId}`,
      method: 'PUT'
    });
  }

  /**
   * 上架商品
   */
  async activateProduct(productId: string): Promise<any> {
    if (!productId) throw new Error('商品ID不能为空');
    return this.request({
      url: `/create/${productId}`,
      method: 'PUT'
    });
  }

  /**
   * 删除商品
   */
  async deleteProduct(productId: string): Promise<any> {
    if (!productId) throw new Error('商品ID不能为空');
    return this.request({
      url: `/${productId}`,
      method: 'DELETE'
    });
  }

  /**
   * 搜索商品
   */
  async searchProducts(params: string | { keyword: string; pageNum?: number; pageSize?: number }) {
    // 如果参数是字符串，转换为对象格式
    const searchParams = typeof params === 'string' 
      ? { keyword: params }
      : params;

    return this.request({
      url: '/search',
      method: 'GET',
      params: searchParams // 使用对象格式的参数
    });
  }

  // 获取商品详细信息
  async getProductDetails(productId: string): Promise<Product> {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }
    return this.request({
      url: this.getUrl(`/${productId}/details`),
      method: 'GET',
      params: {
        includeOptions: true,
        includeComments: true
      } as ProductDetailParams
    });
  }

  // 获取商品图片
  async getProductImages(productId: string, limit: number = 5): Promise<string[]> {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }

    return this.request({
      url: this.getUrl(`/${productId}/images`),
      method: 'GET',
      params: { limit }
    });
  }

  // 获取最新评论
  async getLatestComments(productId: string, limit: number = 5): Promise<any[]> {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }

    return this.request({
      url: this.getUrl(`/${productId}/comments/latest`),
      method: 'GET',
      params: {
        limit,
        sort: 'createdTime,desc'
      }
    });
  }

  // 获取推荐商品
  async getRecommendedProducts(productId: string, limit: number = 5): Promise<Product[]> {
    return this.request({
      url: this.getUrl(`/${productId}/recommendations`),
      method: 'GET',
      params: { limit }
    });
  }

  // 辅助方法：构建完整URL
  private getUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  // 在 ProductService 类中添加 getAll 方法
  async getAll(params: any): Promise<ProductResponse> {
    return this.request<ProductResponse>({
      url: this.baseUrl,
      method: 'GET',
      params
    });
  }

  // 或者添加 getById 方法
  async getById(id: string): Promise<Product> {
    return this.request({
      url: this.getUrl(`/${id}`),
      method: 'GET'
    });
  }

  // 获取商品评论
  async getProductReviews(productId: string, page: number = 1, size: number = 20): Promise<ReviewResponse> {
    return this.request({
      url: `/${productId}/reviews`,
      method: 'GET',
      params: { page, size }
    });
  }

  // 添加评论
  async addReview(productId: string, data: ReviewRequest): Promise<any> {
    return this.request({
      url: `/${productId}/reviews`,
      method: 'POST',
      data
    });
  }

  // 删除评论
  async deleteReview(reviewId: string): Promise<any> {
    return this.request({
      url: `/reviews/${reviewId}`,
      method: 'DELETE'
    });
  }

  async getAllProducts(params: { page: number; size: number; categoryId?: string }): Promise<ProductResponse> {
    const response = await httpClient.get('/products/all', { params });
    return response.data; // Adjust based on your API response structure
  }
}

export const productService = new ProductService();

// 添加到购物车
export const addToCart = async (cartData: { productId: string; quantity?: number }): Promise<any> => {
  if (!cartData.productId) {
    throw new Error('商品ID不能为空');
  }
  return httpClient.request({
    url: '/cart/add',
    method: 'post',
    data: cartData
  });
};

export const getProducts = async (params: Partial<ProductSearchParams>): Promise<ProductResponse> => {
  return await httpClient.get('/products', { params });
};
