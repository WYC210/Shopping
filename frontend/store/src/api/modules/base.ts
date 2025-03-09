import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { BaseResponse } from '@/types/api';

// 添加基础 URL 配置
const BASE_API_URL = 'http://localhost:8088';

// 扩展请求配置
export interface RequestConfig extends AxiosRequestConfig { 
    url: string; //强制传递请求地址
}
/**
 * API 基类
 * @template T 默认响应数据类型
 */
export class BaseApiService<T = any> { // 添加泛型
  protected baseUrl: string;     // 明确属性类型
  protected httpClient: AxiosInstance; // 依赖注入
  /**
   * 构造函数
   * @param baseUrl API 基础路径
   * @param httpClient axios 实例
   */
  constructor(
    baseUrl: string,             // 参数类型声明
    httpClient: AxiosInstance,      // 明确依赖类型
    protected errorHandler: (error: Error, config: RequestConfig) => void = console.error
  ) {
    // 拼接完整的 API 路径
    this.baseUrl = `${BASE_API_URL}${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}`;
    this.httpClient = httpClient
  }
 /**
   * 通用请求方法
   * @template D 响应数据类型（覆盖默认泛型）
   * @param config axios 配置
   * @returns Promise 包装的响应数据
   */
  protected async request<D = T>(config: RequestConfig): Promise<D> {
    const fullConfig: AxiosRequestConfig = {
      ...config,
      url: config.url.startsWith('http') 
        ? config.url 
        : `${this.baseUrl}${config.url}`  // 避免重复的基础URL
    };
    
    try {
      const response = await this.httpClient.request<D>(fullConfig);
      console.log('Request URL:', fullConfig.url); // 调试用
      
      // 检查 HTTP 状态码
      if (response.status !== 200) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      // 直接返回响应数据
      return response.data;
    } catch (error) {
      console.error(`[API Error] ${fullConfig.url}`, error);
      throw error;
    }
  }
}
/**
 * 通用 CRUD 服务基类
 * @template T 资源类型
 */
export class BaseCrudService<T = any> extends BaseApiService<T> {
  constructor(resourcePath: string, httpClient: AxiosInstance) {
    super(resourcePath, httpClient);
  }

  // 获取所有资源
  async getAll(params?: Record<string, any>): Promise<T[]> {
    return this.request({ method: 'GET', url: '', params });
  }

  // 根据 ID 获取单个资源
  async getById(id: string): Promise<T> {
    return this.request({ method: 'GET', url: `/${id}` });
  }

  // 创建新资源
  async create(data: Partial<T>): Promise<T> {
    return this.request({ method: 'POST', url: '', data });
  }

  // 更新资源
  async update(id: string, data: Partial<T>): Promise<T> {
    return this.request({ method: 'PUT', url: `/${id}`, data });
  }

  // 删除资源
  async delete(id: string): Promise<void> {
    return this.request({ method: 'DELETE', url: `/${id}` });
  }

  // 批量创建资源
  async batchCreate(items: Partial<T>[]): Promise<T[]> {
    return this.request({ method: 'POST', url: '/batch', data: { items } });
  }

  // 批量更新资源
  async batchUpdate(items: Partial<T>[]): Promise<T[]> {
    return this.request({ method: 'PUT', url: '/batch', data: { items } });
  }

  // 批量删除资源
  async batchDelete(ids: string[]): Promise<void> {
    return this.request({ method: 'DELETE', url: '/batch', data: { ids } });
  }
}
