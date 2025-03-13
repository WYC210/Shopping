// src/api/cart.ts
import { httpClient } from '@/utils/request';
import { BaseApiService } from '@/api/modules/base';
import type { AddCartItemParams, CartItem } from '@/types/api/cart';
import { useUserStore } from '@/types/store/user';
import axios from 'axios';
import { fingerprintManager } from '@/utils/fingerprint';


interface CartResponse {
  status: number;
  data: CartItem[] | CartItemResponse | null;
  message: string;
}

interface CartItemResponse {
  cartItemId: string;
  productId: string;
  quantity: number;
  price?: number;
  productName?: string;
}

/**
 * 购物车服务类
 */
export class CartService extends BaseApiService<CartItem> {
  constructor() {
    super('/cart', httpClient);
  }

  /**
   * 获取购物车商品列表
   */
  async getCartItems(): Promise<CartItem[]> {
    try {
      const userStore = useUserStore();
      
  

      const response = await this.request<CartResponse>({
        method: 'GET',
        url: '/list',
        headers: {
          'Authorization': `Bearer ${userStore.accessToken}`
        }
      });

     
      return response.data as CartItem[];
    } catch (error) {
    
      throw error;
    }
  }

  /**
   * 添加商品到购物车
   */
  async addToCart(params: AddCartItemParams): Promise<CartItemResponse> {
    try {
    
      const response = await this.request<CartResponse>({
        method: 'POST',
        url: '/add',
        data: params
      });

   

      return response.data as CartItemResponse;
    } catch (error) {
    
      throw error;
    }
  }

  /**
   * 更新购物车商品数量
   */
  async updateCartItem(cartItemId: string, quantity: number): Promise<CartItemResponse> {
    try {
      const response = await this.request<CartResponse>({
        method: 'PUT',
        url: `/update/${cartItemId}`,
        params: { quantity }
      });
      return response.data as CartItemResponse;
    } catch (error) {
      console.error('更新购物车数量失败:', error);
      throw error;
    }
  }

  /**
   * 删除购物车商品
   */
  async deleteCartItem(cartItemId: string): Promise<void> {
    try {
      await this.request<CartResponse>({
        method: 'DELETE',
        url: `/delete/${cartItemId}`
      });
    } catch (error) {
      console.error('删除购物车商品失败:', error);
      throw error;
    }
  }

  /**
   * 清空购物车
   */
  async clearCart(): Promise<void> {
    try {
      await this.request({
        method: 'DELETE',
        url: '/clear'
      });
    } catch (error) {
      console.error('清空购物车失败:', error);
      throw error;
    }
  }

  /**
   * 购物车结算
   */
  async purchaseCart(cartItemIds: string[]): Promise<any> {
    try {
      const userStore = useUserStore();
      const token = userStore.accessToken;
      const fingerprint = await fingerprintManager.getFingerprint();

      const response = await axios.post('http://localhost:8088/orders/purchase/cart', {
        cartItemIds
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Device-Fingerprint': fingerprint
        }
      });

      return response.data;
    } catch (error) {
      console.error('结算请求失败:', error);
      throw error;
    }
  }

 
}

export const cartService = new CartService();