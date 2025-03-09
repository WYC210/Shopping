<!-- src/views/Home/components/ProductCard.vue -->
<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-image-wrapper">
      <img :src="`http://localhost:8088/products${product.imageUrl}`" :alt="product.name" @error="handleImageError" />
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-price">¥{{ product.price }}</p>
      <p class="product-description">{{ product.description }}</p>
      <p class="product-category">{{ product.category }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import type { Product } from '@/types/api/product';
import errorImage from '@/assets/cs.png';

const props = defineProps<{
  product: Product
}>();

const router = useRouter();

const goToDetail = () => {
  console.log('商品数据:', props.product);
  console.log('商品ID:', props.product.productId);
  router.push(`/product/${props.product.productId}`);
};

const handleImageError = (e: Event) => {
  const imgElement = e.target as HTMLImageElement;
  imgElement.src = errorImage;
};
</script>

<style scoped>
.product-card {
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.product-image-wrapper {
  width: 100%;
  height: 200px; /* 固定高度 */
  overflow: hidden;
}

.product-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片填满容器且不变形 */
  transition: transform 0.3s ease;
}

.product-card:hover .product-image-wrapper img {
  transform: scale(1.05); /* 悬停时图片轻微放大 */
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 1rem;
  color: #333;
  margin: 0 0 0.75rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 2.8rem;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  color: #ff4d4f;
  font-size: 1.25rem;
  font-weight: bold;
}

.product-sales {
  color: #999;
  font-size: 0.875rem;
}
</style>