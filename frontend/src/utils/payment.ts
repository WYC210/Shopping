// src/utils/payment.ts
export const paymentService = {
  generatePaymentId(): string {
    return `PAY${Date.now()}${Math.random().toString(36).slice(2, 8)}`
  },

  validatePaymentData(data: PaymentData): boolean {
    if (!data.orderId) throw new Error('订单ID不能为空')
    if (data.amount <= 0) throw new Error('金额必须大于0')
    return true
  }
}

interface PaymentData {
  orderId: string
  amount: number
  paymentMethod: 'alipay' | 'wechat'
}