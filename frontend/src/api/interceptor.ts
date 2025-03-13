import axios from 'axios';
import { useUserStore } from '@/types/store/user';
import router from '@/router';
import { ElMessage } from 'element-plus';

const instance = axios.create({
  baseURL: 'http://localhost:8088',
  timeout: 5000
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.accessToken) {
      config.headers.Authorization = `Bearer ${userStore.accessToken}`;
    }
   
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 防止重复刷新token导致的死循环
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // 获取错误信息
    const errorMessage = error.response?.data?.message;

    // 根据错误信息判断处理方式
    if (errorMessage === '访问令牌已过期，请使用刷新令牌') {
      try {
        originalRequest._retry = true;
        const userStore = useUserStore();
        
        // 尝试刷新token
        const isValid = await userStore.refreshAccessToken();
        
        if (isValid) {
          // 更新原始请求的token
          originalRequest.headers.Authorization = `Bearer ${userStore.accessToken}`;
          // 重试原始请求
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // 刷新token失败，清除用户状态并跳转到登录
        const userStore = useUserStore();
        await userStore.logout();
        ElMessage.error('登录已过期，请重新登录');
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
        return Promise.reject(refreshError);
      }
    } else if (errorMessage === '令牌无效，请重新登录') {
      // 直接清除用户状态并跳转到登录页
      const userStore = useUserStore();
      await userStore.logout();
      ElMessage.error('登录已过期，请重新登录');
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      });
    }

    return Promise.reject(error);
  }
);

export default instance; 