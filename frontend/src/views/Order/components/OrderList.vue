<template>
  <div class="order-list" v-loading="loading">
    <div v-if="orders.length" class="orders-container">
      <div v-for="order in orders" :key="order.orderId" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">订单号: {{ order.orderId }}</span>
            <span class="order-time">{{ formatTime(order.createdTime) }}</span>
          </div>
          <span class="order-status" :class="order.status.toLowerCase()">
            {{ getOrderStatusText(order.status) }}
          </span>
        </div>

        <div class="products-list">
          <div v-for="item in order.items" :key="item.productId" class="product-item">
            <div class="product-image">
              <el-image :src="item.imageUrl || defaultImage" fit="cover" />
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ item.productName }}</h3>
              <div class="product-meta">
                <span class="product-price">¥{{ formatPrice(item.price) }}</span>
                <span class="product-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-amount">
            <span>共 {{ getTotalItems(order.items) }} 件商品</span>
            <span class="total-price">
              实付款：<strong>¥{{ formatPrice(order.totalAmount) }}</strong>
            </span>
          </div>
          <div class="order-actions">
            <el-button 
              v-if="order.status === 'PENDING_PAY'"
              type="primary" 
              @click="$emit('pay-order', order.orderId)"
            >
              立即支付
            </el-button>
            <el-button 
              v-if="order.status === 'PENDING_PAY'"
              @click="$emit('cancel-order', order.orderId)"
            >
              取消订单
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无订单" />
  </div>
</template>

<script setup lang="ts">
import type { OrderStatus } from '@/types/api/payment';
import defaultImage from '@/assets/logo_w.png';

defineEmits(['pay-order', 'cancel-order']);

defineProps<{
  orders: Array<{
    orderId: string;
    status: OrderStatus;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      imageUrl?: string;
    }>;
    totalAmount: number;
    createdTime: string;
  }>;
  loading?: boolean;
}>();

const getOrderStatusText = (status: OrderStatus) => {
  const statusMap = {
    'CREATED': '已创建',
    'PENDING_PAY': '待支付',
    'PAYING': '支付中',
    'PAID': '已支付',
    'CANCELLED': '已取消',
    'EXPIRED': '已过期'
  };
  return statusMap[status] || status;
};

const formatTime = (time: string) => {
  return new Date(time).toLocaleString();
};

const formatPrice = (price: number) => {
  return (price ).toFixed(2);
};

const getTotalItems = (items: any[]) => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};
</script>

<style scoped>
.order-list {
  min-height: 200px;
}

.order-card {
  background: rgba(6, 23, 53, 0.8);  /* 深海蓝背景 */
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 149, 255, 0.2);  /* 淡蓝色边框 */
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 2px 12px rgba(0, 149, 255, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 149, 255, 0.2);
  background: rgba(8, 32, 73, 0.9);  /* 稍深的蓝色 */
}

.order-info {
  display: flex;
  gap: 16px;
}

.order-id {
  color: #a8d8ff;  /* 浅蓝色文字 */
  font-weight: 500;
}

.order-time {
  color: rgba(168, 216, 255, 0.6);  /* 半透明浅蓝色 */
}

.order-status {
  font-weight: 500;
}

.order-status.pending_pay {
  color: #ffd700;  /* 金色 */
}

.order-status.paid {
  color: #00ffc8;  /* 青色 */
}

.order-status.cancelled {
  color: rgba(168, 216, 255, 0.4);  /* 暗淡的蓝色 */
}

.products-list {
  padding: 16px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 149, 255, 0.1);
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
}

.product-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 14px;
  color: #a8d8ff;  /* 浅蓝色文字 */
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: #00a8ff;  /* 亮蓝色 */
  font-weight: 500;
}

.product-quantity {
  color: rgba(168, 216, 255, 0.6);  /* 半透明浅蓝色 */
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(8, 32, 73, 0.9);  /* 稍深的蓝色 */
  border-top: 1px solid rgba(0, 149, 255, 0.2);
}

.order-amount {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: rgba(168, 216, 255, 0.8);  /* 浅蓝色文字 */
}

.total-price {
  color: #a8d8ff;  /* 浅蓝色文字 */
}

.total-price strong {
  color: #00a8ff;  /* 亮蓝色 */
  font-size: 16px;
}

.order-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .order-footer {
    flex-direction: column;
    gap: 16px;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 按钮样式 */
:deep(.el-button--primary) {
  background: linear-gradient(45deg, #00a8ff, #0097e6);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(45deg, #0097e6, #00a8ff);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 168, 255, 0.3);
}

:deep(.el-button--default) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 168, 255, 0.5);
  color: #00a8ff;
}

:deep(.el-button--default:hover) {
  background: rgba(0, 168, 255, 0.1);
  border-color: #00a8ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 168, 255, 0.2);
}
</style> 