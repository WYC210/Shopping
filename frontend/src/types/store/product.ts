
import { defineStore } from 'pinia';
import { productService } from '@/api/modules/product';
import { errorHandler } from '@/utils/errorHandler';
import type { Product as ApiProduct } from '@/types/api/product';



interface Product extends ApiProduct {
  createTime?: string;
  sales?: number;
  product_id?: string;
  is_active?: boolean;
}

interface ProductFilters {
  keyword: string;
  categoryId: string | null;
  price: {
    min: number | null;
    max: number | null;
  };
  ratings: number[];
  tags: string[];
}

interface SortOption {
  value: string;
  order?: string;
}




export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    currentProduct: null as Product | null,
    loading: false,
    error: null as string | null,
    pagination: {
      pageNum: 1,
      pageSize: 10,
      total: 0
    },
    filters: {
      keyword: '',
      categoryId: null,
      price: {
        min: null,
        max: null
      },
      ratings: [],
      tags: []
    } as ProductFilters,
    sort: {
      field: 'default',
      order: 'desc'
    }
  }),

  getters: {
    hasProducts: (state) => state.products.length > 0,
    getProductById: (state) => (id: string) => state.products.find(p => p.product_id?.toString() === id),
    filteredProducts: (state) => {
      let filtered = [...state.products];

      // 应用过滤逻辑
      if (state.filters.keyword) {
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(state.filters.keyword.toLowerCase())
        );
      }
    
      
  
      // 应用排序逻辑
      if (state.sort.field && state.sort.field !== 'default') {
        filtered.sort((a, b) => {
          switch (state.sort.field) {
            case 'priceAsc':
              return a.price - b.price;
            case 'priceDesc':
              return b.price - a.price;
            case 'newest':
              return new Date(b.createTime || '0').getTime() - new Date(a.createTime || '0').getTime();
            case 'sales':
              return (b.sales || 0) - (a.sales || 0);
            default:
              return 0;
          }
        });
      }

      return filtered;
    }
  },

  actions: {
    // 重置状态
    resetState() {
      this.products = [];
      this.currentProduct = null;
      this.error = null;
      this.loading = false;
    },

    // 更新过滤器
    updateFilters(filters: Partial<ProductFilters>) {
      this.filters = {
        ...this.filters,
        ...filters
      };
      return this.fetchProducts();
    },

    // 更新分页
    updatePagination(pagination: Partial<{ pageNum: number; pageSize: number; total: number }>) {
      this.pagination = {
        ...this.pagination,
        ...pagination
      };
      return this.fetchProducts();
    },

    // 获取商品列表
    async fetchProducts() {
      this.loading = true;
      this.error = null;

      try {
        const response = await productService.getProducts({
          page: this.pagination.pageNum,
          size: this.pagination.pageSize,
          ...this.filters
        });

        this.products = response.list || [];
        this.pagination.total = response.total || 0;
        
        return response;
      } catch (error: any) {
        const errorInfo = errorHandler.handleApiError(error);
        this.error = errorInfo.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取商品详情
    async fetchProductDetail(productId: string) {
      this.loading = true;
      this.error = null;

      try {
        const data = await productService.getProductDetails(productId);
        this.currentProduct = data;
        return data;
      } catch (error: any) {
        const errorInfo = errorHandler.handleApiError(error);
        this.error = errorInfo.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取推荐商品
    async fetchRecommendedProducts(productId: string) {
      try {
        return await productService.getRecommendedProducts(productId);
      } catch (error: any) {
        const errorInfo = errorHandler.handleApiError(error);
        this.error = errorInfo.message;
        throw error;
      }
    },

    updateSort(sortOption: SortOption) {
      this.sort = {
        field: sortOption.value,
        order: sortOption.order || 'desc'
      };
      return this.fetchProducts();
    },

  }
});