<template>
  <div class="order-page">
    <HomeHeader />
    
    <div class="order-container">
      <!-- 页头 -->
      <el-page-header class="page-header" @back="goBack">
        <template #breadcrumb>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>我的订单</el-breadcrumb-item>
          </el-breadcrumb>
        </template>
      </el-page-header>

      <!-- 订单列表 -->
      <div class="order-content">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="全部订单" name="all" />
          <el-tab-pane label="待支付" name="unpaid" />
          <el-tab-pane label="已支付" name="paid" />
        </el-tabs>

        <OrderList 
          :orders ="filteredOrders as []"   
          :loading="loading"
          @pay-order="handlePayOrder"
          @cancel-order="handleCancelOrder"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { orderService } from '@/api/modules/order';
import type { Order } from '@/types/api/order';
import OrderList from './components/OrderList.vue';
import HomeHeader from '@/views/Home/components/HomeHeader.vue';

type TabType = 'all' | 'unpaid' | 'paid';

const router = useRouter();
const loading = ref(false);
const activeTab = ref<TabType>('all');
const orders = ref<Order[]>([]);

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await orderService.getOrderList();
    console.log('获取到的订单列表:', response);
    

    orders.value = response?.data ? response.data.map(order => ({
      ...order,
      createdTime: order.createdTime || new Date().toISOString(),
      status: order.status 
    })) : [];
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 根据标签过滤订单
const filteredOrders = computed(() => {
  switch (activeTab.value) {
    case 'unpaid':
      return orders.value.filter(order => order.status === 'PENDING_PAY');
    case 'paid':
      return orders.value.filter(order => order.status === 'PAID');
    default:
      return orders.value;
  }
});

// 处理支付订单
const handlePayOrder = (orderId: string) => {
  const order = orders.value.find(o => o.orderId === orderId);
  if (!order) return;
  
  router.push({
    path: '/payment',
    query: { 
      orderId: orderId,
      totalAmount: order.totalAmount
    }
  });
};

// 处理取消订单
const handleCancelOrder = async (orderId: string) => {
  try {
    await orderService.cancelOrder(orderId);
    ElMessage.success('订单已取消');
    await fetchOrders(); // 重新获取订单列表
  } catch (error) {
    console.error('取消订单失败:', error);
    ElMessage.error('取消订单失败');
  }
};

// 处理标签切换
const handleTabClick = () => {
  fetchOrders();
};

const goBack = () => {
  router.back();
};

// 组件挂载时获取订单列表
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: rgba(6, 5, 36, 0.95);
  padding-top: 80px;
}

.order-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.order-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
}

.order-info-section,
.order-items-section {
  margin-bottom: 30px;
}

h3 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  color: rgba(255, 255, 255, 0.8);
}

.label {
  color: rgba(255, 255, 255, 0.6);
  margin-right: 8px;
}

.amount {
  color: #07cfa1;
  font-weight: bold;
}

.items-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.item-card {
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  color: #fff;
  margin: 0 0 8px;
}

.price {
  color: #07cfa1;
  font-weight: bold;
  margin: 8px 0;
}

.quantity {
  color: rgba(255, 255, 255, 0.6);
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .order-container {
    padding: 16px;
  }

  .item-card {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }
}
</style> 