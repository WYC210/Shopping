<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header height="80px" class="home-header">
      <HomeHeader />
    </el-header>

    <!-- 主体内容 -->
    <el-container class="main-container">
      <!-- 左侧分类菜单 -->
      <el-aside width="200px" class="category-aside hidden-md-and-down">
        <CategoryMenu :contentHeight="'calc(100vh - 80px)'" @category-change="handleCategoryChange" />
      </el-aside>

      <!-- 主要内容区域 -->
      <el-main>
        <el-row :gutter="24">
          <!-- 轮播图 -->
          <el-col :span="24" class="mb-5">
            <HomeCarousel :contentHeight="'400px'" />
          </el-col>

          <!-- 商品展示区域 -->
          <el-col :span="24">
            <div class="section-title">
              <h2>热销商品</h2>
              <el-button text @click="goToProductList">查看全部</el-button>
            </div>

            <!-- 添加下拉刷新提示 -->
            <div 
              v-if="refreshDistance > 0" 
              class="refresh-indicator"
              :style="{ transform: `translateY(${Math.min(refreshDistance, refreshThreshold)}px)` }"
            >
              {{ refreshDistance > refreshThreshold ? '释放刷新' : '下拉刷新' }}
            </div>

            <el-row :gutter="20">
              <el-col 
                v-for="product in featuredProducts" 
                :key="product.productId"
                :xs="12"
                :sm="8"
                :md="6"
                :lg="4"
                :xl="4"
                class="mb-3"
              >
                <ProductCard 
                  :product="{
                    ...product,
                    imageUrl: product.imageUrl || '/logo_w.png'
                  }" 
                />
              </el-col>
            </el-row>

            <!-- 加载状态提示 -->
            <div v-if="isLoading" class="loading-more">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载中...</span>
            </div>
            
            <!-- 没有更多数据提示 -->
            <div v-if="!hasMore && featuredProducts.length > 0" class="no-more">
              没有更多数据了
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/types/store/user";
import HomeHeader from "./components/HomeHeader.vue";
import CategoryMenu from "./components/CategoryMenu.vue";
import HomeCarousel from "./components/HomeCarousel.vue";
import ProductCard from "./components/ProductCard.vue";
import type { Category, FilterParams, SortParams } from "@/types/store/HomeType";
import { productService } from "@/api/modules/product";
import type { Product } from "@/types/api/product";
import errorImage from '@/assets/logo_w.png'; // 导入默认图片

const router = useRouter();
const userStore = useUserStore();
const isLoading = ref(false);
const featuredProducts = ref<Product[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const hasMore = ref(true);
const viewMode = ref<"grid" | "list">("grid");

// 筛选参数
const filterParams = reactive<FilterParams>({
  categoryId: null,
  price: { min: null, max: null },
  ratings: [],
  tags: [],
  keyword: ""
});

// 排序参数
const sortParams = reactive<SortParams>({
  field: "default",
  order: "desc"
});

const handleCategoryChange = (category: Category) => {
  filterParams.categoryId = category.id || null;
};

const handleSortChange = (field: string) => {
  sortParams.field = field;
};

const goToProductList = () => {
  router.push({ name: 'ProductList' });
};

// 获取商品列表
const fetchProducts = async (isLoadMore = false) => {
  if (isLoading.value || (!isLoadMore && !hasMore.value)) return;
  
  try {
    isLoading.value = true;
    const requestParams = {
      pageNum: isLoadMore ? currentPage.value : 1,  // 如果是加载更多，使用当前页码，否则重置为第1页
      pageSize: pageSize.value,
      categoryId: filterParams.categoryId || undefined,
      keyword: filterParams.keyword || undefined,
      imageUrl: undefined
    };
    
    const response = await productService.getProducts(requestParams);
    
    // 处理商品数据，添加默认图片
    const processedProducts = response.list.map(product => ({
      ...product,
      imageUrl: product.imageUrl ? `http://localhost:8088/products${product.imageUrl}` : errorImage
    }));
    
    if (isLoadMore) {
      // 加载更多时，将新数据追加到现有数据后面
      featuredProducts.value = [...featuredProducts.value, ...processedProducts];
      // 更新总数和是否有更多数据
      total.value = response.total;
      hasMore.value = featuredProducts.value.length < total.value;
    } else {
      // 首次加载或刷新时，直接替换数据
      currentPage.value = 1;  // 重置页码
      featuredProducts.value = processedProducts;
      total.value = response.total;
      hasMore.value = processedProducts.length < response.total;
    }
  } catch (error) {
    console.error('获取商品列表失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 修改下拉刷新处理
const handleTouchEnd = async () => {
  if (refreshDistance.value > refreshThreshold) {
    // 触发刷新
    isRefreshing.value = true;
    await fetchProducts(false);  // 明确传入 false 表示这是刷新操作
  }
  refreshStartY.value = 0;
  refreshDistance.value = 0;
  isRefreshing.value = false;
};

// 修改滚动加载处理函数
const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  
  // 当距离底部小于 100px 时触发加载更多
  if (scrollHeight - scrollTop - clientHeight < 100 && hasMore.value && !isLoading.value) {
    currentPage.value++;
    fetchProducts(true);  // 明确传入 true 表示这是加载更多操作
  }
};

// 添加下拉刷新相关变量和方法
const isRefreshing = ref(false);
const refreshStartY = ref(0);
const refreshDistance = ref(0);
const refreshThreshold = 100; // 下拉刷新阈值

const handleTouchStart = (e: TouchEvent) => {
  if (document.documentElement.scrollTop === 0) {
    refreshStartY.value = e.touches[0].clientY;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (refreshStartY.value > 0) {
    refreshDistance.value = e.touches[0].clientY - refreshStartY.value;
    if (refreshDistance.value > 0) {
      e.preventDefault();
    }
  }
};

// 检查登录状态和续签
const checkAuthStatus = async () => {
  try {
    if (userStore.isLoggedIn) {
      const isValid = await userStore.refreshAccessToken();
      if (!isValid) {
        await userStore.logout();
      }
    }
  } catch (error) {
    console.error('Token 续签检查失败:', error);
    try {
      await userStore.logout();
    } catch (logoutError) {
      console.error('清除登录状态失败:', logoutError);
    }
  }
};

// 生命周期钩子
onMounted(async () => {
  try {
    await checkAuthStatus();
  } catch (error) {
    console.error('登录状态检查失败:', error);
  } finally {
    fetchProducts();
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll);
    // 添加触摸事件监听
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
});
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: rgba(6, 5, 36, 0.95);
}

.home-header {
  padding: 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.main-container {
  margin-top: 80px;
  min-height: calc(100vh - 80px);
}

.el-main {
  padding: 16px;
  max-width: 1440px;
  margin: 0 auto;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title h2 {
  color: #24d0fe;
  margin: 0;
  font-size: 24px;
}

.mb-3 {
  margin-bottom: 12px;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .el-main {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .el-main {
    padding: 12px;
  }
}

.loading-more {
  text-align: center;
  padding: 20px 0;
  color: var(--starlight);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.no-more {
  text-align: center;
  padding: 20px 0;
  color: var(--starlight);
  opacity: 0.6;
}

.refresh-indicator {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  text-align: center;
  color: var(--starlight);
  background: rgba(6, 5, 36, 0.95);
  padding: 10px;
  z-index: 1000;
  transition: transform 0.2s;
}
</style>
