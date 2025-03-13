
import { defineStore } from 'pinia';
import { cartService } from '@/api/modules/cart';
import { useCheckoutStore } from '@/types/store/checkout';
import { useUserStore } from '@/types/store/user';
import router from '@/router';
import { ElMessage } from 'element-plus';



interface CartItemState {
  cartItemId: string;
  cartId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  createdUser: string;
  createdTime: string;
  modifiedUser: string | null;
  modifiedTime: string;
  userId: string | null;
  orderStatus: string | null;
  isPay: boolean | null;
  paidQuantity: number;
  availableQuantity: number | null;
  selected: boolean;
}

// API 响应类型
interface ApiResponse<T> {
  state: number;
  data: T;
  message?: string;
}


export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [] as CartItemState[],
    totalCount: 0,
    loading: false,
    error: null as string | null,
    orderId: '' as string
  }),

  getters: {
    totalItems: (state) => state.cartItems.length,
    selectedItems: (state) => state.cartItems.filter(item => item.selected),
    totalPrice: (state) => {
      return state.cartItems.reduce((total, item) => {
        if (item.selected) {
          return total + (item.price * item.quantity);
        }
        return total;
      }, 0);
    }
  },

  actions: {
    async fetchCartItems() {
      try {
       
        const response = (await cartService.getCartItems() as unknown) as CartItemState[];
      
        
        if (Array.isArray(response)) {
          this.cartItems = response.map(item => ({
            ...item,
            selected: false
          }));
          
        } else {
          console.warn('API 响应格式不正确:', response);
          this.cartItems = [];
        }
      } catch (error) {
        console.error('获取购物车数据失败:', error);
        this.cartItems = [];
        throw error;
      }
    },

    async updateCartItem(id: string, quantity: number): Promise<void> {
      try {
        this.loading = true;
        await cartService.updateCartItem(id, quantity);
        // 更新本地状态
        const item = this.cartItems.find(item => item.cartId === id);
        if (item) {
          item.quantity = quantity;
        }
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async removeCartItem(itemId: string) {
      try {
        const index = this.cartItems.findIndex(item => item.cartId === itemId);
        if (index !== -1) {
          this.cartItems.splice(index, 1);
          this.totalCount = this.cartItems.length;
        }
      } catch (error: any) {
        console.error('移除购物车商品失败:', error);
        throw error;
      }
    },

    updateSelection(items: CartItemState[]) {
      this.cartItems = items;
    },

    clearCart() {
      this.cartItems = [];
    },

    async addItemToCart(cartData: { productId: string; quantity?: number }) {
      const userStore = useUserStore();
      
      if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录');
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
        return;
      }

      this.loading = true;
      this.error = null;
      try {
      
        const response = await cartService.addToCart(cartData) as unknown as ApiResponse<any>;
       
        
        if (response?.state === 200 && response?.data) {
          const item = response.data;
          const newItem: CartItemState = {
            cartItemId: item.cartItemId,
            cartId: item.cartId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName,
            imageUrl: item.imageUrl || '',
            selected: false,
            createdTime: item.createdTime,
            modifiedTime: item.modifiedTime,
            availableQuantity: item.availableQuantity,
            paidQuantity: item.paidQuantity,
            createdUser: item.createdUser || '',
            modifiedUser: item.modifiedUser || null,
            userId: item.userId || null,
            orderStatus: item.orderStatus || null,
            isPay: item.isPay || null
          };
          this.cartItems.push(newItem);
          this.totalCount = this.cartItems.length;
          ElMessage.success('添加到购物车成功');
        } else {
          throw new Error(response?.message || '添加商品到购物车失败');
        }
      } catch (error: any) {
        console.error('添加商品到购物车失败:', error);
        this.error = error.message || '添加商品到购物车失败';
        ElMessage.error(this.error || '添加商品到购物车失败');
      } finally {
        this.loading = false;
      }
    },

    setCartItems(items: CartItemState[]) {
      this.cartItems = items;
    },

    // 购物车结算
    async prepareCheckout() {
      try {
        const selectedItems = this.cartItems.filter(item => item.selected);
      

        if (selectedItems.length === 0) {
          throw new Error('请选择要结算的商品');
        }

        this.loading = true;
        ElMessage.info('正在处理结算请求...');

        const cartItemIds = selectedItems.map(item => item.cartItemId);
        
        const response = await cartService.purchaseCart(cartItemIds);
        
       
        if (response.status === 200) {
          const { orderId, totalAmount } = response.data;
          
    
          const checkoutStore = useCheckoutStore();
          checkoutStore.setOrderData({
            orderId,
            totalAmount,
            items: selectedItems.map(item => ({
              id: item.cartItemId,
              name: item.productName,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              imageUrl: item.imageUrl
            })),
            orderInfo: response.data
          });

          this.clearCheckedItems();
          ElMessage.success('结算成功，正在跳转到支付页面...');
          
     
          router.push({
            path: '/payment',
            query: { 
              orderId: orderId,
              totalAmount: totalAmount
            }
          });
          
          return response.data;
        }
      } catch (error: any) {
        console.error('结算失败:', error);
        ElMessage.error(error.message || '结算失败');
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 清空已结算的商品
    clearCheckedItems() {
      this.cartItems = this.cartItems.filter(item => !item.selected);
      this.totalCount = this.cartItems.length;
    },

    async deleteCartItem(id: string): Promise<void> {
      try {
        this.loading = true;
        await cartService.deleteCartItem(id);
        await this.fetchCartItems(); // 重新获取购物车数据
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});