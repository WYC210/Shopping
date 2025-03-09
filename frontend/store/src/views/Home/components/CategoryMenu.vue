<template>
  <section class="categories" :style="{ height: contentHeight }">
    <h2 class="category-title">商品分类</h2>
    <el-menu v-loading="loading" class="category-menu">
      <el-menu-item @click="goToProductList">查看全部商品</el-menu-item>
      <el-menu-item 
        v-for="category in categories" 
        :key="category.id"
        @click="handleCategoryClick(category)"
        @mouseenter="handleMouseEnter(category)"
        @mouseleave="handleMenuItemLeave"
      >
        <span class="category-name">{{ category.name }}</span>
      </el-menu-item>
    </el-menu>

    <!-- 子分类菜单 -->
    <div 
      class="sub-menu" 
      v-if="activeCategory && activeCategory.children?.length"
      @mouseenter="clearHideTimer"
      @mouseleave="handleSubmenuLeave"
    >
      <h3 class="sub-menu-title">{{ activeCategory.name }}</h3>
      <div class="sub-categories">
        <div 
          v-for="subCategory in activeCategory.children" 
          :key="subCategory.id" 
          class="sub-category"
          @click="handleSubCategoryClick(subCategory)"
        >
          <span class="sub-category-name">{{ subCategory.name }}</span>
          <span class="sub-category-count">({{ subCategory.count || 0 }})</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useBreakpoints } from "@vueuse/core";
import type { Category } from "@/types/store/HomeType";
import { useCategoryStore } from "@/types/store/category";
import {
  Monitor,
  Iphone,
  
  Watch,
  Camera,
  Cpu,
  Notebook,
  Printer,
  Box,
 
} from '@element-plus/icons-vue';
import { ProductService } from "@/api/modules/product";
import { useRouter } from "vue-router";
import { categoryService } from "@/api/modules/category"

interface Props {
  contentHeight: string | number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "category-change", category: Category): void;
}>();

// 使用 Pinia 状态管理
const categoryStore = useCategoryStore();
const categories = ref<Category[]>([]);  // 改为本地 ref 而不是 computed
const loading = ref(false);
const activeCategory = ref<Category | null>(null);
const activeCollapse = ref<string[]>([]);
const breakpoints = useBreakpoints({ mobile: 768 });
const isMobileView = computed(() => breakpoints.smaller("mobile"));
const activeIndex = ref("0");
let hideTimer: ReturnType<typeof setTimeout> | null = null;

// 本地状态
const router = useRouter();

// 获取分类数据
const fetchCategories = async () => {
  try {
    loading.value = true
    const response = await categoryService.getCategoryTree()
    console.log('分类响应数据:', response)
    categories.value = response.data as Category[]
  } catch (error) {
    console.error('获取分类失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理分类点击
const handleCategoryClick = (category: Category) => {
  if (!category.children?.length) {  // 如果没有子分类，直接跳转
    router.push({
      path: '/products',
      query: { category: category.categoryId.toString() }
    });
  }
};

// 处理子分类点击
const handleSubCategoryClick = (subCategory: Category) => {
  router.push({
    path: '/products',
    query: { category: subCategory.categoryId.toString() }
  })
}

// 鼠标进入分类
const handleMouseEnter = (category: Category) => {
  if (hideTimer) clearTimeout(hideTimer);
  activeCategory.value = category;
};

// 菜单项离开
const handleMenuItemLeave = () => {
  hideTimer = setTimeout(() => {
    activeCategory.value = null;
  }, 200);
};

// 子菜单离开
const handleSubmenuLeave = () => {
  hideTimer = setTimeout(() => {
    activeCategory.value = null;
  }, 200);
};

// 清除隐藏定时器
const clearHideTimer = () => {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
};

const goToProductList = () => {
  router.push({ name: 'ProductList' }); // 跳转到商品列表
};

onMounted(() => {
  fetchCategories()
});
</script>
<style scoped>
.categories {
  position: relative;
  background: rgba(6, 5, 36, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 0.75rem;
  overflow: visible; /* 修改为 visible，允许子菜单溢出 */
  padding: 1rem;
}

.category-title {
  color: var(--starlight);
  margin-bottom: 1rem;
  font-size: 1.2rem;
  padding-left: 1rem;
}

/* 主菜单样式 */
:deep(.el-menu) {
  background: transparent;
  border: none;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  height: 3rem;
  line-height: 3rem;
  color: var(--starlight) !important;
  background: transparent !important;
}

.category-name {
  margin-left: 0.5rem;
}

.item-count {
  margin-left: auto;
  font-size: 0.875rem;
  color: #999;
}

/* 子菜单样式 */
.sub-menu {
  position: absolute;
  left: 100%;
  top: 0;
  background: rgba(6, 5, 36, 0.95);
  border-radius: 0.75rem;
  padding: 1.5rem;
  min-width: 200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-left: 0.5rem;
  z-index: 22;
  backdrop-filter: blur(10px);
}

.sub-menu-title {
  color: var(--cosmic-blue);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sub-categories {
  display: grid;
  gap: 0.75rem;
}

.sub-category {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  color: var(--starlight);
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.sub-category:hover {
  background: rgba(36, 208, 254, 0.1);
  transform: translateX(0.5rem);
}

:deep(.el-menu-item:hover),
:deep(.el-menu-item.is-active) {
  color: var(--cosmic-blue) !important;
  background: rgba(255, 97, 210, 0.1) !important;
  transform: translateX(0.5rem);
}
</style>
