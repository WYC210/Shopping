<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { productService } from '@/api/modules/product';
import type { Product } from '@/types/api/product';

const route = useRoute();
const products = ref<Product[]>([]);
const loading = ref(false);

// 获取商品列表的方法
const fetchProducts = async (keyword?: string) => {
  loading.value = true;
  try {
    let response;
    if (keyword) {
      // 如果有关键词，执行搜索
      console.log('执行搜索请求，关键词:', keyword);
      response = await productService.searchProducts(keyword);
    } else {
      // 如果没有关键词，获取全部商品
      console.log('获取全部商品');
      response = await productService.getProducts({
        page: 1,
        size: 10
      });
    }
    console.log('获取到的商品数据:', response);
    products.value = response.list;
  } catch (error) {
    console.error('获取商品失败:', error);
  } finally {
    loading.value = false;
  }
};

// 监听路由参数变化
watch(
  () => route.query,
  (query) => {
    const keyword = query.keyword as string;
    if (keyword) {
      fetchProducts(keyword);
    }
  },
  { immediate: true }
);

// 组件挂载时，只有在没有任何查询参数的情况下才获取全部商品
onMounted(() => {
  // 检查是否有任何查询参数
  const hasQueryParams = Object.keys(route.query).length > 0;
  if (!hasQueryParams) {
    console.log('没有查询参数，获取所有商品');
    fetchProducts();
  } else {
    console.log('存在查询参数，跳过获取所有商品');
  }
});
</script>

<template>
  <div class="product-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    
    <!-- 商品列表 -->
    <div v-else-if="products.length > 0" class="products-grid">
      <ProductCard 
        v-for="product in products"
        :key="product.productId"
        :product="product"
      />
    </div>
    
    <!-- 无结果提示 -->
    <el-empty 
      v-else
      :description="route.query.keyword ? '未找到相关商品' : '暂无商品'"
    />
  </div>
</template>

<style scoped>
.product-list {
  padding: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.loading-state {
  max-width: 800px;
  margin: 20px auto;
}
</style> 