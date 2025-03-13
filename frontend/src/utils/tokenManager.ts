import router from '@/router';
import { httpClient } from './request';

export class TokenManager {
  private accessToken: string | null;
  private refreshToken: string | null;
  private readonly TOKEN_EXPIRE_TIME = 15 * 60 * 1000; // 15分钟
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  private isRefreshing: boolean = false; // 添加标记，避免重复刷新

  constructor() {
    // 从 localStorage 获取 tokens
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
   
  }

  // 设置令牌
  setTokens(accessToken: string, refreshToken: string): boolean {
    if (!accessToken || !refreshToken) {
      console.error('Empty tokens provided:', { accessToken, refreshToken });
      return false;
    }
    
    try {
      // 保存到内存
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;

      // 保存到 localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // 设置自动刷新
      this.setupTokenRefresh();
      return true;
    } catch (error) {
      console.error('Failed to set tokens:', error);
      return false;
    }
  }

  // 获取访问令牌
  getAccessToken(): string | null {
    // 如果内存中没有，尝试从 localStorage 获取
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
   
    return this.accessToken;
  }

  // 获取刷新令牌
  getRefreshToken(): string | null {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('refreshToken');
    }
   
    return this.refreshToken;
  }

  // 清除令牌
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 清除刷新定时器
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
    
    // 清除刷新状态
    this.isRefreshing = false;
    
    // 如果不在登录页面，则重定向到登录页
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login');
    }
    
  
  }

  // 刷新访问令牌
  async refreshAccessToken(): Promise<boolean> {
    // 如果已经在刷新中，直接返回 false
    if (this.isRefreshing) {
      return false;
    }

    try {
      this.isRefreshing = true; // 设置刷新标记

      if (!this.refreshToken) {
        this.clearTokens(); // 清除所有 token
        return false;
      }

      const response = await httpClient.post('/users/refresh', {
        refreshToken: this.refreshToken
      });

      if (response.data?.state === 200 && response.data.data?.accessToken) {
        this.accessToken = response.data.data.accessToken;
        localStorage.setItem('accessToken', this.accessToken as string);
        this.setupTokenRefresh();
        return true;
      }
      
      // 如果刷新失败，清除所有 token
      this.clearTokens();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return false;
    } finally {
      this.isRefreshing = false; // 重置刷新标记
    }
  }

  // 设置token自动刷新
  private setupTokenRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    // 只有当有 token 时才设置刷新定时器
    if (this.accessToken && this.refreshToken) {
      this.refreshTimeout = setTimeout(() => {
        this.refreshAccessToken();
      }, this.TOKEN_EXPIRE_TIME - 5 * 60 * 1000);
    }
  }

  // 检查是否需要刷新token
  async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    // 解析 JWT token 获取过期时间
    try {
      const tokenData = JSON.parse(atob(this.accessToken.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // 转换为毫秒
      const currentTime = Date.now();
      
      // 如果 token 还有超过 5 分钟的有效期，则不需要刷新
      if (expirationTime - currentTime > 5 * 60 * 1000) {
        return true;
      }

      // 只有当 token 即将过期时才刷新
      return await this.refreshAccessToken();
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

// 添加调试日志

export const tokenManager = new TokenManager();

