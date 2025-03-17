<template>
  <div class="profile-dashboard">
 
    <HomeHeader />

    <div class="dashboard-container">
      <!-- 左侧导航栏 -->
      <el-affix :offset="60">
        <aside class="sidebar">
          <el-menu
            :default-active="activeMenu"
            class="profile-menu"
            :collapse="false"
           
          >
            <el-menu-item index="overview" @click="switchTab('overview')" class="menu-item">
              <el-icon><User /></el-icon>
              <span slot="title">个人概览</span>
            </el-menu-item>

            <el-menu-item index="orders" @click="switchTab('orders')" class="menu-item">
              <el-icon><List /></el-icon>
              <span slot="title">我的订单</span>
            </el-menu-item>

            <el-menu-item index="wallet" @click="switchTab('wallet')" class="menu-item">
              <el-icon><Wallet /></el-icon>
              <span slot="title">我的钱包</span>
            </el-menu-item>

            <el-menu-item index="history" @click="switchTab('history')" class="menu-item">
              <el-icon><Timer /></el-icon>
              <span slot="title">浏览历史</span>
            </el-menu-item>

            <el-menu-item index="settings" @click="switchTab('settings')" class="menu-item">
              <el-icon><Setting /></el-icon>
              <span slot="title">账号设置</span>
            </el-menu-item>
          </el-menu>
        </aside>
      </el-affix>

      <!-- 主内容区 -->
      <main class="main-content">
        <div class="dashboard-header">
          <h1>{{ getCurrentTabTitle }}</h1>
          <el-button type="primary" @click="openEditDrawer">编辑资料</el-button>
        </div>

        <section class="dashboard-body">
          <!-- 个人概览页 -->
          <div v-if="activeMenu === 'overview'" class="content-card">
            <!-- 欢迎横幅 -->
            <div class="welcome-banner">
              <h2>欢迎回来, {{ userInfo.username || '用户' }}！</h2>
              <p>今天是 {{ currentDate }}</p>
              <p>Tips: {{ randomQuote }}</p>
            </div>

            <!-- 统计数据卡片 -->
            <div class="cards-grid">
              <el-card class="card stat-card">
                <div class="card-header">
                  <el-icon><ShoppingCart /></el-icon>
                  <span>订单总数</span>
                </div>
                <div class="card-body">
                  {{ stats.orderCount || 0 }}
                </div>
              </el-card>

              <el-card class="card stat-card">
                <div class="card-header">
                  <el-icon><Wallet /></el-icon>
                  <span>账户余额</span>
                </div>
                <div class="card-body">
                  ¥ {{ stats.balance || 0 }}
                </div>
              </el-card>

              <el-card class="card stat-card">
                <div class="card-header">
                  <el-icon><Star /></el-icon>
                  <span>收藏商品</span>
                </div>
                <div class="card-body">
                  {{ stats.favoriteCount || 0 }}
                </div>
              </el-card>
            </div>

            <!-- 活动与优惠区域 -->
            <div class="activity-section">
              <el-card class="activity-card">
                <div class="card-header">
                  <span>最近活动</span>
                </div>
                <el-timeline>
                  <el-timeline-item
                    v-for="activity in recentActivities"
                    :key="activity.id"
                    :timestamp="activity.time"
                    :type="activity.type"
                  >
                    {{ activity.content }}
                  </el-timeline-item>
                </el-timeline>
              </el-card>

              <el-card class="recommendations-card">
                <div class="card-header">
                  <span>专属优惠</span>
                </div>
                <div class="card-body">
                  <p>您有3个专属优惠等待使用，快去看看吧！</p>
                  <el-button type="success" size="small">立即查看</el-button>
                </div>
              </el-card>
            </div>

            <!-- 最新消息 -->
            <div class="additional-section">
              <el-card class="news-card">
                <div class="card-header">
                  <span>最新消息</span>
                </div>
                <div class="card-body">
                  <p>• 您的订单 ORDER2024032001 已发货，请注意查收。</p>
                  <p>• 系统将于本周末进行维护，详情请关注邮件通知。</p>
                </div>
              </el-card>
            </div>
          </div>

          <!-- 我的订单 -->
          <div v-else-if="activeMenu === 'orders'" class="content-card">
            <el-table v-if="orders.length > 0" :data="orders" class="orders-table" style="width: 100%">
              <el-table-column prop="orderId" label="订单号" width="180" />
              <el-table-column prop="createTime" label="下单时间" width="180" />
              <el-table-column prop="totalAmount" label="金额" width="100" />
              <el-table-column prop="status" label="状态">
                <template #default="scope">
                  <el-tag :type="getOrderStatusType(scope.row.status)">
                    {{ getOrderStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <p v-else>暂无订单</p>
          </div>

          <!-- 我的钱包 -->
          <div v-else-if="activeMenu === 'wallet'" class="content-card">
            <div class="wallet-section">
              <el-card class="wallet-balance">
                <h3>账户余额</h3>
                <div class="balance">¥ {{ wallet.balance }}</div>
                <el-button type="primary">充值</el-button>
              </el-card>
              <el-card class="wallet-transactions">
                <div class="card-header">
                  <span>交易记录</span>
                </div>
                <el-table :data="wallet.transactions" style="width: 100%">
                  <el-table-column prop="time" label="时间" width="180" />
                  <el-table-column prop="type" label="类型" width="100" />
                  <el-table-column prop="amount" label="金额" />
                  <el-table-column prop="status" label="状态" />
                </el-table>
              </el-card>
            </div>
          </div>

          <!-- 浏览历史 -->
          <div v-else-if="activeMenu === 'history'" class="content-card">
            <el-tabs v-model="historyTab">
              <el-tab-pane label="商品浏览" name="products">
                <div v-if="browsingHistory.length > 0" class="history-grid">
                  <el-card
                    v-for="item in browsingHistory"
                    :key="item.historyId"
                    class="history-item"
                    @click="goToProductDetail(item.productId)"
                  >
                    <img :src="`http://localhost:8088/products${JSON.parse(item.productId).imageUrl}`" alt="商品图片" />
                    <p>商品名称: {{ JSON.parse(item.productId).name }}</p>
                    <p>浏览时间: {{ formatDate(item.browseTime) }}</p>
                  </el-card>
                </div>
                <p v-else>暂无浏览记录</p>

                <!-- 添加分页器 -->
                <div class="pagination-container">
                  <el-pagination
                    v-model:current-page="historyPagination.page"
                    v-model:page-size="historyPagination.size"
                    :total="historyPagination.total"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next"
                    @size-change="handleHistorySizeChange"
                    @current-change="handleHistoryPageChange"
                  />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 账号设置 -->
          <div v-else-if="activeMenu === 'settings'" class="content-card">
            <div class="settings-section">
              <el-card class="setting-card">
                <div class="card-header">
                  <span>个人信息</span>
                </div>
                <div class="card-body">
                  <p><strong>用户名:</strong> {{ userInfo.username }}</p>
                  <p><strong>邮箱:</strong> {{ userInfo.email }}</p>
                  <p><strong>手机:</strong> {{ userInfo.phone }}</p>
                  <p><strong>注册时间:</strong> {{ userInfo.registeredAt }}</p>
                </div>
              </el-card>

              <el-card class="setting-card">
                <div class="card-header">
                  <span>安全设置</span>
                </div>
                <el-button @click="showPasswordDialog">修改密码</el-button>
              </el-card>

              <el-card class="setting-card">
                <div class="card-header">
                  <span>通知设置</span>
                </div>
                <el-form label-position="top">
                  <el-form-item>
                    <el-switch
                      v-model="settings.emailNotification"
                      active-text="邮件通知"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-switch
                      v-model="settings.smsNotification"
                      active-text="短信通知"
                    />
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人资料"
      width="500px"
      destroy-on-close
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
      destroy-on-close
    >
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="原密码" required>
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" required>
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" required>
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordChange">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
// import {
//   User, Setting, List, Timer, Wallet,
//   ShoppingCart, Star
// } from '@element-plus/icons-vue';
import { getRandomQuote } from '@/constants/pageQuotes';
import HomeHeader from '@/views/Home/components/HomeHeader.vue';
import { serviceRegistry } from '@/api/index'; 
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const activeMenu = ref('overview');
const historyTab = ref('products');
const userInfo = ref({
  username: '',
  email: '',
  phone: '',
  registeredAt: ''
});

// 当前日期（格式化为中文）
const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const randomQuote = ref(getRandomQuote('profile'));

const stats = ref({
  orderCount: 12,
  balance: 1234.56,
  favoriteCount: 5
});

const recentActivities = ref([
  { id: 1, time: '2024-03-20 12:34:56', type: 'success', content: '订单提交成功' },
  { id: 2, time: '2024-03-21 10:20:30', type: 'info', content: '账户余额更新' }
]);

const orders = ref<any[]>([]); 

const wallet = ref({
  balance: 1234.56,
  transactions: [
    {
      time: '2024-03-20 12:34:56',
      type: '充值',
      amount: 100.0,
      status: '成功'
    }
  ]
});

// 添加分页相关的响应式变量
const historyPagination = ref({
  page: 1,
  size: 20,
  total: 0
});

// 修改 browsingHistory 的类型
const browsingHistory = ref<any[]>([]);

const router = useRouter();

const switchTab = (tab: string) => {
  console.log('切换到标签页:', tab);
  activeMenu.value = tab;
  if (tab === 'orders') {
    fetchOrders();
  } else if (tab === 'settings') {
    console.log('正在切换到账号设置页面，准备获取用户信息');
    fetchUserInfo();
  } else if (tab === 'history') {
    fetchBrowseHistory();
  }
};

const getCurrentTabTitle = computed(() => {
  const titles: Record<string, string> = {
    overview: '个人概览',
    orders: '我的订单',
    wallet: '我的钱包',
    history: '浏览历史',
    settings: '账号设置'
  };
  return titles[activeMenu.value] || '';
});

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openEditDrawer = () => {
  editDialogVisible.value = true;
};

const showPasswordDialog = () => {
  passwordDialogVisible.value = true;
};

const settings = ref({
  emailNotification: true,
  smsNotification: false
});

const editForm = ref({
  username: '',
  email: '',
  phone: ''
});

const editDialogVisible = ref(false);

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordDialogVisible = ref(false);

const fetchUserInfo = async () => {
  console.log('开始获取用户信息...');
  try {
    // 使用正确的方法名 getProfile
    const response = await serviceRegistry.user.getProfile();
    console.log('获取到的用户信息:', response);
    
    userInfo.value = {
      username: response.username || '未注册',
      email: response.email || '未设置',
      phone: response.phone || '未设置',
      registeredAt: response.createdTime ? formatDate(response.createdTime) : '未注册'
    };
    // 同时更新编辑表单的初始值
    editForm.value = {
      username: response.username || '',
      email: response.email || '',
      phone: response.phone || ''
    };
    console.log('用户信息更新成功:', userInfo.value);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败');
  }
};

const fetchOrders = async () => {
  try {
    const response = await serviceRegistry.order.getOrderList();
 
    orders.value = response.data;
  } catch (error) {
    console.error('获取订单信息失败:', error);
  }
};

// 示例：订单状态转换函数
const getOrderStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    completed: '已完成'
  };
  return map[status] || status;
};

const getOrderStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    completed: 'success'
  };
  return map[status] || 'info';
};

// 添加获取浏览记录的方法
const fetchBrowseHistory = async () => {
  try {
    const response = await serviceRegistry.user.getBrowseHistory(
      historyPagination.value.page,
      historyPagination.value.size
    );
   
    
    if (response.data && response.data.records) {
      browsingHistory.value = response.data.records; // 更新浏览历史数据
      historyPagination.value.total = response.data.total; // 更新总记录数
    }
  } catch (error) {
    console.error('获取浏览记录失败:', error);
  }
};

// 添加分页变化的处理方法
const handleHistoryPageChange = (newPage: number) => {
  historyPagination.value.page = newPage;
  fetchBrowseHistory();
};

const handleHistorySizeChange = (newSize: number) => {
  historyPagination.value.size = newSize;
  historyPagination.value.page = 1;
  fetchBrowseHistory();
};

const goToProductDetail = (productId: string) => {
  const product = JSON.parse(productId); // 解析 productId
  router.push({ name: 'Product', params: { id: product.id } }); // 跳转到商品详细页面
};

const submitEditForm = async () => {
  try {
    console.log('开始更新个人资料...');
    const response = await serviceRegistry.user.updateProfile({
      email: editForm.value.email,
      phone: editForm.value.phone
    });
    console.log('更新个人资料响应:', response);

    ElMessage.success('个人资料更新成功');
    editDialogVisible.value = false;
    await fetchUserInfo(); // 重新获取用户信息
  } catch (error) {
    console.error('更新个人资料失败:', error);
    ElMessage.error(error instanceof Error ? error.message : '更新失败，请稍后重试');
  }
};

const submitPasswordChange = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致');
    return;
  }

  try {
    console.log('开始发送修改密码请求...');
    await serviceRegistry.user.updatePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    });
    
    ElMessage.success('密码修改成功');
    passwordDialogVisible.value = false;
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error) {
    console.error('修改密码失败:', error);
    ElMessage.error(error instanceof Error ? error.message : '密码修改失败，请稍后重试');
  }
};

// 在组件挂载时获取用户信息
onMounted(() => {
  if (activeMenu.value === 'settings') {
    fetchUserInfo();
  }
});
</script>

<style scoped>
/* 整体背景及布局 */
.profile-dashboard {
  min-height: 100vh;
  background: rgba(6, 5, 36, 0.95);
  display: flex;
  flex-direction: column;
}

/* 主容器：侧边栏 + 主内容 */
.dashboard-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top: 60px; 
  background: transparent;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  background: transparent;
  padding: 20px;
  overflow-y: auto;
  margin-top: 20px; 
}

.profile-menu ::v-deep .el-menu-item {
  margin-bottom: 10px;
  border-radius: 4px;
  
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

/* 内容区头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  color: var(--starlight);
}

.dashboard-header h1 {
  font-size: 24px;
  margin: 0;
}

/* 内容主体 */
.dashboard-body {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 20px;
}

/* 欢迎横幅 */
.welcome-banner {
  text-align: center;
  margin-bottom: 30px;
  color: var(--starlight);
}
.welcome-banner h2 {
  margin: 0;
  font-size: 28px;
}
.welcome-banner p {
  margin: 8px 0 0;
  font-size: 16px;
}

/* 卡片网格布局 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  color: var(--starlight);
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-bottom: 10px;
}
.card-header el-icon {
  margin-right: 8px;
}
.card-body {
  font-size: 22px;
  font-weight: bold;
}

/* 活动与优惠区域 */
.activity-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}
.activity-card,
.recommendations-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  color: var(--starlight);
}

/* 最新消息 */
.additional-section .news-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  color: var(--starlight);
  margin-bottom: 30px;
}

/* 交易记录、订单等 */
.orders-table,
.wallet-transactions {
  margin-top: 20px;
}

/* 钱包区域 */
.wallet-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 浏览历史 */
.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.history-item img {
  width: 100%;
  border-radius: 4px;
}

/* 账号设置区域 */
.settings-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 20px;
}
.setting-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  color: var(--starlight);
}

.menu-item {
  background: rgba(8, 173, 210, 0.642); 
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 确保分页器在暗色主题下可见 */
:deep(.el-pagination) {
  --el-pagination-button-color: var(--el-color-white);
  --el-pagination-hover-color: var(--el-color-primary);
}

/* 对话框样式 */
:deep(.el-dialog) {
  background: rgba(0, 51, 102, 0.9) !important;
  border: 1px solid rgba(168, 216, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 149, 255, 0.3);
}

:deep(.el-dialog__title) {
  color: #a8d8ff !important;
}

:deep(.el-dialog__body) {
  color: #ffffff !important;
}

:deep(.el-form-item__label) {
  color: #a8d8ff !important;
}

:deep(.el-input__inner) {
  
  color: #ffffff !important;
}

:deep(.el-input__inner:focus) {
  border-color: #00ffff !important;
}

/* 修改钱包和历史记录卡片样式 */
.wallet-section .el-card,
.history-grid .el-card {
  background: rgba(0, 51, 102, 0.6) !important;
  border: none !important;
  color: #a8d8ff !important;
}

/* 卡片内部标题样式 */
.wallet-section .el-card :deep(.el-card__header),
.history-grid .el-card :deep(.el-card__header) {
  border-bottom: 1px solid rgba(168, 216, 255, 0.2);
  color: #ffffff;
}

/* 交易记录表格样式 */
.wallet-transactions :deep(.el-table) {
  background-color: transparent !important;
  color: #1c1f20 !important;
}

.wallet-transactions :deep(.el-table tr),
.wallet-transactions :deep(.el-table th) {
  background-color: transparent !important;
}

.wallet-transactions :deep(.el-table td) {
  border-bottom: 1px solid rgba(168, 216, 255, 0.1);
}
</style>
