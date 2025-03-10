// src/utils/auth.ts
import { httpClient } from '@/utils/request';
import type { LoginParams, RegisterParams, Tokens, UserInfo } from '@/types/api/auth';
import router from '@/router';
import { tokenManager } from './tokenManager';



export const auth = {
  // 登录
  async login(credentials: LoginParams): Promise<Tokens> {
    const response = await httpClient.post<{ state: number; data: Tokens; message?: string }>(
      '/users/login', 
      credentials
    );
    
    if (response.data.state === 200) {
      const { accessToken, refreshToken } = response.data.data;
      tokenManager.setTokens(accessToken, refreshToken);
      return response.data.data;
    }
    throw new Error(response.data.message || '登录失败');
  },

  // 注册
  async register(userData: RegisterParams): Promise<any> {
    const response = await httpClient.post<{ state: number; data: any; message?: string }>(
      '/users/register', 
      userData
    );
    
    if (response.data.state === 200) {
      return response.data.data;
    }
    throw new Error(response.data.message || '注册失败');
  },

  // 登出
  async logout(): Promise<void> {
    try {
      await httpClient.post('/users/logout');
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      tokenManager.clearTokens();
      localStorage.removeItem('userInfo');
      router.push('/login');
    }
  }
};

// 获取用户信息
export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await httpClient.get<{ data: UserInfo }>('/users/info');
    return response.data.data;
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
};
