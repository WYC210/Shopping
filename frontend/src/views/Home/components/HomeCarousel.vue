<template>
  <div class="carousel-container">
    <el-carousel 
      :interval="4000" 
      :height="contentHeight"
      class="carousel"
      indicator-position="none"
      :autoplay="true"
    >
      <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
        <div class="carousel-item">
          <el-image 
            :src="getImageUrl(item.image)"
            :alt="item.title"
            fit="cover"
            class="carousel-image"
          >
            <template #error>
              <div class="image-slot">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Picture } from "@element-plus/icons-vue";

interface Props {
  contentHeight: string;
}

const props = defineProps<Props>();

// 轮播图数据
const carouselItems = ref([
  { 
    image: '/src/assets/cs.png', 
    title: '轮播图1' 
  },
  { 
    image: '/src/assets/cs2.png', 
    title: '轮播图2' 
  },
  { 
    image: '/src/assets/cs.png', 
    title: '轮播图3' 
  }
]);

// 处理图片路径
const getImageUrl = (path: string) => {
  if (!path) return '';
  // 添加基础URL前缀
  return `http://localhost:5173${path}`;
}
</script>

<style scoped>
.carousel-container {
  width: 100%;
  border-radius: var(--border-radius);
  overflow: hidden;
  background: rgb(122, 37, 37);
  box-shadow: var(--box-shadow);
}

.carousel {
  width: 100%;
}

.carousel-item {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -100;
}

/* 隐藏指示器样式 */
:deep(.el-carousel__indicators) {
  display: none; /* 隐藏底部指示器 */
}

/* 优化箭头样式 */
:deep(.el-carousel__arrow) {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 移动端适配 */
@media (max-width: 48rem) {
  :deep(.el-carousel__arrow) {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
}
</style>