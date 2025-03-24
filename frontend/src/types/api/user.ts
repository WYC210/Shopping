export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  phone?: string;
  createdTime: Date;
  registeredAt?: string;
}

export interface LoginParams {
  username: string;
  password: string;
}


export interface UpdatePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export interface UserInfo {
  userId: string;
  username: string;
  role: 'admin' | 'user';
  // ... 其他字段
}