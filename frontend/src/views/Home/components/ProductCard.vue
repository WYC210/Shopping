<template>
  <el-card 
    class="product-card" 
    :body-style="{ padding: '0' }"
    @click="goToDetail"
  >
    <div class="product-image-wrapper">
      <img 
        :src="productImage" 
        :alt="product.name"
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
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Product } from '@/types/api/product';

const props = defineProps<{
  product: Product
}>();

const router = useRouter();

const defaultImage = '/images/default-product.jpg';
const imageLoadError = ref(false);
const API_BASE_URL = 'http://localhost:8088/products'; // API基础路径

// 使用计算属性缓存图片URL
const productImage = computed(() => {
  if (imageLoadError.value) return defaultImage;
  return getImageUrl(props.product.imageUrl);
});

// 处理图片URL
const getImageUrl = (url: string) => {
  if (!url) return defaultImage;
  // 如果是完整的URL，直接返回
  if (url.startsWith('http')) return url;
  // 处理路径，移除开头的斜杠和可能重复的 'images/'
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;
  const imagePath = cleanPath.replace(/^images\//, '');
  return `${API_BASE_URL}/images/${imagePath}`;
};

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

// 处理图片加载错误
const handleImageError = () => {
  imageLoadError.value = true;
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
  height: 160px;
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
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: #fff;
  margin: 0 0 6px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 38px;
}

.rating-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

:deep(.el-rate) {
  height: 20px;
  line-height: 20px;
}

:deep(.el-rate__icon) {
  font-size: 14px;
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
  margin-bottom: 8px;
}

.product-price {
  color: #0ccf29;
  font-size: 16px;
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
  font-size: 12px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .product-image-wrapper {
    height: 140px;
  }
  
  .product-name {
    font-size: 13px;
    height: 36px;
  }
  
  .product-price {
    font-size: 14px;
  }
  
  .product-description {
    font-size: 12px;
  }
}
</style>