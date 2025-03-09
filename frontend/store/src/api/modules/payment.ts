// src/api/payment.ts
import { httpClient } from '@/utils/request';
import { BaseCrudService } from './base';
import type { Payment, PaymentMethod } from '@/types/api/payment.ts';

export class PaymentService extends BaseCrudService<Payment> {
  private supportedMethods: PaymentMethod[] = ['alipay', 'wechat', 'creditCard'];

  constructor() {
    super('/payments', httpClient);
  }

  async createPayment(orderId: string, method: PaymentMethod): Promise<Payment> {
    if (!this.supportedMethods.includes(method)) {
      throw new Error('不支持的支付方式');
    }
    return this.request({
      method: 'POST',
      url: '/payments',
      data: { orderId, method }
    });
  }
}

export const paymentService = new PaymentService();