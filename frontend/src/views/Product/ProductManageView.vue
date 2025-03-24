<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, Edit, Search } from '@element-plus/icons-vue';
import { productService } from '@/api/modules/product';
import { categoryService } from '@/api/modules/category';
import HomeHeader from '@/views/Home/components/HomeHeader.vue';
import type { Product, ProductData } from '@/types/api/product';

// 定义分类接口
interface Category {
  categoryId: string;
  name: string;
  children?: Category[];
}

// 表格数据
const tableData = ref<Product[]>([]);
const loading = ref(false);
const categories = ref<Category[]>([]);

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 搜索条件
const searchForm = ref({
  keyword: '',
  categoryId: ''
});

// 对话框控制
const dialogVisible = ref(false);
const dialogTitle = ref('添加商品');
const formMode = ref<'add' | 'edit'>('add');

// 表单数据
const productForm = ref<ProductData & { productId?: string }>({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  categoryId: '',
  imageUrl: '',
  status: 1,
  tags: '',
  brand: ''
});

// 表单规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }]
};

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true;
  try {
    const requestParams = {
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
      keyword: searchForm.value.keyword,
      categoryId: searchForm.value.categoryId || undefined
    };
    console.log('【获取商品列表】请求参数:', requestParams);

    const response = await productService.getProducts(requestParams);
    console.log('【获取商品列表】响应数据:', response);
    
    tableData.value = response.list;
    pagination.value.total = response.total;
    pagination.value.currentPage = response.pageNum;
    pagination.value.pageSize = response.pageSize;
  } catch (error) {
    console.error('获取商品列表失败:', error);
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    console.log('【获取分类列表】发起请求');
    const response = await categoryService.getCategoryTree();
    console.log('【获取分类列表】响应数据:', response);
    categories.value = response.data as Category[];
  } catch (error) {
    console.error('获取分类列表失败:', error);
    ElMessage.error('获取分类列表失败');
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1;
  fetchProducts();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    categoryId: ''
  };
  handleSearch();
};

// 打开添加对话框
const handleAdd = () => {
  formMode.value = 'add';
  dialogTitle.value = '添加商品';
  productForm.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    imageUrl: '',
    isActive: 1,
    tags: '',
    brand: ''
  };
  dialogVisible.value = true;
};

// 打开编辑对话框
const handleEdit = (row: Product) => {
  formMode.value = 'edit';
  dialogTitle.value = '编辑商品';
  productForm.value = {
    productId: row.productId,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: row.stock,
    categoryId: row.categoryId,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    tags: row.tags,
    brand: row.brand
  };
  dialogVisible.value = true;
};

// 处理删除
const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      type: 'warning'
    });
    
    console.log('【删除商品】请求参数: productId =', row.productId);
    const response = await productService.deleteProduct(row.productId);
    console.log('【删除商品】响应数据:', response);
    
    ElMessage.success('删除成功');
    fetchProducts();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 处理分页变化
const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page;
  fetchProducts();
};

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  fetchProducts();
};

// 处理图片上传成功
const handleUploadSuccess = (response: any) => {
  console.log('【图片上传】响应数据:', response);
  productForm.value.imageUrl = response.data.url;
};

// 修改 handleSubmit 方法
const handleSubmit = async () => {
  try {
    if (formMode.value === 'add') {
      console.log('【创建商品】请求参数:', productForm.value);
      const response = await productService.createProduct(productForm.value);
      console.log('【创建商品】响应数据:', response);
      ElMessage.success('创建成功');
    } else {
      // 编辑模式
      console.log('【更新商品】请求参数:', productForm.value);
      const response = await productService.updateProduct({
        productId: productForm.value.productId!,
        name: productForm.value.name,
        price: productForm.value.price,
        stock: productForm.value.stock,
        description: productForm.value.description,
        brand: productForm.value.brand,
        tags: productForm.value.tags,
        imageUrl: productForm.value.imageUrl,
        isActive: productForm.value.isActive  // 添加状态更新
      });
      console.log('【更新商品】响应数据:', response);
      ElMessage.success('更新成功');
    }
    dialogVisible.value = false;
    fetchProducts(); // 刷新商品列表
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>

<template>
  <div class="product-manage">
    <HomeHeader :showManageButton="true" />
    
    <div class="manage-container">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item>
            <el-input
              v-model="searchForm.keyword"
              placeholder="商品名称"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-select v-model="searchForm.categoryId" placeholder="商品分类" clearable>
              <el-option
                v-for="item in categories"
                :key="item.categoryId"
                :label="item.name"
                :value="item.categoryId"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加商品
        </el-button>
      </div>

      <!-- 商品表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        class="product-table"
      >
        <el-table-column prop="productId" label="商品ID" width="120" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="isActive" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive === 1 ? 'success' : 'info'">
              {{ row.isActive === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" @click="() => handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" @click="() => handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="50%"
        class="product-dialog"
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
          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="productForm.description"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="商品价格" prop="price">
            <el-input-number
              v-model="productForm.price"
              :precision="2"
              :step="0.1"
              :min="0"
            />
          </el-form-item>
          <el-form-item label="库存数量" prop="stock">
            <el-input-number
              v-model="productForm.stock"
              :min="0"
              :step="1"
            />
          </el-form-item>
          <el-form-item label="商品分类" prop="categoryId">
            <el-select v-model="productForm.categoryId" placeholder="选择分类">
              <el-option
                v-for="category in categories"
                :key="category.categoryId"
                :label="category.name"
                :value="category.categoryId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商品图片" prop="imageUrl">
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
            >
              <img
                v-if="productForm.imageUrl"
                :src="productForm.imageUrl"
                class="avatar"
              >
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="商品状态" prop="isActive">
            <el-radio-group v-model="productForm.isActive">
              <el-radio :label="1">上架</el-radio>
              <el-radio :label="0">下架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.product-manage {
  min-height: 100vh;
  background: rgba(6, 5, 36, 0.95);
}

.manage-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-bar {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-form :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.search-form :deep(.el-input__inner) {
  color: var(--starlight);
}

.toolbar {
  margin-bottom: 20px;
}

.product-table {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.product-table :deep(.el-table__header) {
  background: rgba(255, 255, 255, 0.1);
}

.product-table :deep(.el-table__row) {
  background: transparent;
  color: var(--starlight);
}

.product-table :deep(.el-table__row:hover > td) {
  background: rgba(36, 208, 254, 0.1) !important;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.product-dialog {
  background: rgba(6, 5, 36, 0.95);
}

.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--cosmic-blue);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

:deep(.el-dialog) {
  background: rgba(6, 5, 36, 0.95);
  border: 1px solid rgba(36, 208, 254, 0.2);
  box-shadow: 0 0 20px rgba(36, 208, 254, 0.1);
}

:deep(.el-dialog__title) {
  color: var(--starlight);
}

:deep(.el-form-item__label) {
  color: var(--starlight);
}

:deep(.el-button--primary) {
  background: var(--cosmic-blue);
  border-color: var(--cosmic-blue);
}

:deep(.el-button--primary:hover) {
  background: rgba(36, 208, 254, 0.8);
  border-color: rgba(36, 208, 254, 0.8);
}

:deep(.el-table) {
  --el-table-border-color: rgba(36, 208, 254, 0.2);
  --el-table-header-bg-color: rgba(6, 5, 36, 0.95);
  --el-table-header-text-color: var(--starlight);
  --el-table-text-color: var(--starlight);
  --el-table-row-hover-bg-color: rgba(36, 208, 254, 0.1);
}

/* 全局变量 */
:root {
  --starlight: #ffffff;
  --cosmic-blue: #24d0fe;
  --aurora-pink: #fa9ffc;
}

/* 添加状态标签样式 */
.el-tag {
  min-width: 60px;
  text-align: center;
}

/* 添加单选按钮组样式 */
.el-radio-group {
  display: flex;
  gap: 20px;
}
</style> 