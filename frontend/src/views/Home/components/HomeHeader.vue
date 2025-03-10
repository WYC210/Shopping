<template>
  <header class="header" :class="{ 'header-fixed': isScrolled }">
    <div class="header-content">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <img src="@/assets/logo_w.png" alt="Logo" />
      </router-link>

      <!-- 搜索框 -->
      <div class="search-container" :class="{ 'is-expanded': isSearchExpanded }">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品..."
          class="search-input"
          :class="{ 'is-expanded': isSearchExpanded }"
          @focus="isSearchExpanded = true"
          @blur="handleSearchBlur"
          @keyup.enter="handleSearch"
          :loading="isSearching"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <!-- 搜索建议面板 -->
        <div v-show="isSearchExpanded" class="search-suggestions">
          <!-- 加载中状态 -->
          <div v-if="isSearching" class="searching-status">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在搜索...</span>
          </div>
          
          <!-- 无结果提示 -->
          <div v-else-if="noResults" class="no-results">
            <el-empty description="未找到相关商品" />
          </div>
          
          <!-- 热门搜索 -->
          <div v-else class="hot-searches">
            <div class="suggestion-title">热门搜索</div>
            <div class="hot-tags">
              <el-tag
                v-for="tag in hotSearches"
                :key="tag"
                size="small"
                @click="handleHotSearch(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/productsList" class="nav-item">商品</router-link>
        <router-link v-if="showManageButton" to="/manage-products" class="nav-item">
          管理商品
        </router-link>
        <router-link to="/cart" class="nav-item">
          <el-badge :value="cartStore.totalCount" :hidden="!cartStore.totalCount">
            <el-icon><ShoppingCart /></el-icon>
            购物车
          </el-badge>
        </router-link>
      </nav>

      <!-- 用户区域 -->
      <div class="user-area">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar || defaultAvatar" />
              <span class="username">{{ userStore.userInfo?.username || '用户' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="orders">我的订单</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" class="login-btn hologram-btn" @click="handleLogin">
            登录
          </el-button>
        </template>
      </div>
    </div>
  </header>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ShoppingCart, Search, Loading } from "@element-plus/icons-vue";
import { useUserStore } from "@/types/store/user";
import { useCartStore } from "@/types/store/cart";
import { ElMessage } from 'element-plus';
import defaultAvatar from '@/assets/cs.png';
import { productService } from "@/api/modules/product";
import type { Product } from "@/types/api/product";

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
const isScrolled = ref(false);
const isSearchExpanded = ref(false);
const searchKeyword = ref('');

const props = defineProps({
  showManageButton: {
    type: Boolean,
    default: false
  }
})

// 热门搜索词
const hotSearches = [
  '新品上市',
  '限时特惠',
  '热销商品',
  '品牌精选',
  '今日推荐'
];

// 添加搜索结果状态
const searchResults = ref<Product[]>([]);
const isSearching = ref(false);
const noResults = ref(false);

const handleSearchBlur = () => {
  // 延迟收起,让用户有时间点击搜索建议
  setTimeout(() => {
    if (!searchKeyword.value) {
      isSearchExpanded.value = false;
    }
  }, 200);
};

const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    return;
  }

  try {
    isSearching.value = true;
    
    // 直接跳转到搜索结果页面
    router.push({
      path: '/search',
      query: { 
        keyword: searchKeyword.value.trim()
      }
    });
    
    isSearchExpanded.value = false;
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败，请稍后重试');
  } finally {
    isSearching.value = false;
  }
};

const handleHotSearch = (keyword: string) => {
  searchKeyword.value = keyword;
  handleSearch();
};

// 验证 token 是否有效
const validateToken = async () => {
  if (!userStore.accessToken) return false;
  
  try {
    // 尝试刷新 token
    const isValid = await userStore.refreshAccessToken();
    return isValid;
  } catch (error) {
    console.error('Token 验证失败:', error);
    return false;
  }
};

// 检查登录状态
const checkLoginStatus = async () => {
  console.log('检查登录状态:', {
    isLoggedIn: userStore.isLoggedIn,
    accessToken: userStore.accessToken,
    userInfo: userStore.userInfo
  });

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录');
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    });
    return false;
  }

  // 验证 token
  const isValid = await validateToken();
  console.log('Token 验证结果:', isValid);
  
  return isValid;
};

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'orders':
      router.push('/orderlist');
      break;
    case 'logout':
      await userStore.logout();
      router.push('/login');
      break;
  }
};

const handleLogin = () => {
  router.push({
    path: "/login",
    query: { redirect: router.currentRoute.value.fullPath }
  });
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// 导出 checkLoginStatus 供其他组件使用
defineExpose({
  checkLoginStatus
});
</script>
<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  z-index: 1000;
  transition: all 0.3s ease;
  background: rgba(6, 5, 36, 0.95);
  backdrop-filter: blur(10px);
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

.user-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.login-btn {
  min-width: 100px;
  background: linear-gradient(45deg, var(--aurora-pink), var(--cosmic-blue));
  border: none;
  color: var(--starlight);
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

.header-fixed .nav-item:hover,
.nav-item:hover {
  color: var(--cosmic-blue);
  background: rgba(250, 159, 252, 0.1);
  transform: translateY(-2px);
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

/* 添加全局变量 */
:root {
  --starlight: #ffffff;
  --cosmic-blue: #24d0fe;
  --aurora-pink: #fa9ffc;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(250, 159, 252, 0.1);
}

.username {
  color: var(--starlight);
  font-size: 14px;
}

:deep(.el-dropdown-menu) {
  background: rgba(6, 5, 36, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(250, 159, 252, 0.3);
}

:deep(.el-dropdown-menu__item) {
  color: var(--starlight);
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: rgba(250, 159, 252, 0.1);
  color: var(--cosmic-blue);
}

:deep(.el-dropdown-menu__item.is-disabled) {
  color: rgba(255, 255, 255, 0.4);
}

/* 添加搜索框相关样式 */
.search-container {
  position: relative;
  width: 200px;
  transition: all 0.3s ease;
  margin: 0 20px;
}

.search-container.is-expanded {
  width: 400px;
}

.search-input {
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  box-shadow: none;
}

.search-input :deep(.el-input__inner) {
  color: var(--starlight);
}

.search-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: rgba(6, 5, 36, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.suggestion-title {
  color: var(--starlight);
  font-size: 14px;
  margin-bottom: 12px;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hot-tags :deep(.el-tag) {
  cursor: pointer;
  background: rgba(250, 159, 252, 0.1);
  border-color: rgba(250, 159, 252, 0.2);
  color: var(--cosmic-blue);
  transition: all 0.3s ease;
}

.hot-tags :deep(.el-tag:hover) {
  background: rgba(250, 159, 252, 0.2);
  transform: translateY(-2px);
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .search-container {
    width: 160px;
  }
  
  .search-container.is-expanded {
    width: 280px;
  }
}

.searching-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--starlight);
  gap: 8px;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: var(--starlight);
}

:deep(.el-empty) {
  padding: 20px;
}

:deep(.el-empty__description) {
  color: var(--starlight);
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
