<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productService } from '@/api/modules/product'
import type { Product } from '@/types/api/product'
import HomeHeader from '@/views/Home/components/HomeHeader.vue'
import { Plus } from '@element-plus/icons-vue'

// 商品列表数据
const products = ref<Product[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const isEdit = ref(false)

// 商品表单
const productForm = ref({
  productId: '',
  name: '',
  price: 0,
  description: '',
  stock: 0,
  status: 1, // 1-上架 0-下架
  imageUrl: '',
  category: ''
})

// 表单规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ]
}

// 添加分类相关的响应式变量
const categoryInput = ref('')
const categories = ref<string[]>([]) // 存储已添加的分类

// 获取我的商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await productService.getMyProducts({
      page: 1,
      size: 10 // 传递分页参数
    }, {
      'X-Device-Fingerprint': 'your-fingerprint-value', // 可选，用户的浏览器指纹
      'Authorization': 'Bearer your-access-token' // 可选，用户的身份验证令牌
    });
    console.log('发送请求: 获取我的商品列表', {
      url: '/products/my/products',
      method: 'GET',
      params: {
        page: 1,
        size: 10
      },
      headers: {
        'X-Device-Fingerprint': 'your-fingerprint-value',
        'Authorization': 'Bearer your-access-token'
      },
      response
    });
    products.value = response.data; // 更新为 response.data
  } catch (error) {
    console.error('获取我的商品列表失败:', error);
    ElMessage.error('获取我的商品列表失败')
  } finally {
    loading.value = false
  }
}

// 打开添加/编辑对话框
const openDialog = (type: 'add' | 'edit', product?: Product) => {
  dialogVisible.value = true
  isEdit.value = type === 'edit'
  dialogTitle.value = type === 'add' ? '添加商品' : '编辑商品'
  
  if (type === 'edit' && product) {
    productForm.value = { ...product }
  } else {
    productForm.value = {
      productId: '',
      name: '',
      price: 0,
      description: '',
      stock: 0,
      status: 1,
      imageUrl: '',
      category: ''
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    const submitData: any = {
      name: productForm.value.name,
      price: productForm.value.price,
      description: productForm.value.description,
      stock: productForm.value.stock,
      categoryId: categories.value.join(',') // 确保将分类数组转换为字符串
    }

    // 仅在 imageUrl 存在时才添加到 submitData
    if (productForm.value.imageUrl) {
      submitData.imageUrl = productForm.value.imageUrl;
    }

    console.log('请求体:', submitData); // 输出请求体以便调试

    let response;
    if (isEdit.value) {
      response = await productService.updateProduct({
        id: productForm.value.productId,
        ...submitData
      });
      console.log('发送请求: 更新商品', {
        url: '/products/update',
        method: 'PUT',
        data: submitData,
        response
      });
      ElMessage.success('更新成功');
    } else {
      response = await productService.createProduct(submitData);
      console.log('发送请求: 创建商品', {
        url: '/products/create',
        method: 'POST',
        data: submitData,
        response
      });
      ElMessage.success('添加成功');

      // 将新创建的商品添加到产品列表中
      products.value.push({
        ...response.data, // 假设后端返回的商品数据在 response.data 中
        category: categories.value.join(',') // 确保分类信息也被添加
      });
    }
    
    dialogVisible.value = false;
    fetchProducts(); // 重新获取商品列表
  } catch (error) {
    console.error('提交表单失败:', error);
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败');
  }
}

// 更新商品状态
const updateStatus = async (product: Product) => {
  try {
    if (product.status === 1) {
      const response = await productService.deactivateProduct(product.productId);
      console.log('发送请求: 下架商品', {
        url: `/products/deactivate/${product.productId}`,
        method: 'PUT',
        response
      });
      ElMessage.success('商品已下架')
    } else {
      const response = await productService.activateProduct(product.productId);
      console.log('发送请求: 上架商品', {
        url: `/products/activate/${product.productId}`,
        method: 'PUT',
        response
      });
      ElMessage.success('商品已上架')
    }
    fetchProducts()
  } catch (error) {
    console.error('更新商品状态失败:', error);
    ElMessage.error('状态更新失败')
  }
}

// 删除商品
const handleDelete = async (productId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await productService.deleteProduct(productId);
    console.log('发送请求: 删除商品', {
      url: `/products/${productId}`,
      method: 'DELETE',
      response
    });
    ElMessage.success('删除成功')
    fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error);
      ElMessage.error('删除失败')
    }
  }
}

// 添加分类的方法
const handleAddCategory = () => {
  const category = categoryInput.value.trim()
  if (category && !categories.value.includes(category)) {
    categories.value.push(category)
    productForm.value.category = category // 更新表单的分类
    categoryInput.value = '' // 清空输入框
  }
}

// 删除分类的方法
const handleRemoveCategory = (category: string) => {
  const index = categories.value.indexOf(category)
  if (index > -1) {
    categories.value.splice(index, 1)
    if (productForm.value.category === category) {
      productForm.value.category = '' // 如果删除的是当前选中的分类，清空表单的分类
    }
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="manage-products">
    <HomeHeader />
    
    <div class="content-wrapper">
      <!-- 顶部操作栏 -->
      <div class="top-bar">
        <h2>商品管理</h2>
        <el-button type="primary" @click="openDialog('add')">
          添加商品
        </el-button>
      </div>

      <!-- 商品列表 -->
      <el-table
        v-loading="loading"
        :data="products"
        style="width: 100%"
        class="product-table"
      >
        <el-table-column prop="productId" label="商品ID" width="180" />
        <el-table-column label="商品图片" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.imageUrl"
              fit="cover"
              class="product-image"
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">
            ¥{{ row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                :type="row.status === 1 ? 'warning' : 'success'"
                @click="updateStatus(row)"
              >
                {{ row.status === 1 ? '下架' : '上架' }}
              </el-button>
              <el-button 
                type="primary"
                @click="openDialog('edit', row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger"
                @click="handleDelete(row.productId)"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 添加/编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="50%"
      >
        <el-form
          ref="formRef"
          :model="productForm"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="productForm.name" />
          </el-form-item>
          
          <el-form-item label="商品价格" prop="price">
            <el-input-number 
              v-model="productForm.price"
              :min="0"
              :precision="2"
              :step="0.1"
            />
          </el-form-item>
          
          <el-form-item label="商品库存" prop="stock">
            <el-input-number 
              v-model="productForm.stock"
              :min="0"
              :step="1"
            />
          </el-form-item>
          
          <el-form-item label="商品分类" prop="category">
            <div class="category-input">
              <el-input
                v-model="categoryInput"
                placeholder="输入分类名称后回车添加"
                @keyup.enter="handleAddCategory"
                class="category-input__inner"
              >
                <template #append>
                  <el-button :icon="Plus" @click="handleAddCategory">
                    添加分类
                  </el-button>
                </template>
              </el-input>
            </div>
            <div class="category-tags">
              <el-tag
                v-for="category in categories"
                :key="category"
                :type="productForm.category === category ? 'success' : 'info'"
                class="category-tag"
                closable
                @click="productForm.category = category"
                @close="handleRemoveCategory(category)"
              >
                {{ category }}
              </el-tag>
              <div v-if="categories.length === 0" class="no-category">
                暂无分类，请添加
              </div>
            </div>
          </el-form-item>
          
          <el-form-item label="商品描述">
            <el-input
              v-model="productForm.description"
              type="textarea"
              rows="4"
            />
          </el-form-item>
          
          <el-form-item label="商品图片">
            <el-upload
              action="/api/upload"
              :show-file-list="false"
              :on-success="(response) => productForm.imageUrl = response.url"
            >
              <el-button type="primary">上传图片</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确定
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.manage-products {
  min-height: 100vh;
  background: rgba(6, 5, 36, 0.95);
  padding-top: 60px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.top-bar h2 {
  color: #fff;
  margin: 0;
}

.product-table {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

:deep(.el-table) {
  background-color: transparent;
  color: #fff;
}

:deep(.el-table th),
:deep(.el-table tr) {
  background-color: transparent;
}

:deep(.el-table td) {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

:deep(.el-dialog) {
  background: #1a1a1a;
}

:deep(.el-dialog__title) {
  color: #fff;
}

:deep(.el-form-item__label) {
  color: #fff;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #24d0fe;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  color: #24d0fe;
}

:deep(.el-select .el-input .el-select__caret) {
  color: #24d0fe;
}

:deep(.el-select-dropdown) {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.el-select-dropdown__item) {
  color: #24d0fe;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background: rgba(36, 208, 254, 0.1);
}

:deep(.el-select-dropdown__item.selected) {
  color: #24d0fe;
  font-weight: bold;
  background: rgba(36, 208, 254, 0.2);
}

:deep(.el-input__inner::placeholder),
:deep(.el-textarea__inner::placeholder) {
  color: rgba(36, 208, 254, 0.5);
}

:deep(.el-input.is-focus .el-input__inner),
:deep(.el-textarea.is-focus .el-textarea__inner) {
  border-color: #24d0fe;
  box-shadow: 0 0 5px rgba(36, 208, 254, 0.3);
}

:deep(.el-table) {
  color: #24d0fe;
}

:deep(.el-table th) {
  background-color: rgba(36, 208, 254, 0.1) !important;
  color: #24d0fe;
  font-weight: bold;
}

:deep(.el-table tr) {
  background-color: transparent !important;
}

:deep(.el-table td) {
  color: rgba(36, 208, 254, 0.9);
}

:deep(.el-dialog__title) {
  color: #24d0fe;
}

:deep(.el-button) {
  border: 1px solid rgba(36, 208, 254, 0.3);
  &:hover {
    border-color: #24d0fe;
    color: #24d0fe;
    background: rgba(36, 208, 254, 0.1);
  }
}

:deep(.el-button--primary) {
  background: #24d0fe;
  border-color: #24d0fe;
  color: #fff;
  &:hover {
    background: rgba(36, 208, 254, 0.8);
    color: #fff;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }
  
  .el-button-group {
    flex-direction: column;
  }
}

.category-input {
  margin-bottom: 10px;
}

.category-input__inner {
  width: 100%;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 32px;
  padding: 4px 0;
}

.category-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.category-tag:hover {
  transform: translateY(-2px);
}

.no-category {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

:deep(.el-tag) {
  background-color: rgba(36, 208, 254, 0.1);
  border-color: rgba(36, 208, 254, 0.2);
  color: #24d0fe;
}

:deep(.el-tag.el-tag--success) {
  background-color: rgba(103, 194, 58, 0.1);
  border-color: rgba(103, 194, 58, 0.2);
  color: #67c23a;
}

:deep(.el-tag .el-tag__close) {
  color: currentColor;
  &:hover {
    background-color: currentColor;
    color: var(--el-color-white);
  }
}
</style> 