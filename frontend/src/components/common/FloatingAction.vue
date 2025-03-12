<template>
  <div class="floating-action-wrapper">
    <el-affix position="bottom" :offset="30">
      <div class="floating-menu">
        <!-- 二级菜单按钮（径向展开） -->
        <transition-group name="fab" tag="div">
          <el-button
            v-for="(item, index) in menuItems"
            :key="item.name"
            class="action-button"
            circle
            :style="getButtonStyle(index)"
            @click="handleAction(item.action)"
          >
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </el-button>
        </transition-group>
        <!-- 主按钮：使用自定义 logo 图标 -->
        <el-button class="main-button" circle @click="toggleMenu">
          <img src="@/assets/logo_w.png" alt="Logo" class="logo-image" />
        </el-button>
      </div>
    </el-affix>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Top, Moon, ShoppingCart, User } from '@element-plus/icons-vue';
import { useUserStore } from '@/types/store/user';

const router = useRouter();
const userStore = useUserStore();
const isExpanded = ref(false);

// 定义径向展开的半径（单位：px）
const radius = 80;

const menuItems = [
  { name: 'backToTop', icon: Top, action: 'scrollTop' },
  { name: 'darkMode', icon: Moon, action: 'toggleTheme' },
  { name: 'cart', icon: ShoppingCart, action: 'goToCart' },
  { name: 'profile', icon: User, action: 'goToProfile' }
];

const toggleMenu = () => {
  isExpanded.value = !isExpanded.value;
};

const handleAction = (action: string) => {
  switch (action) {
    case 'scrollTop':
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;
    case 'toggleTheme':
      document.documentElement.classList.toggle('dark');
      break;
    case 'goToCart':
      router.push('/cart');
      break;
    case 'goToProfile':
      router.push('/profile');
      break;
  }
  isExpanded.value = false;
};

const getButtonStyle = (index: number) => {
  const n = menuItems.length;
  if (!isExpanded.value) {
    return {
      transform: 'translate(0, 0)',
      opacity: 0
    };
  }
  const startAngle = -Math.PI / 2;
  const endAngle = -Math.PI;
  const step = (endAngle - startAngle) / (n - 1);
  const angle = startAngle + step * index;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  return {
    transform: `translate(${x}px, ${y}px)`,
    opacity: 1,
    transition: 'transform 0.3s ease, opacity 0.3s ease'
  };
};
</script>

<style scoped>
.floating-action-wrapper {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
}

.floating-menu {
  position: relative;
  width: 50px;
  height: 50px;
}

/* 主按钮样式 */
.main-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 80px;
  height: 80px;
  background-color: transparent;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

/* 取消 hover 时的背景高亮 */
.main-button:hover,
.action-button:hover {
  background-color: transparent !important;
  border-color: transparent !important;
}

.main-button:hover {
  transform: scale(1.1);
}

/* 二级菜单按钮样式 */
.action-button {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background-color: #ffffff;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Logo 图片样式修改：确保为正方形并裁剪填充为圆形 */
.logo-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
}

.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s ease;
}
.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: translate(0, 0);
}

@media (max-width: 768px) {
  .floating-action-wrapper {
    bottom: 20px;
    right: 20px;
  }
  .main-button {
    width: 45px;
    height: 45px;
  }
  .action-button {
    width: 35px;
    height: 35px;
  }
  .logo-image {
    width: 25px;
    height: 25px;
  }
}
</style>
