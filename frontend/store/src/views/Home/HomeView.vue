<!-- views/Home/HomeView.vue -->
<template>
  <div class="home-view">
    <HomeHeader class="header" />
    
    <div class="main-content">
      <div class="search-wrapper">
        <SearchBar @search="handleSearch" class="search-section" />
      </div>
      
      <div class="content-layout">
        <aside class="sidebar">
          <CategoryMenu 
            :contentHeight="'calc(100vh - 180px)'" 
            @category-change="handleCategoryChange" 
          />
        </aside>
        
        <main class="main-area">
          <div class="carousel-wrapper">
            <HomeCarousel :contentHeight="'360px'" />
          </div>
          
          <section class="featured-section">
            <h2 class="section-title">
              <span class="title-text">热销商品</span>
              <small class="view-all" @click="goToProductList">查看全部 ></small>
            </h2>
            
            <div class="product-grid">
              <ProductCard 
                v-for="product in featuredProducts" 
                :key="product.productId" 
                :product="product"
                class="product-item"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import HomeHeader from "./components/HomeHeader.vue";
import CategoryMenu from "./components/CategoryMenu.vue";
import HomeCarousel from "./components/HomeCarousel.vue";
import ProductCard from "./components/ProductCard.vue";
import SearchBar from "./components/SearchBar.vue";
// import ProductList from "@/views/product/components/ProductList.vue";
// import ProductSorter from "@/views/product/components/ProductSorter.vue";
// import ProductFilter from "@/views/product/components/ProductFilter.vue";
import type { Category, FilterParams, SortParams } from "@/types/store/HomeType";
import { productService } from "@/api/modules/product";
import type { Product } from "@/types/api/product";

// 是否正在加载
const isLoading = ref(false);
// 特色商品数据
const featuredProducts = ref<Product[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);

const contentHeight = ref("400px");
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

const router = useRouter();

const handleSearch = (keyword: string) => {
  filterParams.keyword = keyword;
};

const handleCategoryChange = (category: Category) => {
  filterParams.categoryId = category.id || null;
};

const handleFilterChange = (filters: Partial<FilterParams>) => {
  Object.assign(filterParams, filters);
};

const handleSortChange = (field: string) => {
  sortParams.field = field;
};

const handleViewChange = (mode: "grid" | "list") => {
  viewMode.value = mode;
};

const goToProductList = () => {
  router.push({ name: 'ProductList' });
};

// 获取商品列表
const fetchProducts = async () => {
  try {
    isLoading.value = true;
    console.log('开始获取商品列表, 参数:', {
      page: currentPage.value,
      size: pageSize.value
    });

    const response = await productService.getProducts({
      page: currentPage.value,
      size: pageSize.value
    });

    console.log('获取商品列表成功:', response);
    featuredProducts.value = response.list;
  } catch (error) {
    console.error('获取商品列表失败:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log("首页组件已加载");
  fetchProducts(); // 加载商品数据
});
</script>

<style scoped>
.home-view {
  min-height: 100vh;
 
  display: flex;
  flex-direction: column;
  background: rgba(6, 5, 36, 0.95);
  position: relative;
  left: 0;
  right: 0;
  overflow-x: hidden;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-height);
 
}

.main-content {
  margin-top: 80px; /* 确保内容不与导航栏重叠 */
  flex: 1;
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-wrapper {
  width: 90%;
  max-width: var(--max-content-width);
  margin-bottom: 1.5rem;
}

.content-layout {
  width: 100%;
  max-width: var(--max-content-width);
  display: flex;
  gap: 1.25rem;
  min-height: calc(100vh - var(--header-height) - 2rem);
}

.sidebar {
  width: 20%;
  max-width: 18rem;
  min-width: 15rem;
  flex-shrink: 0;
  background: rgba(6, 5, 36, 0.95);
  border-radius: 0.75rem;
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.04);
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 0;
}

.carousel-wrapper {
  width: 100%;
  height: 22.5rem;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.04);
}

.featured-section {
  flex: 1;
  background: rgba(6, 5, 36, 0.95);
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 0.0625rem solid rgba(13, 226, 55, 0.815);;
}

.title-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  position: relative;
  padding-left: 0.75rem;
}

.title-text::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0.25rem;
  height: 1.25rem;
  background: var(--el-color-primary);
  border-radius: 0.125rem;
}

.view-all {
  font-size: 0.875rem;
  color: #999;
  cursor: pointer;
  transition: color 0.3s ease;
}

.view-all:hover {
  color: var(--el-color-primary);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1.25rem;
  width: 100%;
}

/* 响应式布局 */
@media (max-width: 80rem) { /* 1280px */
  .content-layout {
    width: 98%;
  }
  
  .sidebar {
    min-width: 14rem;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  }
}

@media (max-width: 64rem) { /* 1024px */
  .main-content {
    padding: 0.75rem;
  }
  
  .carousel-wrapper {
    height: 20rem;
  }
  
  .featured-section {
    padding: 1rem;
  }
}

@media (max-width: 48rem) { /* 768px */
  .content-layout {
    flex-direction: column;
    width: 100%;
  }
  
  .sidebar {
    width: 100%;
    max-width: none;
    min-width: 0;
  }
  
  .carousel-wrapper {
    height: 16rem;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 30rem) { /* 480px */
  .main-content {
    padding: 0.5rem;
  }
  
  .search-wrapper {
    width: 95%;
  }
  
  .carousel-wrapper {
    height: 12rem;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: 0.75rem;
  }
  
  .title-text {
    font-size: 1.125rem;
  }
}
</style>
