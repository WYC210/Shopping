// src/utils/request.ts
import axios from 'axios'
import type { AxiosInstance } from 'axios'

// 创建 axios 实例
export const httpClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8088',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 导出一个函数来设置拦截器
export function setupInterceptors(tokenManager: any) {
  // 请求拦截器
  httpClient.interceptors.request.use(
    (config) => {
      const token = tokenManager.getAccessToken()
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
      const originalRequest = error.config
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        
        try {
          const success = await tokenManager.refreshAccessToken()
          if (success) {
            originalRequest.headers.Authorization = `Bearer ${tokenManager.getAccessToken()}`
            return httpClient(originalRequest)
          } else {
            tokenManager.clearTokens()
            return Promise.reject(error)
          }
        } catch (refreshError) {
          tokenManager.clearTokens()
          return Promise.reject(refreshError)
        }
      }
      
      return Promise.reject(error)
    }
  )
}