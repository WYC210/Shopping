// src/api/index.ts
import { cartService } from './modules/cart';
import { userService } from './modules/user';
import { productService } from './modules/product';
import { orderService } from './modules/order';
import { paymentService } from './modules/payment';
import { searchService } from './modules/search';
import { categoryService } from './modules/category';
import { commentService } from './modules/comment';


export const serviceRegistry = {
  cart: cartService,
  user: userService,
  product: productService,
  order: orderService,
  payment: paymentService,
  search: searchService,
  category: categoryService,
  comment: commentService
};

export type ServiceRegistry = typeof serviceRegistry;

export { userService } from './modules/user';