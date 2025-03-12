<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productService } from '@/api/modules/product';
import type { Product } from '@/types/api/product';
import ProductCard from '@/views/Home/components/ProductCard.vue';
import HomeHeader from '@/views/Home/components/HomeHeader.vue';
import { Search } from '@element-plus/icons-vue';
import { getRandomQuote } from '@/constants/pageQuotes';

const route = useRoute();
const router = useRouter();
const products = ref<Product[]>([]);
const loading = ref(false);
const sortType = ref('default');
const priceRange = ref([0, 10000]);
const selectedRatings = ref<number[]>([]);
const randomQuote = ref(getRandomQuote('product'));

const ratingColors = ['#ff9900', '#ff9900', '#ff9900'];

// 排序后的商品列表
const sortedProducts = computed(() => {
  let result = [...products.value];
  
  switch (sortType.value) {
    case 'sales':
      result.sort((a, b) => (b.sales || 0) - (a.sales || 0));
      break;
    case 'price':
      result.sort((a, b) => a.price - b.price);
      break;
    default:
      // 综合排序，可以根据多个因素计算权重
      break;
  }
  
  return result;
});

// 切换评分筛选
const toggleRating = (rating: number) => {
  const index = selectedRatings.value.indexOf(rating);
  if (index > -1) {
    selectedRatings.value.splice(index, 1);
  } else {
    selectedRatings.value.push(rating);
  }
};

// 搜索商品
const searchProducts = async (keyword: string) => {
  loading.value = true;
  try {
    console.log('执行搜索请求，关键词:', keyword);
    const response = await productService.searchProducts(keyword);
    console.log('搜索结果:', response);
    products.value = response.list;
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    loading.value = false;
  }
};

// 监听路由参数变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword) {
      searchProducts(newKeyword as string);
    }
  },
  { immediate: true }
);

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="search-page">
    <!-- 导航栏 -->
    <HomeHeader />

    <div class="search-container">
      <!-- 页头 -->
      <el-page-header class="page-header" @back="goBack">
        <template #breadcrumb>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>搜索结果</el-breadcrumb-item>
          </el-breadcrumb>
        </template>
        
        <template #content>
          <div class="page-header-content">
            <div class="left-content">
              <el-icon class="mr-3"><Search /></el-icon>
              <span class="text-large font-600 mr-3">搜索结果</span>
              <el-tag>找到 {{ products.length }} 个商品</el-tag>
            </div>
            <div class="right-content">
              <span class="quote-text text-sm" style="color: var(--el-text-color-regular)">
                {{ randomQuote }}
              </span>
            </div>
          </div>
        </template>
      </el-page-header>

      <div class="search-content">
        <!-- 左侧筛选栏 -->
        <aside class="filter-sidebar">
          <div class="filter-section">
            <h3>价格区间</h3>
            <el-slider
              v-model="priceRange"
              range
              :min="0"
              :max="10000"
              :step="100"
            />
            <div class="price-inputs">
              <el-input-number v-model="priceRange[0]" :min="0" :step="100" />
              <span>-</span>
              <el-input-number v-model="priceRange[1]" :min="0" :step="100" />
            </div>
          </div>

          <div class="filter-section">
            <h3>商品评分</h3>
            <div class="rating-options">
              <div 
                v-for="rating in [5,4,3,2,1]" 
                :key="rating"
                class="rating-option"
                @click="toggleRating(rating)"
                :class="{ active: selectedRatings.includes(rating) }"
              >
                <el-rate :value="rating" disabled :colors="ratingColors" />
                <span>及以上</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- 右侧商品列表 -->
        <div class="search-results">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>
          
          <!-- 商品列表 -->
          <div v-else-if="products.length > 0" class="products-grid">
            <ProductCard 
              v-for="product in sortedProducts"
              :key="product.productId"
              :product="product"
            />
          </div>
          
          <!-- 无结果提示 -->
          <el-empty 
            v-else
            description="未找到相关商品"
          >
            <template #extra>
              <router-link to="/productsList">
                <el-button type="primary">查看全部商品</el-button>
              </router-link>
            </template>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background: rgba(6, 5, 36, 0.95);
}

.search-container {
  padding-top: 80px; /* 为固定导航栏留出空间 */
}

.search-header {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 0;
  position: sticky;
  top: 80px;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-title {
  color: var(--starlight);
  font-size: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-count {
  color: #724343;
  font-size: 14px;
}

.search-content {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
}

.filter-sidebar {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 180px;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section h3 {
  color: var(--starlight);
  font-size: 16px;
  margin-bottom: 16px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.price-inputs :deep(.el-input-number) {
  width: 100px;
}

.rating-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rating-option:hover,
.rating-option.active {
  background: rgba(255, 153, 0, 0.1);
}

.rating-option span {
  color: #999;
  font-size: 12px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.loading-state {
  padding: 40px;
}

:deep(.el-empty) {
  padding: 60px 0;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .search-content {
    grid-template-columns: 200px 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .search-content {
    grid-template-columns: 1fr;
  }
  
  .filter-sidebar {
    display: none; /* 在移动端可以改为抽屉式筛选器 */
  }
  
  .search-title {
    font-size: 20px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
}

/* 添加页头样式 */
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

.page-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.left-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0; /* 防止左侧内容被压缩 */
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

/* 确保页头容器也是居中的 */
:deep(.el-page-header__content) {
  display: flex;
  justify-content: flex-end;
  flex: 1;
}
</style> 