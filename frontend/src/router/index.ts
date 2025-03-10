import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/types/store/user'

import HomeView from '@/views/Home/HomeView.vue';
import ProductListView from '@/views/ProductList/ProductListView.vue';
import PaymentView from '@/views/Payment/PaymentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
 
  routes: [
    {
       path: '/',
      name: 'Home',
      component: () => import('@/views/Home/HomeView.vue'),
      meta: { 
        transition: 'fade',
        bgEffect: 'stars' 
      }
    },
 
    // router/index.ts
    {
      path: '/product/:id',
      name: 'Product',
      component: () => import('@/views/Product/ProductDetailView.vue'),
      meta: {
          transition: 'slide',
          bgEffect: 'nebula'
        },
    props: true
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Auth/LoginView.vue'),
     
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Auth/RegisterView.vue'),
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('@/views/Cart/CartView.vue'),
    },
    {
      path: '/order',
      name: 'Order',
      component: () => import('@/views/Order/OrderView.vue'),
    },

    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile/ProfileView.vue'),
    },
    {
      path: '/orderlist',
      name: 'OrderList',
      component: () => import('@/views/Order/OrderView.vue'),
    },
    {
      path: '/payment',
      name: 'Payment',
      component: PaymentView,
      meta: { requiresAuth: true },
      props: (route) => ({ orderId: route.query.orderId })
    },
   {
  path: '/:pathMatch(.*)*',
  component: () => import('@/views/NotFound.vue'), 
    },
   
{
  path: '/productsList',
  name: 'ProductList',
  component: ProductListView,
  meta: {
    transition: 'fade',
    bgEffect: 'stars'
  }
},
    {
      path: '/manage-products',
      name: 'ManageProducts',
      component: () => import('@/views/Product/ManageProductView.vue'),
      meta: {
        requiresAuth: true,
        requiresAdmin: true // 如果需要管理员权限
      }
    },
    {
      path: '/search',
      name: 'SearchResult',
      component: () => import('@/views/Product/SearchResultView.vue'),
      meta: {
        title: '搜索结果'
      }
    }
  ],
})

// 需要登录才能访问的路由
const authRoutes = ['/cart', '/orders', '/profile']

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 检查是否是需要登录的路由
  if (authRoutes.some(path => to.path.startsWith(path))) {
    // 如果未登录，重定向到登录页
    if (!userStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // 添加页面进入特效
  document.documentElement.classList.add('page-transition')
  setTimeout(() => {
    document.documentElement.classList.remove('page-transition')
  }, 1000)
  next()
})

export default router
