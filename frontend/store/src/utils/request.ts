// src/utils/request.ts
import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { tokenManager } from './tokenManager'

// 创建 axios 实例
const httpClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8088',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    // 从 tokenManager 获取 token
    const token = tokenManager.getAccessToken()
    
    // 如果有token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 避免重复刷新 token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;  // 标记该请求已经尝试过刷新
      
      try {
        const success = await tokenManager.refreshAccessToken();
        if (success) {
          // 刷新成功，重试原请求
          originalRequest.headers.Authorization = `Bearer ${tokenManager.getAccessToken()}`;
          return httpClient(originalRequest);
        } else {
          // 刷新失败，清除 token 并跳转登录
          tokenManager.clearTokens();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 刷新过程出错，清除 token 并跳转登录
        tokenManager.clearTokens();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
)

export { httpClient }