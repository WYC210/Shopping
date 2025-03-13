
import { defineStore } from 'pinia';
import { orderService } from '@/api/modules/order';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { tokenManager } from '@/utils/tokenManager';

import type { OrderStatus } from '@/types/api/payment'

export interface Order {
  orderId: string;
  totalAmount: number;
  status: OrderStatus;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  createTime: string;
  userId?: string;
}

interface PaymentData {
  amount: number;
  paymentMethod: string;
  paymentId: string;
}

interface OrderPaymentParams {
  orderId: string;
  amount: number;
  paymentMethod: string;
  paymentId: string;
}

interface OrderResponse {
  status: number
  message: string | null
  data: Order[]
}

export const useOrderStore = defineStore('order', {
  state: () => ({
    currentOrder: null as Order | null,
    orderList: [] as Order[],
    loading: false,
    error: null as string | null,
    pagination: {
      page: 1,
      size: 10,
      total: 0
    }
  }),

  getters: {
    orderTotal: (state) => state.currentOrder?.totalAmount || 0,
    orderStatus: (state) => state.currentOrder?.status
  },

  actions: {
    // 更新订单状态
    updateOrderStatus(orderId: string, status: OrderStatus) {
      const order = this.orderList.find(order => order.orderId === orderId);
      if (order) {
        order.status = status as OrderStatus;
        this.orderList = [...this.orderList];
      } else {
        this.fetchOrderList();
      }
    },

    async createNewOrder(orderData: any) {
      this.loading = true;
      try {
        const data = await orderService.createOrder(orderData);
        this.currentOrder = {
          ...data,
          orderId: data.orderId,
          items: orderData.items,
          createTime: data.createdTime,
          status: data.status as OrderStatus
        };
        return data;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 支付订单
    async payCurrentOrder(orderData: OrderPaymentParams) {
      try {
        this.loading = true;
        ElMessage.info('正在处理支付请求...');

       

        const orderIdStr = orderData.orderId;
        const paymentDataStr: PaymentData = {
          amount: orderData.amount,
          paymentMethod: orderData.paymentMethod,
          paymentId: orderData.paymentId
        };

        if (!orderIdStr) {
          throw new Error('无效的订单ID');
        }

        const token = tokenManager.getAccessToken();
  

        if (!token) {
          throw new Error('未登录或 token 已过期');
        }

   

        const response = await orderService.payOrder(orderIdStr, paymentDataStr);

        if (response?.state === 200 && response.data) {
          ElMessage.success('支付成功');
          router.push('/orders');
          return response.data;
        } else {
          throw new Error(response?.message || '支付失败');
        }
      } catch (error: any) {
        console.error('支付处理错误:', error);
        ElMessage.error(error.message || '支付失败');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取订单列表
    async fetchOrderList() {
      try {
        this.loading = true;
        const response = (await orderService.getOrderList() as unknown) as OrderResponse;
       
        
        if (response?.status === 200 && Array.isArray(response.data)) {
          this.orderList = response.data;
          
        } else {
          console.warn('API 响应格式不正确:', response);
          this.orderList = [];
        }
      } catch (error: any) {
        console.error('获取订单列表失败:', error);
        this.orderList = [];
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrderDetail(orderId: string) {
      this.loading = true;
      try {
        const response = await orderService.getOrderDetail(orderId);
        const orderData = Array.isArray(response.data) ? response.data[0] : response.data;
        
        this.currentOrder = {
          orderId: orderData.orderId || orderId,
          totalAmount: orderData.totalAmount,
          status: orderData.status as OrderStatus,
          items: orderData.items,
          createTime: orderData.createdTime,
          userId: orderData.userId
        };
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.error || { message: '获取订单详情失败' };
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async cancelOrder(orderId: string) {
      this.loading = true;
      try {
        const response = await orderService.cancelOrder(orderId);
        if (this.currentOrder?.orderId === orderId) {
          this.currentOrder.status = 'CANCELLED';
        }
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.error || { message: '取消订单失败' };
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setCurrentOrder(order: Order) {
      this.currentOrder = order;
    },

    clearCurrentOrder() {
      this.currentOrder = null;
    }
  }
});