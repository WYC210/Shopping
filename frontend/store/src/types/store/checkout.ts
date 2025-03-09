// src/types/store/checkout.ts
import { defineStore } from 'pinia';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  // 其他必要字段
}

interface OrderData {
  orderId: string;
  totalAmount: number;
  items: OrderItem[];
  status?: string;
  orderInfo?: any;
}

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    orderData: null as OrderData | null,
    loading: false,
    error: null as string | null
  }),
  
  getters: {
    orderId: (state) => state.orderData?.orderId,
    totalAmount: (state) => state.orderData?.totalAmount,
    orderItems: (state) => state.orderData?.items || [],
    orderStatus: (state) => state.orderData?.status
  },
  
  actions: {
    setOrderData(orderData: OrderData) {
      this.orderData = orderData;
    },
    
    clearOrderData() {
      this.orderData = null;
      this.error = null;
    }
  }
});