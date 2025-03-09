<template>
  <div class="order-page">
    <HomeHeader />
    <div class="order-content">
      <div class="page-header">
        <h1>我的订单</h1>
        <div class="order-stats">
          <span>共 {{ orders.length }} 个订单</span>
        </div>
      </div>

      <div class="order-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="全部订单" name="all">
            <OrderList 
              :orders="filteredOrders"
              :loading="loading"
              @pay-order="handlePayOrder"
              @cancel-order="handleCancelOrder"
            />
          </el-tab-pane>
          <el-tab-pane label="待支付" name="unpaid">
            <OrderList 
              :orders="filteredOrders"
              :loading="loading"
              @pay-order="handlePayOrder"
              @cancel-order="handleCancelOrder"
            />
          </el-tab-pane>
          <el-tab-pane label="已支付" name="paid">
            <OrderList 
              :orders="filteredOrders"
              :loading="loading"
              @pay-order="handlePayOrder"
              @cancel-order="handleCancelOrder"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '@/types/store/order'
import type { Order } from '@/types/store/order'
import OrderList from './components/OrderList.vue'
import HomeHeader from '@/views/Home/components/HomeHeader.vue'

type TabType = 'all' | 'unpaid' | 'paid'

const router = useRouter()
const orderStore = useOrderStore()
const activeTab = ref<TabType>('all')
const loading = ref<boolean>(false)

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    await orderStore.fetchOrderList() // 确保从后端获取订单数据
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 计算属性：获取所有订单
const orders = computed(() => orderStore.orderList)

// 计算属性：根据选中的标签过滤订单
const filteredOrders = computed(() => {
  switch (activeTab.value) {
    case 'unpaid':
      return orders.value.filter(order => order.status === 'PENDING_PAY')
    case 'paid':
      return orders.value.filter(order => order.status === 'PAID')
    default:
      return orders.value
  }
})

// 处理支付订单
const handlePayOrder = (orderId: string) => {
  router.push({
    path: '/payment',
    query: { orderId }
  })
}

// 处理取消订单
const handleCancelOrder = async (orderId: string) => {
  try {
    await orderStore.cancelOrder(orderId)
    ElMessage.success('订单已取消')
    await fetchOrders()
  } catch (error) {
    ElMessage.error('取消订单失败')
  }
}

// 处理标签点击事件
const handleTabClick = () => {
  fetchOrders()
}

// 组件挂载时获取订单
onMounted(() => {
  fetchOrders()
  console.log('所有订单:', orders.value)
  console.log('过滤后的订单:', filteredOrders.value)
})
</script>

<style scoped>
.order-page {
  min-height: 100vh;
    background: rgba(6, 5, 36, 0.95);
}

.order-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  padding-top: 100px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.order-stats {
  color: #666;
}

.order-tabs {
  background: rgba(59, 56, 142, 0.566);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #ebeef5;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  color: #606266;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: 500;
}

@media (max-width: 768px) {
  .order-content {
    padding: 16px;
    padding-top: 80px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 