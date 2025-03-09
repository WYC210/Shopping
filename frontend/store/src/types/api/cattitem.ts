export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
  selected: boolean;
  createdTime: string;
  modifiedTime: string;
  availableQuantity: number;
  paidQuantity: number;
}
