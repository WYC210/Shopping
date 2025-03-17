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
                <ProductCard :product="product" />
              </el-col>
            </el-row>

            <!-- 添加分页组件 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 30, 40]"
                :total="total"
                layout="total, sizes, prev, pager, next"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/types/store/user";
import HomeHeader from "./components/HomeHeader.vue";
import CategoryMenu from "./components/CategoryMenu.vue";
import HomeCarousel from "./components/HomeCarousel.vue";
import ProductCard from "./components/ProductCard.vue";
import type { Category, FilterParams, SortParams } from "@/types/store/HomeType";
import { productService } from "@/api/modules/product";
import type { Product } from "@/types/api/product";

const router = useRouter();
const userStore = useUserStore();
const isLoading = ref(false);
const featuredProducts = ref<Product[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
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
const fetchProducts = async () => {
  try {
    isLoading.value = true;
    const requestParams = {
      page: currentPage.value,
      size: pageSize.value,
      categoryId: filterParams.categoryId || undefined,
      keyword: filterParams.keyword || undefined,
      imageUrl: undefined
    };
    console.log('请求商品列表:', requestParams);
    
    const response = await productService.getProducts(requestParams);
    console.log('响应商品列表:', response);
    
    featuredProducts.value = response.list;
    total.value = response.total;
  } catch (error) {
    console.error('获取商品列表失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchProducts();
};

// 处理每页数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchProducts();
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

onMounted(async () => {
  try {
    await checkAuthStatus();
  } catch (error) {
    console.error('登录状态检查失败:', error);
  } finally {
    fetchProducts();
  }
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

.pagination {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: var(--starlight);
  --el-pagination-button-color: var(--starlight);
  --el-pagination-hover-color: var(--cosmic-blue);
}
</style>
