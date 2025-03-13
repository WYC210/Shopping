
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  phone?: string;
  createdAt: Date;
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