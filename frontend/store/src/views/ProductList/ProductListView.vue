<!-- views/ProductList/ProductListView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { Product } from "@/types/api/product";
import { productService } from "@/api/modules/product";
import { categoryService } from "@/api/modules/category";
import errorImage from '@/assets/cs.png';
import { ShoppingCart } from '@element-plus/icons-vue';
import { useCartStore } from '@/types/store/cart';
import type { Category } from '@/types/store/HomeType';
import HomeHeader from '@/views/Home/components/HomeHeader.vue'

interface ProductParams {
  pageNum: number;
  pageSize: number;
  sortBy: 'default' | 'price' | 'time' | 'sales';  // 排序字段
  order: 'asc' | 'desc';  // 排序方向
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
}

// 状态定义
const router = useRouter();
const products = ref<Product[]>([]);
const loading = ref(false);
const hoveredProduct = ref<Product | null>(null);
const showHoverCard = ref(false);
const hoverCardPosition = ref({ x: 0, y: 0 });
const cartStore = useCartStore();
const categories = ref<{ id: string; name: string }[]>([]);

// 分页和排序参数
const productParams = ref<ProductParams>({
  pageNum: 1,
  pageSize: 10,
  sortBy: 'default',  // 默认排序
  order: 'desc'
});

const pagination = ref<Pagination>({
  total: 0,
  pageSize: 10,
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

// 添加一个存储所有商品的数组
const allProducts = ref<Product[]>([]);

// 修改获取商品列表函数
const fetchProducts = async () => {
  try {
    loading.value = true;
    const response = await productService.getProducts({
      page: productParams.value.pageNum,
      size: productParams.value.pageSize
    });
    
    // 处理图片路径
    allProducts.value = response.list.map(product => ({
      ...product,
      imageUrl: product.imageUrl ? `http://localhost:8088/products${product.imageUrl}` : errorImage
    }));
    
    // 初始化显示，应用筛选
    filterProducts();
    
  } catch (error) {
    ElMessage.error('获取商品列表失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 添加筛选函数，根据筛选条件过滤商品
const filterProducts = () => {
  let filteredProducts = [...allProducts.value];
  
  // 根据分类筛选
  if (filterParams.value.categoryId) {
    filteredProducts = filteredProducts.filter(product => 
      product.category === filterParams.value.categoryId
    );
  }

  // 根据价格区间筛选
  if (filterParams.value.minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      product.price >= filterParams.value.minPrice!
    );
  }
  if (filterParams.value.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(product => 
      product.price <= filterParams.value.maxPrice!
    );
  }

  // 根据销量筛选
  if (filterParams.value.hasStock) {
    filteredProducts = filteredProducts.filter(product => 
      (product.sales || 0) > 0
    );
  }

  // 应用排序
  if (productParams.value.sortBy !== 'default') {
    filteredProducts.sort((a, b) => {
      switch (productParams.value.sortBy) {
        case 'price':
          return productParams.value.order === 'asc' 
            ? a.price - b.price 
            : b.price - a.price;
        case 'time':
          return productParams.value.order === 'asc'
            ? new Date(a.createTime || 0).getTime() - new Date(b.createTime || 0).getTime()
            : new Date(b.createTime || 0).getTime() - new Date(a.createTime || 0).getTime();
        case 'sales':
          return productParams.value.order === 'asc'
            ? (a.sales || 0) - (b.sales || 0)
            : (b.sales || 0) - (a.sales || 0);
        default:
          return 0;
      }
    });
  }

  // 更新显示的商品列表
  products.value = filteredProducts;
  
  // 更新分页信息
  pagination.value = {
    total: filteredProducts.length,
    pageSize: productParams.value.pageSize,
    currentPage: productParams.value.pageNum
  };
};

// 处理排序变化
const handleSortChange = (value: string) => {
  const [field, order] = value.split('-');
  productParams.value.sortBy = field as 'default' | 'price' | 'time' | 'sales';
  productParams.value.order = (order || 'desc') as 'asc' | 'desc';
  productParams.value.pageNum = 1; // 重置页码
  fetchProducts();
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  productParams.value.pageSize = size;
  productParams.value.pageNum = 1;
  fetchProducts();
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  productParams.value.pageNum = page;
  fetchProducts();
};

// 跳转到商品详情
const goToDetail = (productId: number) => {
  if (!productId) {
    ElMessage.error('商品ID不存在');
    return;
  }
  console.log('跳转到商品详情，ID:', productId);
  router.push(`/product/${productId}`);
};

// 处理图片加载错误
const handleImageError = (product: Product) => {
  product.imageUrl = errorImage;
};

// 修改分类筛选处理函数
const handleFilterChange = (categoryId: string | null) => {
  filterParams.value.categoryId = categoryId;
  productParams.value.pageNum = 1; // 重置页码
  filterProducts(); // 使用前端筛选替代重新请求
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
  filterProducts(); // 使用前端筛选
};

// 处理自定义价格范围
const handleCustomPriceRange = () => {
  if (customPriceMin.value && customPriceMax.value) {
    filterParams.value.minPrice = customPriceMin.value;
    filterParams.value.maxPrice = customPriceMax.value;
    filterParams.value.priceRange = `${customPriceMin.value}-${customPriceMax.value}`;
    filterProducts();
  }
};

// 获取分类数据
const fetchCategories = async () => {
  try {
    const response = await categoryService.getCategoryTree();
    categories.value = response.data;
    console.log(response.data);
    
  } catch (error) {
    ElMessage.error('获取分类失败');
    console.error(error);
  }
};

// 修改监听函数
watch(
  () => ({ 
    ...filterParams.value,
    ...productParams.value 
  }),
  () => {
    filterProducts(); // 使用前端筛选替代重新请求
  },
  { deep: true }
);

onMounted(() => {
  fetchCategories();
  fetchProducts(); // 获取所有商品数据
});
</script>

<template>
  <div class="product-list">
    <!-- 使用 HomeHeader 组件并传入 showManageButton prop -->
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

    <!-- 在排序选项下方添加筛选条件栏 -->
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
          <el-tag
            v-for="category in categories"
            :key="category.id"
            :class="{ active: filterParams.categoryId === category.id }"
            @click="handleFilterChange(category.id)"
          >
            {{ category.name }}
          </el-tag>
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
        v-for="product in products"
        :key="product.productId"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
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
               <!-- <h3 class="product-name">{{ product.name || '未知商品' }}</h3>
            <p class="price">¥{{ (product.price || 0).toFixed(2) }}</p>
            <p class="description">{{ product.description || '暂无描述' }}</p>
            <p class="sales">销量: {{ product.sales || 0 }}</p> -->
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="productParams.pageNum"
        v-model:page-size="productParams.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 30, 40]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped>
.product-list {
  padding: 20px;
  padding-top: 100px; /* 保持这个以给 header 留出空间 */
  background: rgba(6, 5, 36, 0.95);
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  min-height: 100vh; /* 确保最小高度占满视口 */
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
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.product-image {
  width: 100%;
  height: 200px; /* 固定高度 */
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
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 1.2em;
  color: #ffffff; /* 商品名称使用纯白色 */
}

.price {
  font-size: 1.5em;
  color: var(--cosmic-blue); /* 保持价格的蓝色 */
  margin: 10px 0;
}

.description {
  color: rgba(255, 255, 255, 0.8); /* 描述文字使用半透明白色 */
  font-size: 0.9em;
  margin: 10px 0;
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

/* 添加筛选栏样式 */
.filter-bar {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
}

.filter-group {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-group:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
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
  gap: 10px;
  align-items: center;
}

.el-tag {
  cursor: pointer;
  background: transparent;
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--starlight);
  transition: all 0.3s ease;
}

.el-tag:hover,
.el-tag.active {
  background: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
  color: white;
}

.custom-price-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom-price-range .el-input-number {
  width: 120px;
}

/* 确保复选框文字颜色正确 */
:deep(.el-checkbox__label) {
  color: var(--starlight);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
  }

  .filter-label {
    width: 100%;
    margin-bottom: 10px;
  }

  .custom-price-range {
    flex-wrap: wrap;
  }
}
</style>