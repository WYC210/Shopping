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
import { computed } from 'vue';
import type { OrderStatus } from '@/types/api/payment';
import defaultImage from '@/assets/cs2.png';

defineEmits(['pay-order', 'cancel-order']);

const props = defineProps<{
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
  return (price / 100).toFixed(2);
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
  background: #570808;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #1852d7;
}

.order-info {
  display: flex;
  gap: 16px;
}

.order-id {
  color: #333;
  font-weight: 500;
}

.order-time {
  color: #909399;
}

.order-status {
  font-weight: 500;
}

.order-status.pending_pay {
  color: #e6a23c;
}

.order-status.paid {
  color: #67c23a;
}

.order-status.cancelled {
  color: #909399;
}

.products-list {
  padding: 16px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #510b0b;
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
  color: #333;
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
  color: #ff4d4f;
  font-weight: 500;
}

.product-quantity {
  color: #909399;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #700c0c;
  border-top: 1px solid #ebeef5;
}

.order-amount {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #606266;
}

.total-price {
  color: #333;
}

.total-price strong {
  color: #07cfa1;
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
</style> 