<script setup lang="ts">
import { ref,  onMounted, watch, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import type { Product } from "@/types/api/product";
import { productService } from "@/api/modules/product";
import { categoryService } from "@/api/modules/category";
import errorImage from '@/assets/logo_w.png';

import HomeHeader from '@/views/Home/components/HomeHeader.vue'
import { List, ArrowDown } from "@element-plus/icons-vue";

interface ProductParams {
  pageNum: number;
  pageSize: number;
  sortBy: string;
  order: 'asc' | 'desc';  
}

interface Pagination {
  total: number;
  pageSize: number;
  currentPage: number;
}

interface FilterParams {
  categoryId: string | null;
  priceRange: string | null;
  minPrice?: number;
  maxPrice?: number;
  hasStock: boolean;
  hasDiscount: boolean;
  keyword?: string;
}

// 修改 categories 的类型定义以支持子分类
interface Category {
  categoryId: string;
  name: string;
  children?: Category[];
}

// 状态定义
const router = useRouter();
const products = ref<Product[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const loadingMore = ref(false);
const categories = ref<Category[]>([]);

// 分页和排序参数
const productParams = ref<ProductParams>({
  pageNum: 1,
  pageSize: 20,
  sortBy: 'default',  
  order: 'desc'
});

const pagination = ref<Pagination>({
  total: 0,
  pageSize: 20,
  currentPage: 1
});

// 排序选项
const sortOptions = [
  { label: '默认排序', value: 'default' },
  { label: '价格从低到高', value: 'price-asc' },
  { label: '价格从高到低', value: 'price-desc' },
  { label: '最新上架', value: 'time-desc' },
  { label: '销量最高', value: 'sales-desc' }
];

// 价格区间选项
const priceRanges = [
  { label: '0-99元', value: '0-99' },
  { label: '100-499元', value: '100-499' },
  { label: '500-999元', value: '500-999' },
  { label: '1000-1999元', value: '1000-1999' },
  { label: '2000元以上', value: '2000-' }
];

// 自定义价格范围
const customPriceMin = ref<number>();
const customPriceMax = ref<number>();

// 初始化筛选参数
const filterParams = ref<FilterParams>({
  categoryId: null,
  priceRange: null,
  hasStock: false,
  hasDiscount: false
});

// 创建观察器
const observer = ref<IntersectionObserver | null>(null);
const loadMoreTrigger = ref<HTMLElement | null>(null);

// 添加一个计算属性来处理筛选和排序
const filteredProducts = computed(() => {
  let result = [...products.value];

  // 应用价格筛选
  if (filterParams.value.minPrice !== undefined) {
    result = result.filter(product => product.price >= filterParams.value.minPrice!);
  }
  if (filterParams.value.maxPrice !== undefined) {
    result = result.filter(product => product.price <= filterParams.value.maxPrice!);
  }

  // 应用库存筛选
  if (filterParams.value.hasStock) {
    result = result.filter(product => product.stock > 0);
  }

  // 应用排序
  const [sortField, sortOrder] = productParams.value.sortBy.split('-');
  if (sortField !== 'default') {
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'time':
          comparison = new Date(a.createTime || '').getTime() - new Date(b.createTime || '').getTime();
          break;
        case 'sales':
          comparison = (a.reviewCount || 0) - (b.reviewCount || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  return result;
});

// 获取分类数据
const fetchCategories = async () => {
  try {
    const response = await categoryService.getCategoryTree();
    categories.value = response.data;
  } catch (error) {
    ElMessage.error('获取分类失败');
    console.error(error);
  }
};

// 处理分类选择
const handleCategoryChange = async (value: string[]) => {
  // 获取最后一个选中的分类ID（最深层级的分类）
  const selectedCategoryId = value[value.length - 1];
  productParams.value.pageNum = 1;
  filterParams.value.categoryId = selectedCategoryId || null;
  products.value = []; // 清空现有商品列表
  await fetchProducts();
};

// 当前选中的分类路径
const selectedCategoryPath = ref<string[]>([]);

// 监听路由变化，更新选中的分类
watch(() => useRoute().query.category, (newCategoryId) => {
  if (newCategoryId) {
    // 找到分类的完整路径
    const findCategoryPath = (categories: Category[], targetId: string, path: string[] = []): string[] | null => {
      for (const category of categories) {
        if (category.categoryId === targetId) {
          return [...path, category.categoryId];
        }
        if (category.children) {
          const foundPath = findCategoryPath(category.children, targetId, [...path, category.categoryId]);
          if (foundPath) return foundPath;
        }
      }
      return null;
    };
    
    const path = findCategoryPath(categories.value, newCategoryId as string);
    if (path) {
      selectedCategoryPath.value = path;
    }
  } else {
    selectedCategoryPath.value = [];
  }
}, { immediate: true });

// 修改获取商品列表函数
const fetchProducts = async (isLoadMore = false) => {
  try {
    if (!isLoadMore) {
      loading.value = true;
    } else {
      loadingMore.value = true;
    }

    const requestParams = {
      pageNum: productParams.value.pageNum,
      pageSize: productParams.value.pageSize,
      categoryId: filterParams.value.categoryId || undefined,
      keyword: filterParams.value.keyword || undefined,
      imageUrl: undefined
    };
    
    const response = await productService.getProducts(requestParams);
    console.log('响应商品列表:', response);
    
    // 适配响应数据
    const newProducts = response.list.map(product => ({
      ...product,
      imageUrl: product.imageUrl ? `http://localhost:8088/products${product.imageUrl}` : errorImage
    }));

    if (isLoadMore) {
      products.value = [...products.value, ...newProducts];
    } else {
      products.value = newProducts;
    }

    // 更新分页信息
    hasMore.value = response.total > products.value.length;
    pagination.value = {
      total: response.total,
      pageSize: productParams.value.pageSize,
      currentPage: response.pageNum // 使用响应中的 pageNum
    };

  } catch (error) {
    ElMessage.error('获取商品列表失败');
    console.error(error);
  } finally {
    if (!isLoadMore) {
      loading.value = false;
    } else {
      loadingMore.value = false;
    }
  }
};

// 加载更多数据
const loadMore = () => {
  if (loadingMore.value || !hasMore.value) return;
  productParams.value.pageNum += 1;
  fetchProducts(true);
};

// 设置观察器
const setupObserver = () => {
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loadingMore.value && hasMore.value) {
        loadMore();
      }
    },
    {
      threshold: 0.1
    }
  );

  if (loadMoreTrigger.value) {
    observer.value.observe(loadMoreTrigger.value);
  }
};

// 修改排序处理函数
const handleSortChange = (value: string) => {
  productParams.value.sortBy = value;
  // 不再调用 fetchProducts
};

// 跳转到商品详情
const goToDetail = (productId: string) => {
  if (!productId) {
    ElMessage.error('商品ID不存在');
    return;
  }

  router.push(`/product/${productId}`);
};

// 处理图片加载错误
const handleImageError = (product: Product) => {
  product.imageUrl = errorImage;
};

// 修改筛选处理函数
const handleFilterChange = async (categoryId: string | null) => {
  productParams.value.pageNum = 1;
  filterParams.value.categoryId = categoryId;
  products.value = []; // 清空现有商品列表
  await fetchProducts();
};

// 修改价格区间处理函数
const handlePriceRangeChange = (range: string | null) => {
  filterParams.value.priceRange = range;
  if (range) {
    const [min, max] = range.split('-');
    filterParams.value.minPrice = Number(min);
    filterParams.value.maxPrice = max ? Number(max) : undefined;
  } else {
    filterParams.value.minPrice = undefined;
    filterParams.value.maxPrice = undefined;
  }
  // 不再调用 fetchProducts
};

// 处理自定义价格范围
const handleCustomPriceRange = () => {
  if (customPriceMin.value && customPriceMax.value) {
    filterParams.value.minPrice = customPriceMin.value;
    filterParams.value.maxPrice = customPriceMax.value;
    filterParams.value.priceRange = `${customPriceMin.value}-${customPriceMax.value}`;
    // 不再调用 fetchProducts
  }
};

// 组件挂载时获取商品和分类
onMounted(() => {
  fetchCategories();
  
  // 获取 URL 中的分类 ID
  const route = useRoute();
  const categoryId = route.query.category as string; // 获取分类ID
  filterParams.value.categoryId = categoryId || null; // 设置筛选参数中的分类ID
  
  fetchProducts(); // 获取商品列表
  setupObserver();
});

// 组件卸载时清理观察器
onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});

// 添加到现有的 script 中
const showSubCategories = ref<string | null>(null);
let mouseLeaveTimer: NodeJS.Timeout | null = null;

// 处理父分类鼠标进入
const handleCategoryMouseEnter = (categoryId: string) => {
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer);
    mouseLeaveTimer = null;
  }
  showSubCategories.value = categoryId;
};

// 处理父分类鼠标离开
const handleCategoryMouseLeave = () => {
  mouseLeaveTimer = setTimeout(() => {
    showSubCategories.value = null;
  }, 200);
};

// 处理子分类鼠标进入
const handleSubCategoriesMouseEnter = () => {
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer);
    mouseLeaveTimer = null;
  }
};

// 处理子分类鼠标离开
const handleSubCategoriesMouseLeave = () => {
  showSubCategories.value = null;
};

// 组件卸载时清理定时器
onUnmounted(() => {
  if (mouseLeaveTimer) {
    clearTimeout(mouseLeaveTimer);
  }
});
</script>

<template>
  <div class="product-list">
  
    <HomeHeader :showManageButton="true" />
    
    <!-- 排序选项 -->
    <div class="sort-options">
      <el-select 
        v-model="productParams.sortBy" 
        placeholder="排序方式"
        @change="handleSortChange"
      >
        <el-option 
          v-for="option in sortOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </div>

    <!-- 重新设计的分类筛选栏 -->
    <div class="filter-bar">
      <!-- 分类筛选 -->
      <div class="filter-group">
        <div class="filter-label">分类：</div>
        <div class="filter-options">
          <el-tag
            :class="{ active: !filterParams.categoryId }"
            @click="handleFilterChange(null)"
          >
            全部
          </el-tag>
          <template v-for="category in categories" :key="category.categoryId">
            <!-- 父分类 -->
            <div class="category-item" 
              @mouseenter="handleCategoryMouseEnter(category.categoryId)"
              @mouseleave="handleCategoryMouseLeave"
            >
              <el-tag
                :class="{ 
                  active: filterParams.categoryId === category.categoryId,
                  'has-children': category.children?.length
                }"
                @click="handleFilterChange(category.categoryId)"
              >
                {{ category.name }}
                <el-icon v-if="category.children?.length" class="arrow"><ArrowDown /></el-icon>
              </el-tag>
              
              <!-- 子分类弹出层 -->
              <div v-if="category.children?.length && showSubCategories === category.categoryId" 
                class="sub-categories"
                @mouseenter="handleSubCategoriesMouseEnter"
                @mouseleave="handleSubCategoriesMouseLeave"
              >
                <el-tag
                  v-for="subCategory in category.children"
                  :key="subCategory.categoryId"
                  :class="{ active: filterParams.categoryId === subCategory.categoryId }"
                  @click="handleFilterChange(subCategory.categoryId)"
                >
                  {{ subCategory.name }}
                </el-tag>
              </div>
            </div>
          </template>
        </div>
      </div>
      
      <!-- 价格区间筛选 -->
      <div class="filter-group">
        <div class="filter-label">价格：</div>
        <div class="filter-options">
          <el-tag
            :class="{ active: !filterParams.priceRange }"
            @click="handlePriceRangeChange(null)"
          >
            全部
          </el-tag>
          <el-tag
            v-for="range in priceRanges"
            :key="range.value"
            :class="{ active: filterParams.priceRange === range.value }"
            @click="handlePriceRangeChange(range.value)"
          >
            {{ range.label }}
          </el-tag>
          <div class="custom-price-range">
            <el-input-number 
              v-model="customPriceMin" 
              :min="0" 
              placeholder="最低价" 
            />
            <span>-</span>
            <el-input-number 
              v-model="customPriceMax" 
              :min="0" 
              placeholder="最高价" 
            />
            <el-button @click="handleCustomPriceRange">确定</el-button>
          </div>
        </div>
      </div>

      <!-- 其他筛选条件 -->
      <div class="filter-group">
        <div class="filter-label">其他：</div>
        <div class="filter-options">
          <el-checkbox v-model="filterParams.hasStock">仅显示有货</el-checkbox>
          <el-checkbox v-model="filterParams.hasDiscount">优惠商品</el-checkbox>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <el-row v-loading="loading" :gutter="20">
      <el-col
        v-for="product in filteredProducts"
        :key="product.productId"
        :xs="12"
        :sm="8"
        :md="6"
        :lg="4"
        :xl="4"
        class="mb-3"
      >
        <el-card
          class="product-card"
          @click="goToDetail(product.productId)"
        >
          <el-image
            class="product-image"
            :src="product.imageUrl"
            fit="cover"
            @error="() => handleImageError(product)"
          >
            <template #error>
              <el-image :src="errorImage" fit="cover" />
            </template>
          </el-image>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">¥{{ product.price.toFixed(2) }}</p>
            <p class="description">{{ product.description }}</p>
              
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 替换分页组件为加载更多触发器 -->
    <div 
      ref="loadMoreTrigger"
      class="load-more"
      v-show="hasMore"
    >
      <el-icon v-if="loadingMore" class="loading"><Loading /></el-icon>
      <span v-else>加载更多</span>
    </div>

    <!-- 没有更多数据时显示 -->
    <div v-if="!hasMore && products.length > 0" class="no-more">
      没有更多数据了
    </div>
  </div>
</template>

<style scoped>
.product-list {
  padding: 20px;
  padding-top: 100px; 
  background: rgba(6, 5, 36, 0.95);
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  min-height: 100vh; 
  width: 100%;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  z-index: 1000;
  transition: all 0.3s ease;
  background: transparent;
}

.header-fixed {
  background: rgba(6, 5, 36, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(250, 159, 252, 0.2);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
}

.logo img {
  height: 100%;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  gap: 30px;
  align-items: center;
}

.nav-item {
  color: var(--starlight);
  text-decoration: none;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: var(--cosmic-blue);
  background: rgba(250, 159, 252, 0.1);
  transform: translateY(-2px);
}

.nav-item.router-link-active {
  color: var(--cosmic-blue);
  background: rgba(250, 159, 252, 0.1);
}

.filter-section {
  margin-top: 100px; /* 确保分类不与导航栏重叠 */
}

.product-list-section {
  margin-top: 20px; /* 商品列表的顶部间距 */
}

.user-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.login-btn {
  min-width: 100px;
  background: linear-gradient(45deg, var(--aurora-pink), var(--cosmic-blue));
  border: none;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(250, 159, 252, 0.3);
}

/* 购物车图标样式 */
.el-badge :deep(.el-badge__content) {
  background-color: var(--aurora-pink);
}

/* 确保导航栏在滚动时平滑过渡 */
.header-fixed .nav-item {
  color: var(--starlight);
}

.header-fixed .nav-item:hover {
  color: var(--cosmic-blue);
}

/* 适配移动端 */
@media screen and (max-width: 768px) {
  .nav-menu {
    display: none;
  }

  .header-content {
    padding: 0 15px;
  }

  .logo {
    height: 50px;
  }
}

.manage-button {
  margin-top: 20px;
  text-align: right; /* 右对齐按钮 */
}

.sort-options {
  margin-top: 20px; /* 减小顶部边距，因为父容器已经有了足够的 padding-top */
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.sort-options .el-select {
  width: 200px;
  margin-left: 20px; /* 添加左边距 */
}

.title-divider {
  text-align: center;
  margin: 20px 0;
}

.title-divider .divider-text {
  font-size: 1.5em;
  color: var(--starlight);
  position: relative;
}

.title-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
}

.el-row {
  margin-top: 20px;
}

.product-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(87, 13, 152, 0.15);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.product-image {
  width: 100%;
  height: 160px;
  display: block;
}

:deep(.el-image) {
  width: 100%;
  height: 100%;
}

:deep(.el-image__inner) {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片填满容器且不变形 */
}

.product-info {
  padding: 12px;
}

.product-info h3 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 38px;
}

.price {
  color: #0ccf29;
  font-size: 16px;
  margin: 8px 0;
}

.description {
  font-size: 12px;
  color: #0777e7;
  margin: 8px 0;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.sales {
  color: var(--aurora-pink); /* 销量保持粉色 */
  font-size: 0.9em;
  margin: 10px 0;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

/* 分页样式 */
:deep(.el-pagination) {
  --el-pagination-bg-color: rgba(255, 255, 255, 0.05);
  --el-pagination-text-color: var(--starlight);
  --el-pagination-button-color: var(--starlight);
  --el-pagination-hover-color: var(--cosmic-blue);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
}

/* 更新筛选栏样式 */
.filter-bar {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
}

.filter-group {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-label {
  width: 80px;
  color: var(--starlight);
  font-size: 14px;
  line-height: 32px;
}

.filter-options {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.category-item {
  position: relative;
}

.el-tag {
  cursor: pointer;
  padding: 0 15px;
  height: 32px;
  line-height: 30px;
  background: transparent;
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--starlight);
  transition: all 0.3s ease;
}

.el-tag.has-children {
  padding-right: 25px;
}

.el-tag .arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  transition: transform 0.3s;
}

.el-tag:hover,
.el-tag.active {
  background: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
  color: white;
}

/* 子分类弹出层样式 */
.sub-categories {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  padding: 10px;
  background: rgba(6, 5, 36, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 200px;
  z-index: 10;
}

/* 添加一个空白区域来防止鼠标移动时菜单消失 */
.sub-categories::after {
  content: '';
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 8px;
}

.load-more {
  text-align: center;
  padding: 20px 0;
  color: var(--starlight);
  cursor: pointer;
}

.loading {
  animation: rotate 1s linear infinite;
}

.no-more {
  text-align: center;
  padding: 20px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>