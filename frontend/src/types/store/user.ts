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

    setLoggedIn(status: boolean) {
      this.isLoggedIn = status;
    },

    async login(credentials: LoginCredentials) {
      try {
        console.log('Attempting login with credentials:', credentials);
        const response = await httpClient.post('/users/login', credentials);
        
        if (response.data?.status === 200) {
          const { accessToken, refreshToken, userInfo } = response.data.data;
          
          // 保存 token
          const tokenSet = tokenManager.setTokens(accessToken, refreshToken);
          
          if (!tokenSet) {
            throw new Error('保存令牌失败');
          }
          
          // 更新用户状态
          this.isLoggedIn = true;
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          this.setUserInfo(userInfo);
          
          console.log('Login successful');
          return response.data;
        }
        
        throw new Error(response.data?.message || '登录失败');
      } catch (error: any) {
        console.error('登录失败:', error);
        throw new Error(error.message || '登录失败，请检查用户名和密码');
      }
    },

    async logout() {
      try {
        if (this.accessToken) {
          await httpClient.post('/users/logout', null, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });
        }
      } catch (error) {
        console.error('登出失败:', error);
      } finally {
        // 清除所有状态
        this.isLoggedIn = false;
        this.accessToken = null;
        this.refreshToken = null;
        this.userInfo = null;
        
        // 清除本地存储
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        
        // 清除 TokenManager 中的 tokens
        tokenManager.clearTokens();
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

    clearUserInfo() {
      this.userInfo = null;
      this.isLoggedIn = false;
    },
  },

  getters: {
    getUserInfo: (state) => state.userInfo,
    getIsLoggedIn: (state) => state.isLoggedIn
  }
});