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
            @error="handleImageError"
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
import { ref} from "vue";
import { Picture } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

interface Props {
  contentHeight: string;
}

interface CarouselItem {
  image: string;
  title: string;
}

defineProps<Props>();

// 轮播图数据
const carouselItems = ref<CarouselItem[]>([
  { 
    image: 'jilicart.jpeg', 
    title: '吉利汽车' 
  },
  { 
    image: 'xiaomiultra.jpeg', 
    title: '小米ultra' 
  },
  {
    image: 'hongqi.jpeg',
    title: '红旗'
  }
]);

// 处理图片路径
const getImageUrl = (imageName: string) => {
  if (!imageName) return '';
  return `http://localhost:8088/products/images/${imageName}`;
}

// 处理图片加载错误
const handleImageError = () => {
  ElMessage.error('图片加载失败');
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


:deep(.el-carousel__indicators) {
  display: none; 
}


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