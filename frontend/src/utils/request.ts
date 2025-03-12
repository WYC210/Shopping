// src/utils/request.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { tokenManager } from './tokenManager'
import { fingerprintManager } from './fingerprint'
import { useUserStore } from '../types/store/user'
import { useRouter } from 'vue-router'

class HttpClient {
  private static instance: AxiosInstance

  private constructor() {
    // 创建 axios 实例
    HttpClient.instance = axios.create({
      baseURL: 'http://localhost:8088',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  public static getInstance(): AxiosInstance {
    if (!HttpClient.instance) {
      new HttpClient()
      HttpClient.setupInterceptors()
    }
    return HttpClient.instance
  }

  public static setupInterceptors() {
    const httpClient = HttpClient.getInstance()

    // 请求拦截器
    httpClient.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        // 获取 token
        const token = tokenManager.getAccessToken()
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          }
        }

        // 添加浏览器指纹
        const fingerprint = await fingerprintManager.getFingerprint()
        config.headers = {
          ...config.headers,
          'X-Device-Fingerprint': fingerprint
        }

        console.log('请求的浏览器指纹:', fingerprint)

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
        if (error.response?.status === 401) {
          const userStore = useUserStore()
          userStore.setLoggedIn(false)
          const router = useRouter()
          router.push('/login')
        }
        return Promise.reject(error)
      }
    )
  }
}

// 导出 HttpClient 单例
export const httpClient = HttpClient.getInstance()

export { HttpClient };