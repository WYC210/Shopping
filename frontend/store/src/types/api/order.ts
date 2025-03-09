// src/types/api/order.type.ts
export interface OrderResponse {
  status: number;
  data: Order;
  message?: string;
}

export interface Order {
  orderId: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  userId: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface PaymentParams {
  paymentMethod: string;
  transactionId?: string;
}
