import { httpClient } from '@/utils/request';
import { fingerprintManager } from '@/utils/fingerprint'; // 导入指纹管理器

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  email?: string;
  // 其他注册需要的字段
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
  // 其他用户信息字段
}

export class AuthService {
  // 登录方法
  async login(credentials: LoginParams): Promise<UserInfo> {
    const fingerprint = await fingerprintManager.getFingerprint(); // 获取浏览器指纹
    console.log('登录请求的浏览器指纹:', fingerprint); // 输出指纹到控制台

    return httpClient.post('/users/login', {
      ...credentials,
      'X-Device-Fingerprint': fingerprint // 添加指纹到请求数据中
    });
  }
}