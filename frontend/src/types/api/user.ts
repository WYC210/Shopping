// src/types/api/user.type.ts
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

export interface LoginParams {
  username: string;
  password: string;
}

// 新增更新密码的参数类型
export interface UpdatePasswordParams {
  oldPassword: string;
  newPassword: string;
}