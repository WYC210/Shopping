<!-- src/views/Home/components/ProductCard.vue -->
<template>
  <el-card 
    class="product-card" 
    :body-style="{ padding: '0' }"
    @click="goToDetail"
  >
    <div class="product-image-wrapper">
      <el-image
        :src="`http://localhost:8088/products${product.imageUrl}`"
        :alt="product.name"
        fit="cover"
        class="product-image"
        @error="handleImageError"
      />
    </div>
    
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      
      <!-- 评分区域 -->
      <div class="rating-wrapper">
        <el-rate
          v-model="product.rating"
          :colors="['#ff9900', '#ff9900', '#FF9900']"
          :allow-half="true"
          disabled
          text-color="#ff9900"
          score-template="{value}"
        />
        <span class="review-count">({{ product.reviewCount }}条评价)</span>
      </div>

      <div class="product-meta">
        <div class="product-price">¥{{ formatPrice(product.price) }}</div>
        <div class="product-tags">
          <el-tag 
            v-for="tag in tags" 
            :key="tag"
            size="small"
            effect="dark"
            class="tag"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
      
      <p class="product-description">{{ product.description }}</p>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Product } from '@/types/api/product';
import errorImage from '@/assets/cs.png';

const props = defineProps<{
  product: Product
}>();

const router = useRouter();

// 格式化价格
const formatPrice = (price: number) => {
  return (price).toFixed(2);
};

// 处理标签
const tags = computed(() => {
  return props.product.tags ? props.product.tags.split(',') : [];
});

const goToDetail = () => {
  router.push(`/product/${props.product.productId}`);
};

const handleImageError = (e: Event) => {
  const imgElement = e.target as HTMLImageElement;
  imgElement.src = errorImage;
};
</script>

<style scoped>
.product-card {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.product-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 16px;
  color: #fff;
  margin: 0 0 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 44px;
}

.rating-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

:deep(.el-rate) {
  height: 20px;
  line-height: 20px;
}

:deep(.el-rate__icon) {
  font-size: 16px;
  margin-right: 2px;
}

.review-count {
  color: #999;
  font-size: 12px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-price {
  color: #ff9900;
  font-size: 20px;
  font-weight: bold;
}

.product-tags {
  display: flex;
  gap: 4px;
}

.tag {
  background: rgba(255, 153, 0, 0.1);
  border-color: rgba(255, 153, 0, 0.2);
  color: #ff9900;
}

.product-description {
  color: #999;
  font-size: 14px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .product-image-wrapper {
    height: 160px;
  }
  
  .product-name {
    font-size: 14px;
    height: 40px;
  }
  
  .product-price {
    font-size: 16px;
  }
  
  .product-description {
    font-size: 12px;
  }
}
</style>