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
 
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email?: string;
 
}

export class AuthService {
  // 登录方法
  async login(credentials: LoginParams): Promise<UserInfo> {
    const fingerprint = await fingerprintManager.getFingerprint();

    return httpClient.post('/users/login', {
      ...credentials,
      'X-Device-Fingerprint': fingerprint // 添加指纹到请求数据中
    });
  }
}