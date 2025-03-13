
export type PaymentMethod = 'alipay' | 'wechat' | 'creditCard';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'success' | 'failed';
}

export type OrderStatus = 
  | 'CREATED'      // 订单创建
  | 'PENDING_PAY'  // 待支付
  | 'PAYING'       // 支付中
  | 'PAID'        // 已支付
  | 'CANCELLED'    // 已取消
  | 'EXPIRED';     // 已过期

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

export interface PurchaseResponse {
  orderId: string;
  totalAmount: number;
}