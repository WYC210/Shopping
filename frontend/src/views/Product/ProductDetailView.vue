<!-- views/Product/ProductDetailView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { ShoppingCart, Picture, InfoFilled } from "@element-plus/icons-vue"
import { productService } from "@/api/modules/product"
import { orderService } from "@/api/modules/order"
import { useUserStore } from "@/types/store/user"
import { useOrderStore } from "@/types/store/order"
import { useCategoryStore } from "@/types/store/category"
import { useCartStore } from '@/types/store/cart'
import { useProductStore } from '@/types/store/product'
import { useCheckoutStore } from '@/types/store/checkout'
import type { Product } from '@/types/api/product'
import errorImage from '@/assets/cs.png'
import HomeHeader from '@/views/Home/components/HomeHeader.vue'
import type { OrderStatus } from '@/types/api/payment'
import { cartService } from '@/api/modules/cart'
import { getRandomQuote } from '@/constants/pageQuotes'

// 定义接口
interface ProductDetail extends Product {
  stock?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string;
  brand?: string;
  categoryId?: string;
  description?: string;
  images?: string[];
}

interface ProductDetailResponse {
  data: {
    product: ProductDetail;
    images: string[];  // 改为必需属性
  };
  status: number;
  message?: string;
}

const route = useRoute()
const router = useRouter()
const productId = route.params.id as string
const userStore = useUserStore()
const orderStore = useOrderStore()
const categoryStore = useCategoryStore()
const cartStore = useCartStore()
const productStore = useProductStore()
const checkoutStore = useCheckoutStore()

// 商品数据
const product = ref<ProductDetail | null>(null)
const loading = ref<boolean>(false)
const quantity = ref<number>(1)

// 计算属性
const productRating = computed(() => product.value?.rating || 0)
const productTags = computed(() => product.value?.tags ? product.value.tags.split(",") : [])
const categoryName = computed(() => {
  if (!product.value?.categoryId) return ""
  const category = categoryStore.getCategoryById(product.value.categoryId)
  return category?.name || ""
})
const maxQuantity = computed(() => Math.max(product.value?.stock || 0, 1))

// 监听库存变化
watch(
  () => product.value?.stock,
  (newStock?: number) => {
    if (newStock !== undefined && newStock < quantity.value) {
      quantity.value = Math.max(Math.min(newStock, 1), 1)
    }
  }
)

// 获取商品详情
const fetchProductDetail = async (): Promise<void> => {
  loading.value = true
  try {
    if (!productId) throw new Error("商品ID不存在")
    
    const response = await productService.getProductDetail(productId)
    console.log(response.data.images)
    if (response.data) {
      product.value = {
        ...response.data.product,
        images: response.data.images
        }
      
    } else {
      throw new Error("获取商品详情失败")
    }
  } catch (error) {
    console.error("获取商品详情失败:", error)
    ElMessage.error(error instanceof Error ? error.message : "获取商品详情失败")
  } finally {
    loading.value = false
  }
}

// 加入购物车
const handleAddToCart = async (): Promise<void> => {
  try {
    // 检查登录状态
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }

    if (!product.value?.stock) {
      ElMessage.warning('商品暂时无货');
      return;
    }

    console.log('发送添加购物车请求:', {
      productId: productId,
      quantity: quantity.value
    });

    const response = await cartService.addToCart({
      productId: productId,
      quantity: quantity.value
    });

    console.log('添加购物车响应:', response);
    ElMessage.success('添加到购物车成功');
  } catch (error) {
    console.error('添加到购物车失败:', error);
    ElMessage.error(`添加到购物车失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 处理立即购买
const handlePurchase = async () => {
  try {
    // 检查登录状态
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }

    // 检查商品和数量
    if (!product.value || quantity.value <= 0) {
      ElMessage.error('商品信息或数量无效');
      return;
    }

    // 构建订单项
    const orderItem = {
      productId: productId,
      quantity: quantity.value,
      price: parseFloat(Number(product.value.price).toFixed(2)),
      productName: product.value.name
    };

    console.log('发送购买请求参数:', {
      items: [orderItem]
    });

    const response = await orderService.purchaseDirectly({
      items: [orderItem]
    });

    console.log('购买响应:', response);

    if (response.status === 200) {
      ElMessage.success('订单创建成功');
      // 跳转到支付页面
      const orderData = Array.isArray(response.data) ? response.data[0] : response.data;
      router.push({
        path: '/payment', // 修改为支付页面路径
        query: { 
          orderId: orderData.orderId,
          totalAmount: orderData.totalAmount // 添加总金额参数
        }
      });
    } else {
      throw new Error(response.message || '购买失败');
    }
  } catch (error: any) {
    console.error('购买错误:', error);
    ElMessage.error(error.message || '购买失败');
  }
};

// 处理图片加载错误
const handleImageError = (e: Event): void => {
  if (product.value?.images) {
    product.value.images = [errorImage]
  }
}

// 返回商城主页
const goBack = (): void => {
  router.push({ name: 'Home' })
}

const headerRef = ref()

const randomQuote = ref('')

onMounted(() => {
  fetchProductDetail()
  randomQuote.value = getRandomQuote('productDetail')
})
</script>

<template>
  <div class="product-detail">
    <HomeHeader />
    
    <div class="detail-container">
      <!-- 页头 -->
      <el-page-header class="page-header" @back="goBack">
        <template #breadcrumb>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品详情</el-breadcrumb-item>
          </el-breadcrumb>
        </template>
        
        <template #content>
          <div class="flex items-center">
            <el-icon class="mr-3"><InfoFilled /></el-icon>
            <span class="text-large font-600 mr-3">商品详情</span>
            <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
              {{ randomQuote }}
            </span>
            <el-tag v-if="product?.stock > 0" type="success">有货</el-tag>
            <el-tag v-else type="danger">无货</el-tag>
          </div>
        </template>
      </el-page-header>

      <div v-if="product" class="product-detail">
        <!-- 商品主要内容区域 -->
        <div class="main-content">
          <!-- 左侧图片展示 -->
          <div class="left-section">
            <el-image 
              v-for="(image, index) in product.images" 
              :key="index"
              :src="image"
              fit="cover"
              class="product-image"
              @error="handleImageError"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>

          <!-- 右侧商品信息 -->
          <div class="right-section">
            <h1 class="product-title">{{ product.name }}</h1>
            <p class="product-price">¥{{ product.price }}</p>
            
            <!-- 商品信息 -->
            <div class="product-info">
              <div class="info-item">
                <span class="label">商品分类：</span>
                <span class="value">{{ categoryName }}</span>
              </div>
              <div class="info-item">
                <span class="label">商品评分：</span>
                <span class="value">{{ productRating }}分</span>
              </div>
              <div class="info-item">
                <span class="label">库存状态：</span>
                <span class="value" :class="{ 'out-of-stock': !product.stock }">
                  {{ product.stock ? `有货 (${product.stock}件)` : '无货' }}
                </span>
              </div>
            </div>
            
            <!-- SKU 选择 -->
            <div class="sku-selector">
              <label>数量：</label>
              <el-input-number 
                v-model="quantity"
                :min="1"
                :max="maxQuantity"
                size="large"
                
              />
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <el-button 
                type="primary" 
                :disabled="!product?.stock"
                @click="handlePurchase"
              >
                立即购买
              </el-button>
              <el-button 
                class="add-to-cart-btn hologram-btn"
                @click="handleAddToCart"
                :disabled="!product.stock"
              >
                加入购物车
              </el-button>
            </div>
          </div>
        </div>

        <!-- 商品详情区域 -->
        <div class="product-details">
          <h2>商品详情</h2>
          <div class="details-content">
            <p>{{ product.description }}</p>
            <!-- 可以添加更多详情内容 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.product-detail {
  min-height: 100vh;
  background: rgba(6, 5, 36, 0.95);
}

.detail-container {
  padding-top: 80px;
}

.page-header {
  background: rgba(255, 255, 255, 0.02);
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

:deep(.el-page-header__left) {
  color: var(--starlight);
}

:deep(.el-page-header__content),
:deep(.el-page-header__title) {
  color: var(--cosmic-blue);
}

:deep(.el-breadcrumb__inner) {
  color: var(--starlight);
}

:deep(.el-breadcrumb__inner.is-link:hover) {
  color: var(--cosmic-blue);
}

.product-detail-container {
  min-height: 100vh;
  background: rgba(6, 5, 36, 0.95);
  color: var(--starlight);
}

.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px 40px; /* 顶部留出导航栏空间 */
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 30px;
  border: 1px solid rgba(250, 159, 252, 0.3);
}

.left-section {
  border-radius: 10px;
  overflow: hidden;
  display: grid;
  gap: 20px;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  font-size: 24px;
  color: var(--starlight);
  margin: 0;
}

.product-price {
  font-size: 32px;
  color: var(--cosmic-blue);
  font-weight: bold;
  margin: 0;
}

.product-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item .label {
  width: 100px;
  color: var(--text-secondary);
}

.info-item .value {
  color: var(--starlight);
}

.info-item .value.out-of-stock {
  color: var(--aurora-pink);
}

.sku-selector {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(232, 12, 12, 0.1);
  color: #fa9ffc;
}

.action-buttons {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.buy-now-btn,
.add-to-cart-btn {
  flex: 1;
  height: 50px;
  font-size: 18px;
}

.buy-now-btn {
  background: linear-gradient(45deg, var(--aurora-pink), var(--cosmic-blue));
  border: none;
}

.add-to-cart-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--cosmic-blue);
  color: var(--cosmic-blue);
}

.product-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 30px;
  margin-top: 40px;
  border: 1px solid rgba(250, 159, 252, 0.3);
}

.product-details h2 {
  color: var(--starlight);
  margin-bottom: 20px;
  font-size: 20px;
}

.details-content {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-input-number) {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(250, 159, 252, 0.3);
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(250, 159, 252, 0.3);
  color: var(--starlight);
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--cosmic-blue);
}

:deep(.el-input__inner) {
  background: transparent;
  color: var(--cosmic-blue);
  font-size: 16px;
  text-align: center;
}

:deep(.el-input-number.is-disabled .el-input__inner) {
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

:deep(.el-input-number.is-disabled .el-input-number__decrease),
:deep(.el-input-number.is-disabled .el-input-number__increase) {
  color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .product-detail {
    padding: 80px 15px 20px;
  }
}

/* CSS 变量 */
:root {
  --starlight: #ffffff;
  --cosmic-blue: #24d0fe;
  --aurora-pink: #fa9ffc;
  --text-secondary: rgba(255, 255, 255, 0.7);
}

.product-image {
  width: 100%;
  height: 400px;
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: 24px;
}

.quote-text {
  font-size: 14px;
  color: var(--starlight);
  opacity: 0.8;
  font-style: italic;
  margin-top: 4px;
}

:deep(.el-page-header__content) {
  display: flex;
  justify-content: flex-end;
  flex: 1;
}

.page-header-content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}
</style>
