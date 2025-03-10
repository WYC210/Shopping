// src/types/api/cart.type.ts
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
  selected: boolean;
  imageUrl?: string;
  cartId?: string;
  createdTime?: string;
  modifiedTime?: string;
  availableQuantity?: number;
  paidQuantity?: number;
}

export interface AddCartItemParams {
  productId: string;
  quantity?: number;
}
