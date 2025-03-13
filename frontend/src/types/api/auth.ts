
export interface RegisterParams {
  username: string;
  password: string;
  email?: string;
  
}

export interface LoginParams {
  username: string
  password: string
}

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface UserInfo {
  id: string;
  username: string;
  email?: string;

}
