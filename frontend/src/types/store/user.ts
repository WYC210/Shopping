// src/types/store/user.ts
import { defineStore } from 'pinia';

import router from '@/router';
import { ElMessage } from 'element-plus';
import { tokenManager } from '@/utils/tokenManager';
import { httpClient } from '@/utils/request';

interface UserInfo {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  // 其他用户信息字段
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface UserState {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: any | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: !!localStorage.getItem('accessToken'),
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    userInfo: null
  }),

  actions: {
    async initializeFromStorage() {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo && userInfo !== 'undefined') {
        try {
          this.userInfo = JSON.parse(userInfo);
          this.isLoggedIn = true;
        } catch (error) {
          console.error('解析用户信息失败:', error);
          this.clearUserState();
        }
      } else {
        this.clearUserState();
      }
    },

    async login(credentials: LoginCredentials) {
      try {
        console.log('Attempting login with credentials:', credentials);
        const response = await httpClient.post('/users/login', credentials);
        console.log('Login response:', response);  // 添加日志
        
        if (response.status === 200) {
          // 检查响应数据结构
          console.log('Login response data:', response.data);
          
          // 解构前检查数据是否存在
          if (!response.data || !response.data.accessToken || !response.data.refreshToken) {
            console.error('Invalid response data structure:', response.data);
            throw new Error('登录响应数据格式错误');
          }

          const { accessToken, refreshToken, userInfo } = response.data;
          
          // 检查 token 值
          console.log('Tokens received:', { accessToken, refreshToken });
          
          // 保存 token
          const tokenSet = tokenManager.setTokens(accessToken, refreshToken);
          console.log('tokenSet:' , tokenSet);
          
          if (!tokenSet) {
            throw new Error('保存令牌失败');
          }
          
          // 更新用户状态
          this.isLoggedIn = true;
          this.setUserInfo(userInfo);
          
          console.log('Login successful, tokens set');
          return response;
        }
        
        throw new Error(response.data?.message || '登录失败');
      } catch (error: any) {
        console.error('登录失败，详细错误:', error);
        throw error;
      }
    },

    async logout() {
      try {
        if (this.accessToken) {
          // 调用登出接口
          await fetch('http://localhost:8088/users/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });
        }
      } catch (error) {
        console.error('登出失败:', error);
      } finally {
        // 确保清除所有状态
        this.isLoggedIn = false;  // 确保设置登录状态为 false
        this.accessToken = null;
        this.refreshToken = null;
        this.userInfo = null;
        
        // 清除本地存储
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
      }
    },

    setUserInfo(info: UserInfo) {
      this.userInfo = info;
      this.isLoggedIn = true;
      localStorage.setItem('userInfo', JSON.stringify(info));
    },

    clearUserState() {
      this.userInfo = null;
      this.isLoggedIn = false;
      localStorage.removeItem('userInfo');
    },

    setTokens(tokens: { accessToken: string; refreshToken: string }) {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.isLoggedIn = true;
      
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    },

    async refreshAccessToken() {
      try {
        console.log('开始刷新 token, 当前 refreshToken:', this.refreshToken);
        
        const response = await fetch('http://localhost:8088/users/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.refreshToken}`
          },
          body: JSON.stringify({
            refreshToken: this.refreshToken
          })
        });

        console.log('刷新 token 响应状态:', response);
        const data = await response.json();
        console.log('刷新 token 响应数据:', data);
        
        if (response.ok && data.status === 200) {
          if (!data.data) {
            console.error('无效的 token 响应数据:', data);
            throw new Error('Invalid token response');
          }

          console.log('获取新的 access token:', data.data);

          // 更新访问 token
          this.accessToken = data.data;
          localStorage.setItem('accessToken', data.data);
          
          console.log('access token 刷新成功，已更新本地存储');
          return true;
        }
        
        console.warn('token 刷新失败，响应不成功:', data);
        return false;
      } catch (error) {
        console.error('刷新 token 发生错误:', error);
        await this.logout();
        return false;
      }
    },
  }
});