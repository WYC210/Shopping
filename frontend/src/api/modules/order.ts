// src/api/modules/order.ts
import { httpClient } from '@/utils/request';
import { BaseCrudService } from './base';
import type { Order, PaymentParams } from '@/types/api/order.ts';
import type { OrderItem } from '@/types/api/order';

interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  [key: string]: number;
}

interface RefundData {
  reason: string;
  amount?: number;
  description?: string;
  images?: string[];
}

interface PurchaseDirectlyParams {
  items: Array<{
    productId: string;
    quantity: number;
    price: string;
    productName: string;
  }>;
}

interface OrderResponse {
  status: number;
  message?: string;
  data: Order[];  // 直接是订单数组
}

export class OrderService extends BaseCrudService<Order> {
  constructor() {
    super('/orders', httpClient);
  }

  // 获取订单列表
  async getOrderList(): Promise<Order[]> {
    const response = await this.request<Order[]>({  // 直接请求 Order 数组
      url: this.getUrl(''),
      method: 'GET'
    });

    return response;  // 直接返回响应
  }

  // 获取订单详情
  async getOrderDetail(orderId: string): Promise<OrderResponse> {
    const response = await this.request<OrderResponse>({
      url: this.getUrl(`/${orderId}`),
      method: 'GET'
    });

    return {
      status: response.status,
      message: response.message,
      data: Array.isArray(response.data) ? [response.data[0]] : [response.data]
    };
  }

  // 创建订单
  async createOrder(orderData: { items: OrderItem[] }): Promise<Order> {
    const formattedOrderData = {
      items: orderData.items.map(item => ({
        ...item,
        price: Number(item.price).toFixed(2)
      }))
    };

    return this.request({
      method: 'POST',
      url: '/create',
      data: formattedOrderData
    });
  }

  // 支付订单
  async payOrder(orderId: string, paymentData: { paymentId: string }): Promise<any> {
    return this.request({
      url: `/${orderId}/pay`,
      method: 'POST',
      data: paymentData
    });
  }

  // 取消订单
  async cancelOrder(orderId: string): Promise<any> {
    return this.request({
      url: this.getUrl(`/${orderId}/cancel`),
      method: 'POST'
    });
  }

  // 立即购买
  async purchaseDirectly(data: {
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      productName: string;
    }>;
  }): Promise<OrderResponse> {
    const formattedData = {
      items: data.items.map(item => ({
        ...item,
        price: Number(item.price).toFixed(2)
      }))
    };

    const response = await this.request<OrderResponse>({
      url: '/purchase',
      method: 'POST',
      data: formattedData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return {
      status: response.status,
      message: response.message,
      data: Array.isArray(response.data) ? response.data : [response.data]
    };
  }

  // 获取订单状态
  async getOrderStatus(orderId: string): Promise<string> {
    return this.request({
      url: this.getUrl(`/${orderId}/status`),
      method: 'GET'
    });
  }

  // 获取订单统计
  async getOrderStats(params?: Record<string, any>): Promise<OrderStats> {
    return this.request({
      url: this.getUrl('/stats'),
      method: 'GET',
      params
    });
  }

  // 确认收货
  async confirmReceipt(orderId: string): Promise<any> {
    return this.request({
      url: this.getUrl(`/${orderId}/confirm`),
      method: 'POST'
    });
  }

  // 申请退款
  async requestRefund(orderId: string, refundData: RefundData): Promise<any> {
    return this.request({
      url: this.getUrl(`/${orderId}/refund`),
      method: 'POST',
      data: refundData
    });
  }

  // 辅助方法：构建完整URL
  private getUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}

export const orderService = new OrderService();