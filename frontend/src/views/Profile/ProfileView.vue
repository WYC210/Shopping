<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <div class="profile-header">
        <div class="avatar-container">
          <el-upload
            class="avatar-uploader"
            action="/api/users/avatar"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <el-avatar 
              :size="100" 
              :src="userStore.userInfo?.avatar || '/default-avatar.png'"
            />
            <div class="avatar-hover-text">点击更换头像</div>
          </el-upload>
        </div>
        <h2>个人中心</h2>
      </div>

      <div class="profile-content">
        <el-form 
          ref="formRef"
          :model="userForm"
          :rules="rules"
          label-width="120px"
        >
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户ID">
              {{ userStore.userInfo?.uid }}
            </el-descriptions-item>
            
            <el-descriptions-item label="用户名">
              {{ userStore.userInfo?.username }}
            </el-descriptions-item>

            <el-descriptions-item label="用户权限">
              {{ userStore.userInfo?.power === 'admin' ? '管理员' : '普通用户' }}
            </el-descriptions-item>

            <el-descriptions-item label="手机号码">
              {{ userStore.userInfo?.phone || '暂未设置' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="邮箱">
              {{ userStore.userInfo?.email || '暂未设置' }}
            </el-descriptions-item>
            
            <el-descriptions-item label="性别">
              {{ formatGender(userStore.userInfo?.gender) }}
            </el-descriptions-item>

            <el-descriptions-item label="注册时间">
              {{ formatDate(userStore.userInfo?.createdTime) }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 编辑表单，默认隐藏 -->
          <div v-if="isEditing" class="edit-form">
            <el-form-item label="手机号码" prop="phone">
              <el-input 
                v-model="userForm.phone"
                placeholder="请输入手机号码"
              />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input 
                v-model="userForm.email"
                placeholder="请输入邮箱"
              />
            </el-form-item>

            <el-form-item label="性别">
              <el-radio-group v-model="userForm.gender">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
                <el-radio :label="0">保密</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>

          <div class="action-buttons">
            <el-button 
              type="primary" 
              @click="handleEdit" 
              v-if="!isEditing"
            >
              编辑资料
            </el-button>
            <template v-else>
              <el-button 
                type="primary" 
                @click="handleSave" 
                :loading="loading"
              >
                保存
              </el-button>
              <el-button @click="cancelEdit">
                取消
              </el-button>
            </template>

            <el-button type="primary" @click="showPasswordDialog">
              修改密码
            </el-button>
            <el-button type="danger" @click="handleLogout">
              退出登录
            </el-button>
          </div>
        </el-form>
      </div>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialog.visible"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
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
          <el-button @click="passwordDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handlePasswordChange" :loading="passwordDialog.loading">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/types/store/user'
import { ElMessage } from 'element-plus'
import { userService } from '@/api/modules/user'
import type { UpdatePasswordParams } from '@/types/api/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref(null)
const passwordFormRef = ref(null)

// 用户表单数据
const userForm = reactive({
  phone: userStore.userInfo?.phone || '',
  email: userStore.userInfo?.email || '',
  gender: userStore.userInfo?.gender || 0
})

// 表单验证规则
const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 密码修改对话框
const passwordDialog = reactive({
  visible: false,
  loading: false
})

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === passwordForm.value.oldPassword) {
          callback(new Error('新密码不能与原密码相同'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  ]
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '暂无数据'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 显示修改密码对话框
const showPasswordDialog = () => {
  passwordDialog.visible = true
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 添加编辑状态控制
const isEditing = ref(false)

// 格式化性别显示
const formatGender = (gender) => {
  switch (gender) {
    case 1:
      return '男'
    case 2:
      return '女'
    case 0:
    default:
      return '保密'
  }
}

// 处理编辑按钮点击
const handleEdit = () => {
  isEditing.value = true
  // 初始化表单数据
  userForm.phone = userStore.userInfo?.phone || ''
  userForm.email = userStore.userInfo?.email || ''
  userForm.gender = userStore.userInfo?.gender || 0
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  // 重置表单数据
  userForm.phone = userStore.userInfo?.phone || ''
  userForm.email = userStore.userInfo?.email || ''
  userForm.gender = userStore.userInfo?.gender || 0
}

// 修改保存处理函数
const handleSave = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    const updatedProfile = await userService.updateProfile({
      phone: userForm.phone,
      email: userForm.email,
      gender: userForm.gender
    });

    // 更新本地用户信息
    userStore.setUserInfo(updatedProfile);
    
    ElMessage.success('个人信息更新成功');
    isEditing.value = false;
  } catch (error: any) {
    console.error('更新个人信息失败:', error);
    ElMessage.error(error.message || '更新失败');
  } finally {
    loading.value = false;
  }
};

// 修改密码
const handlePasswordChange = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();
    passwordDialog.loading = true;

    const params: UpdatePasswordParams = {
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    };

    const response = await userService.updatePassword(params);
    console.log('修改密码响应:', response);
    
    // 检查响应状态
    if (response.status === 200) {
      ElMessage.success('密码修改成功');
      passwordDialog.visible = false;
      // 清空表单
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    } else {
      // 显示后端返回的错误消息
      throw new Error(response.message || '修改密码失败');
    }
  } catch (error: any) {
    console.error('密码修改失败:', error);
    // 显示具体的错误消息
    ElMessage.error(error.response?.data?.message || error.message || '修改密码失败');
  } finally {
    passwordDialog.loading = false;
  }
};

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 头像上传成功的回调
const handleAvatarSuccess = async (response: any) => {
  try {
    const updatedProfile = await userService.updateAvatar(response.data);
    userStore.setUserInfo(updatedProfile);
    ElMessage.success('头像更新成功');
  } catch (error: any) {
    console.error('头像更新失败:', error);
    ElMessage.error(error.message || '头像更新失败');
  }
};

// 退出登录
const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    ElMessage.error('退出失败')
  }
}

// 检查登录状态并获取用户信息
const fetchUserProfile = async () => {
  try {
    loading.value = true;
    const response = await userService.getProfile();
    console.log('获取到的用户信息:', response);
    
    if (response.data) {
      const userInfo = response.data;
      // 更新 store 中的用户信息
      userStore.setUserInfo({
        uid: userInfo.uid,
        username: userInfo.username,
        power: userInfo.power,
        phone: userInfo.phone || '',
        email: userInfo.email || '',
        gender: userInfo.gender || 0,
        avatar: userInfo.avatar || 'default.jpg',
        createdTime: userInfo.createdTime
      });

      // 更新表单数据
      updateFormData({
        phone: userInfo.phone || '',
        email: userInfo.email || '',
        gender: userInfo.gender || 0
      });
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    ElMessage.error(error.message || '获取用户信息失败');
    router.push('/login');
  } finally {
    loading.value = false;
  }
};

// 更新表单数据的辅助函数
function updateFormData(userInfo: { phone: string; email: string; gender: number }) {
  userForm.phone = userInfo.phone;
  userForm.email = userInfo.email;
  userForm.gender = userInfo.gender;
  
  console.log('用户表单数据已更新:', {
    phone: userForm.phone,
    email: userForm.email,
    gender: userForm.gender
  });
}

// 在组件挂载时检查认证状态
onMounted(async () => {
  await fetchUserProfile();
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
  margin: 0 auto;
  min-height: 100vh;
  background: #0B0B2B;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.profile-card {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-header h2 {
  color: #4ECDC4;
  margin: 0;
}

.profile-content {
  padding: 20px;
  display: grid;
  grid-template-columns: minmax(300px, 1fr);
  gap: 20px;
  margin: 0 auto;
  max-width: 600px;
}

:deep(.el-descriptions) {
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  width: 100%;
  margin: 0 auto 30px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

:deep(.el-form-item:hover) {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: #fff;
}

:deep(.el-radio__label) {
  color: #fff;
}

/* 响应式布局 */
@media screen and (min-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .profile-content .el-descriptions {
    grid-column: 1 / -1;
  }
}

@media screen and (max-width: 768px) {
  .profile-container {
    padding: 10px;
    align-items: flex-start;
  }
  
  .profile-card {
    margin: 10px;
    height: auto;
  }
  
  .profile-content {
    padding: 10px;
    max-width: 100%;
  }
  
  .avatar-container :deep(.el-avatar) {
    width: 80px;
    height: 80px;
  }
  
  .el-form-item {
    margin-bottom: 15px;
  }

  :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    margin-bottom: 8px;
  }
  
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }
}

/* 暗色主题适配 */
:deep(.el-dialog) {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0 auto;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

:deep(.el-dialog__title) {
  color: #fff;
}

:deep(.el-dialog__body) {
  color: #fff;
}

/* 按钮样式优化 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  grid-column: 1 / -1;
  width: 100%;
}

:deep(.el-button) {
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 头像上传样式优化 */
.avatar-uploader {
  position: relative;
  cursor: pointer;
  display: inline-block;
}

.avatar-hover-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 50%;
  backdrop-filter: blur(2px);
}

/* 滚动条美化 */
.profile-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.profile-container::-webkit-scrollbar {
  width: 6px;
}

.profile-container::-webkit-scrollbar-track {
  background: transparent;
}

.profile-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.edit-form {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.edit-form:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style> 