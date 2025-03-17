<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import {  Picture, InfoFilled } from "@element-plus/icons-vue"
import { productService } from "@/api/modules/product"
import { orderService } from "@/api/modules/order"
import { useUserStore } from "@/types/store/user"
import { useCategoryStore } from "@/types/store/category"
import { cartService } from "@/api/modules/cart"

import type {  ProductDetail } from '@/types/api/product'
import errorImage from '@/assets/logo_w.png'
import HomeHeader from '@/views/Home/components/HomeHeader.vue'

import { getRandomQuote } from '@/constants/pageQuotes'
import type { Review, ReviewResponse } from '@/types/api/review'

const route = useRoute()
const router = useRouter()
const productId = route.params.id as string
const userStore = useUserStore()
const categoryStore = useCategoryStore()

// 商品数据
const product = ref<ProductDetail | null>(null)
const loading = ref<boolean>(false)
const quantity = ref<number>(1)

// 计算属性
const productRating = computed(() => product.value?.rating || 0)

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
    

    if (response.data) {
      product.value = {
        ...response.data.product,
        images: response.data.images
      }
    } else {
      throw new Error("获取商品详情失败")
    }
  } catch (error) {
    
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

    console.log('开始添加商品到购物车:', {
      productId: productId,
      quantity: quantity.value
    });

    const response = await cartService.addToCart({
      productId: productId,
      quantity: quantity.value
    });
    console.log('添加到购物车响应:', response);
   
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

   
    const response = await orderService.purchaseDirectly({
      items: [orderItem]
    });


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



const randomQuote = ref('')

// 评论相关的响应式变量
const reviews = ref<Review[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const newReview = ref({
  rating: 5,
  content: ''
})

// 获取评论列表
const fetchReviews = async () => {
  try {
    const response = await productService.getProductReviews(
      productId,
      currentPage.value,
      pageSize.value
    );
  
  
    const typedResponse = (response as unknown) as ReviewResponse;
    if (typedResponse.data) {
      reviews.value = typedResponse.data.list || [];
      total.value = typedResponse.data.total || 0;
    }
  } catch (error) {
    console.error('获取评论失败:', error);
    ElMessage.error('获取评论失败');
  }
};

// 添加评论
const handleAddReview = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  if (!newReview.value.content.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    await productService.addReview(productId, {
      content: newReview.value.content,
      rating: newReview.value.rating
    })
    ElMessage.success('评论成功')
    newReview.value = { rating: 5, content: '' }
    fetchReviews() // 刷新评论列表
  } catch (error) {
    console.error('添加评论失败:', error)
    ElMessage.error('添加评论失败')
  }
}

// 删除评论
const handleDeleteReview = async (reviewId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await productService.deleteReview(reviewId)
    ElMessage.success('删除成功')
    fetchReviews() // 刷新评论列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error('删除评论失败')
    }
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchReviews()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchReviews()
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 添加 activeTab 的响应式变量
const activeTab = ref('details')

onMounted(() => {
  fetchProductDetail()
  randomQuote.value = getRandomQuote('productDetail')
  fetchReviews()
})

// 监听 activeTab 变化
watch(activeTab, (newTab) => {
  if (newTab === 'reviews') {
    fetchReviews() // 切换到评论标签时重新获取评论
  }
})

// 计算平均评分
const averageRating = computed(() => {
  if (!reviews.value?.length) return 0;
  const sum = reviews.value.reduce((acc: number, review: Review) => acc + review.rating, 0);
  return Number((sum / reviews.value.length).toFixed(1));
});
</script>

<template>
  <div class="product-detail">
    <HomeHeader />
    
    <div class="detail-container">
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
             <div class="right-content">
              <span class="quote-text text-sm" style="color: var(--el-text-color-regular)">
                {{ randomQuote }}
              </span>
            </div>
            <el-tag v-if="(product?.stock ?? 0) > 0" type="success">有货</el-tag>
            <el-tag v-else type="danger">无货</el-tag>
          </div>
        </template>
      </el-page-header>

      <el-tabs v-model="activeTab" class="product-tabs">
   
        <el-tab-pane label="商品详情" name="details">
          <div v-if="product" class="main-content">
      
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

          <div class="product-details">
            <h2>商品详情</h2>
            <div class="details-content">
              <p>{{ product?.description }}</p>
            </div>
          </div>
        </el-tab-pane>

        <!-- 商品评论 tab -->
        <el-tab-pane label="商品评论" name="reviews">
          <div class="reviews-section">
            <!-- 评分统计 -->
            <div class="rating-summary">
              <div class="rating-overall">
                <span class="rating-number">{{ averageRating }}</span>
                <el-rate
                  v-model="averageRating"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
                <span class="rating-count">{{ total }}条评价</span>
              </div>
            </div>

            <!-- 添加评论 -->
            <div v-if="userStore.isLoggedIn" class="add-review">
              <h3>发表评论</h3>
              <div class="review-form">
                <el-rate
                  v-model="newReview.rating"
                  show-score
                  text-color="#ff9900"
                />
                <el-input
                  v-model="newReview.content"
                  type="textarea"
                  :rows="3"
                  placeholder="请分享您的使用体验..."
                />
                <el-button type="primary" @click="handleAddReview">
                  发表评论
                </el-button>
              </div>
            </div>
            <el-alert
              v-else
              title="请登录后发表评论"
              type="info"
              :closable="false"
            />

            <!-- 评论列表 -->
            <div class="reviews-list">
              <el-empty v-if="!reviews?.length" description="暂无评论" />
              <template v-else>
                <div class="review-items">
                  <div v-for="review in reviews" :key="review.reviewId" class="review-item">
                    <div class="review-header">
                      <div class="review-user">
                        <el-avatar :size="32">{{ review.userId }}</el-avatar>
                        <span class="username">用户{{ review.userId }}</span>
                      </div>
                      <el-rate
                        v-model="review.rating"
                        disabled
                        show-score
                        text-color="#ff9900"
                      />
                    </div>
                    <div class="review-content">{{ review.content }}</div>
                    <div class="review-footer">
                      <span class="review-time">{{ formatDate(review.createdTime) }}</span>
                      <el-button
                        v-if="userStore.userId && userStore.userId === review.userId"
                        type="danger"
                        link
                        @click="handleDeleteReview(review.reviewId)"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                </div>
                
                <!-- 分页 -->
                <div class="pagination">
                  <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :total="total"
                    :page-sizes="[10, 20, 30, 50]"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                  />
                </div>
              </template>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
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

:deep(.el-button) {
  flex: 1;
  height: 45px;
  font-size: 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

/* 立即购买按钮 */
:deep(.el-button--primary) {
  background: linear-gradient(45deg, #00a8ff, #0097e6);
  border: none;
  color: #ffffff;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(45deg, #0097e6, #00a8ff);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 168, 255, 0.3);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
}

/* 加入购物车按钮 */
.add-to-cart-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(0, 168, 255, 0.5) !important;
  color: #00a8ff !important;
}

.add-to-cart-btn:hover {
  background: rgba(0, 168, 255, 0.1) !important;
  border-color: #00a8ff !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 168, 255, 0.2);
}

.add-to-cart-btn:active {
  transform: translateY(0);
}

/* 禁用状态 */
:deep(.el-button.is-disabled) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.4) !important;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
.right-content {
  flex-grow: 1; /* 占据剩余空间 */
  text-align: right; /* 文本右对齐 */
  padding-left: 20px; /* 与左侧保持一定距离 */
}

.quote-text {
  font-style: italic;
  white-space: nowrap; /* 防止文本换行 */
}

.reviews-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(250, 159, 252, 0.3);
}

.rating-summary {
  margin-bottom: 30px;
  text-align: center;
}

.rating-overall {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.rating-number {
  font-size: 36px;
  color: var(--cosmic-blue);
}

.rating-count {
  color: var(--text-secondary);
}

.add-review {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-item {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  color: var(--cosmic-blue);
}

.review-content {
  color: var(--starlight);
  margin: 10px 0;
  line-height: 1.6;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: var(--starlight);
  --el-pagination-button-color: var(--starlight);
  --el-pagination-button-bg-color: transparent;
  --el-pagination-button-disabled-color: var(--text-secondary);
  --el-pagination-button-disabled-bg-color: transparent;
  --el-pagination-hover-color: var(--cosmic-blue);
}

:deep(.el-rate) {
  --el-rate-star-color: var(--cosmic-blue);
}

/* 添加 tabs 相关样式 */
:deep(.el-tabs__item) {
  color: var(--text-secondary);
}

:deep(.el-tabs__item.is-active) {
  color: var(--cosmic-blue);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--cosmic-blue);
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.1);
}

.product-tabs {
  padding: 0 20px;
}
</style>
