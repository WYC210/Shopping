// src/types/store/category.ts
import { defineStore } from 'pinia';
import { serviceRegistry } from '@/api/';

interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: Category[];
  // 添加其他必要的字段
}

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [] as Category[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    // 获取所有顶级分类
    topLevelCategories: (state) => {
      return state.categories.filter(category => !category.parentId);
    },

    // 获取指定父分类的子分类
    getChildCategories: (state) => (parentId: string) => {
      return state.categories.filter(category => category.parentId === parentId);
    },

    // 根据分类ID获取分类信息
    getCategoryById: (state) => (categoryId: string) =>
      state.categories.find(category => category.id === categoryId)
  },

  actions: {
    async fetchCategories() {
      this.loading = true;
      const categoryService = serviceRegistry.category;
      try {
        const categoryTrees = await categoryService.getCategoryTree();
        // 转换为 Category 类型
        this.categories = categoryTrees.map(tree => ({
          id: tree.id,
          name: tree.name,
          parentId: tree.parentId || undefined
        }));
        return this.categories;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取分类的完整路径
    getCategoryPath(categoryId: string) {
      const path: Category[] = [];
      let currentCategory = this.getCategoryById(categoryId);
      
      while (currentCategory) {
        path.unshift(currentCategory);
        currentCategory = this.getCategoryById(currentCategory.parentId || '');
      }
      
      return path;
    }
  }
});