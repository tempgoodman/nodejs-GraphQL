export interface OrderItem {
  productId: string;
  quantity: number;
  purchasePrice: number;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: OrderItem[];
}
