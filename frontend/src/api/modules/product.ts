// src/api/modules/product.ts
import { BaseApiService } from './base';
import { httpClient } from '@/utils/request';
import type { Product, ProductResponse, PaginationParams, CategoryResponse } from '@/types/api/product';
import type { Category } from '@/types/store/HomeType';

interface ProductSearchParams extends PaginationParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: string | null;
  sortField?: string;
  sortOrder?: string;
}

interface ProductDetailParams {
  includeOptions?: boolean;
  includeComments?: boolean;
}

interface ProductData {
  product_id: string;
  name: string;
  price: number;
  stock?: number;
  [key: string]: any;
}

interface ProductDetailResponse {
  data: {
    product: Product;
    images?: string[];
  };
  status: number;
  message?: string;
}

interface ProductDetailsResponse {
  data: {
    product: Product;
    options?: any[];
    comments?: any[];
  };
  status: number;
  message?: string;
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

  // 获取商品列表
  async getProducts(params: PaginationParams): Promise<ProductResponse> {
    console.log('发送商品请求:', {
      url: `${this.baseUrl}`,
      method: 'GET',
      params
    });

    const response = await this.request<ProductResponse>({
      method: 'GET',
      url: '',
      params
    });

    console.log('商品响应数据:', response);
    return response;
  }

  // 获取商品详情
  async getProductDetail(productId: string): Promise<ProductDetailResponse> {
    if (!productId) {
      throw new Error('商品ID不能为空');
    }
    return this.request({
      url: `/${productId}`,  // 简化URL路径
      method: 'GET'
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

  // 搜索商品
  async searchProducts(keyword: string, page = 1, size = 10): Promise<ProductResponse> {
    try {
      console.log('发送搜索请求，参数:', {
        keyword,
        page,
        size
      });
      
      const response = await this.request<ProductResponse>({
        url: '/search', // 使用 /search 端点
        method: 'GET',
        params: {
          keyword,
          page,
          size
        }
      });
      
      console.log('搜索响应数据:', response);
      return response;
    } catch (error) {
      console.error('搜索商品失败:', error);
      throw error;
    }
  }

  // 获取推荐商品
  async getRecommendedProducts(productId: string, limit: number = 5): Promise<Product[]> {
    return this.request({
      url: this.getUrl(`/${productId}/recommendations`),
      method: 'GET',
      params: { limit }
    });
  }

  // 上架商品
  async createProduct(productData: ProductData): Promise<Product> {
    // 必填字段校验
    if (!productData.product_id || !productData.name || 
        !productData.price || !productData.stock) {
      throw new Error('缺少必填字段: product_id/name/price/stock');
    }

    return this.request({
      url: this.getUrl('/create'), // 指定自定义路径
      method: 'POST',
      data: productData
    });
  }

  // 更新商品
  async updateProduct(productId: string, productData: Partial<ProductData>): Promise<Product> {
    if (!productId) throw new Error('商品ID不能为空');
    
    return this.request({
      url: this.getUrl(`/update`), // 或使用 RESTful 风格：url: this.getUrl(`/${productId}`)
      method: 'PUT',
      data: {
        ...productData,
        product_id: productId // 确保传递ID
      }
    });
  }

  // 下架商品
  async deactivateProduct(productId: string): Promise<void> {
    if (!productId) throw new Error('商品ID不能为空');
    
    return this.request({
      url: this.getUrl(`/deactivate/${productId}`),
      method: 'PUT'
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