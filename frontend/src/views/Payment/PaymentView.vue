<!-- src/views/Payment/PaymentView.vue -->
<template>
  <div class="payment-container">
    <HomeHeader />
    <div class="payment-content">
      <!-- 支付进度 -->
      <div class="progress-bar">
        <el-steps :active="currentStep" finish-status="success">
          <el-step title="确认订单" />
          <el-step title="支付订单" />
          <el-step title="支付完成" />
        </el-steps>
      </div>

      <!-- 订单信息 -->
      <div class="order-info" v-loading="loading">
        <div class="section-title">订单信息</div>
        <div class="order-number">订单号：{{ orderId }}</div>
        
        <!-- 商品列表 -->
        <div class="products-list">
          <div v-for="item in orderItems" :key="item.productId" class="product-item">
            <el-image :src="defaultImage" class="product-image" />
            <div class="product-details">
              <div class="product-name">{{ item.productId }}</div>
              <div class="product-price">¥{{ formatPrice(item.price) }}</div>
              <div class="product-quantity">x{{ item.quantity }}</div>
            </div>
          </div>
        </div>

        <!-- 支付方式选择 -->
        <div class="payment-methods">
          <div class="section-title">支付方式</div>
          <div class="methods-list">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="method-item"
              :class="{ active: selectedMethod === method.id }"
              @click="selectPaymentMethod(method.id)"
            >
              <img :src="method.icon" :alt="method.name" />
              <span>{{ method.name }}</span>
            </div>
          </div>
        </div>

        <!-- 订单金额 -->
        <div class="order-amount">
          <div class="amount-row">
            <span>商品总额</span>
            <span>¥{{ formatPrice(totalAmount ) }}</span>
          </div>
          <div class="amount-row">
            <span>运费</span>
            <span>¥0.00</span>
          </div>
          <div class="amount-row total">
            <span>应付金额</span>
            <span class="total-price">¥{{ formatPrice(totalAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- 底部支付按钮 -->
      <div class="payment-actions">
        <div class="final-amount">
          <span>需支付：</span>
          <span class="amount">¥{{ formatPrice(totalAmount) }}</span>
        </div>
        <div class="action-buttons">
          <el-button @click="cancelPayment">取消</el-button>
          <el-button 
            type="primary" 
            :loading="paymentLoading"
            :disabled="!selectedMethod"
            @click="handlePayment"
          >
            确认支付
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderService } from '@/api/modules/order'
import HomeHeader from '@/views/Home/components/HomeHeader.vue'
import defaultImage from '@/assets/logo_w.png'
import alipayIcon from '@/assets/logo_w.png'
import wechatIcon from '@/assets/logo_w.png'
import type {OrderItem } from '@/types/api/order'

const route = useRoute()
const router = useRouter()
const orderId = route.query.orderId as string
const totalAmount = ref(Number(route.query.totalAmount) || 0)
const currentStep = ref(1)
const loading = ref(false)
const paymentLoading = ref(false)
const selectedMethod = ref('')
const orderItems = ref<OrderItem[]>([])

// 支付方式配置
const paymentMethods = [
  { id: 'alipay', name: '支付宝支付', icon: alipayIcon },
  { id: 'wechat', name: '微信支付', icon: wechatIcon }
]

// 获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const response = await orderService.getOrderDetail(orderId)
    
    if (response?.status === 200 && response.data) {
      const orderDetail = response.data[0]
      
      // 构建订单项数据
      orderItems.value = [{
        productId: orderDetail.orderId,
        productName: '订单商品',
        quantity: 1,
        price: orderDetail.totalAmount 
      }]

      // 设置总金额
      totalAmount.value = orderDetail.totalAmount 

      
    } else {
      throw new Error('获取订单数据失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单信息失败')
    router.push('/order')
  } finally {
    loading.value = false
  }
}

// 格式化价格 - 修改为处理分转元
const formatPrice = (price: number): string => {
  // 将分转换为元并保留两位小数
  return (price ).toFixed(2)
}

// 选择支付方式
const selectPaymentMethod = (methodId: string) => {
  selectedMethod.value = methodId
}

// 处理支付
const handlePayment = async () => {
  if (!selectedMethod.value) {
    ElMessage.warning('请选择支付方式')
    return
  }

  paymentLoading.value = true
  try {
    // 生成支付ID
    const paymentId = `PAY${Date.now()}${Math.random().toString(36).slice(-4)}`
    
    // 调用支付接口
    const response = await orderService.payOrder(orderId, { paymentId })
    console.log('支付响应:', response);
    
    if (response.status === 200 || response.state
    ==200) {
      currentStep.value = 3
      ElMessage.success('支付成功')
      // 延迟跳转到订单列表
      setTimeout(() => {
        router.push('/OrderList')
      }, 1500)
    } else {
      throw new Error(response.message || '支付失败')
    }
  } catch (error: any) {
    console.error('支付处理错误:', error)
    ElMessage.error(error.message || '支付失败')
  } finally {
    paymentLoading.value = false
  }
}

// 取消支付
const cancelPayment = () => {
  router.push('/order')
}

onMounted(async () => {
  if (!orderId) {
    ElMessage.error('订单信息不完整')
    router.push('/order')
    return
  }

  await fetchOrderDetail()
})
</script>

<style scoped>
.payment-container {
  min-height: 100vh;
  background: rgba(6, 5, 36, 0.95);
  padding-top: 60px;
}

.payment-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.05);
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.order-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 80px;
}

.section-title {
  font-size: 18px;
  color: #fff;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
}

.order-number {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
}

.products-list {
  margin-bottom: 24px;
}

.product-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 12px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.product-details {
  flex: 1;
}

.product-name {
  color: #fff;
  margin-bottom: 8px;
}

.product-price {
  color: #07cfa1;
  font-weight: bold;
}

.product-quantity {
  color: rgba(255, 255, 255, 0.5);
}

.payment-methods {
  margin-bottom: 24px;
}

.methods-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-item img {
  width: 24px;
  height: 24px;
}

.method-item.active {
  background: rgba(7, 207, 161, 0.1);
  border: 1px solid #07cfa1;
}

.order-amount {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 16px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.amount-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  color: #fff;
}

.total-price {
  color: #07cfa1;
  font-size: 18px;
  font-weight: bold;
}

.payment-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
}

.final-amount {
  color: #fff;
}

.final-amount .amount {
  color: #07cfa1;
  font-size: 24px;
  font-weight: bold;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .payment-content {
    padding: 16px;
  }

  .methods-list {
    grid-template-columns: 1fr;
  }

  .payment-actions {
    flex-direction: column;
    gap: 16px;
  }

  .action-buttons {
    width: 100%;
    display: flex;
    gap: 12px;
  }

  .action-buttons .el-button {
    flex: 1;
  }
}
</style>