// src/api/user.ts
import { httpClient } from '@/utils/request';
import { BaseApiService } from './base';
import { validator } from '@/utils/validator'
import type { UserProfile, LoginParams, UpdatePasswordParams } from '@/types/api/user.ts';
import { tokenManager } from '@/utils/tokenManager';
import axios from 'axios';

/**
 * 用户服务类
 */
export class UserService extends BaseApiService<UserProfile> {
  constructor() {
    super('/users', httpClient);
  }

  /**
   * 用户登录
   * @param credentials 登录凭证
   */
  async login(credentials: LoginParams): Promise<UserProfile> {
    return this.request({
      method: 'POST',
      url: '/login',
      data: credentials
    });
  }

  /**
   * 更新头像
   */
  async updateAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request({
      method: 'PATCH',
      url: '/avatar',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  /**
   * 更新用户密码
   */
  async updatePassword(data: UpdatePasswordParams): Promise<void> {
    const token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error('未登录或 token 已失效');
    }

    const { oldPassword, newPassword } = data;
    const validation = validator.validatePassword(newPassword);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    return this.request({
      url: '/password',
      method: 'PATCH',
      data: { oldPassword, newPassword },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 获取用户个人资料
   */
  async getProfile(): Promise<UserProfile> {
    const token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error('未登录或 token 已失效');
    }

    return this.request({
      method: 'GET',
      url: '/info',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // 获取 token 的辅助方法
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * 更新用户个人资料
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error('未登录或 token 已失效');
    }

    console.log('发送更新个人信息请求:', {
      url: '/users/update',
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data
    });

    try {
      const response = await this.request({
        method: 'PATCH',
        url: '/update',
        data: {
          email: data.email,
          phone: data.phone,
          gender: data.gender
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('更新个人信息响应:', response);
      return response.data;
    } catch (error) {
      console.error('更新个人信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户浏览历史
   */
  async getBrowseHistory(page: number = 1, size: number = 20): Promise<any> {
    const token = tokenManager.getAccessToken();
    if (!token) {
      throw new Error('未登录或 token 已失效');
    }

    return this.request({
      method: 'GET',
      url: '/browse/history',
      params: {
        page,
        size
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

}

export const userService = new UserService();