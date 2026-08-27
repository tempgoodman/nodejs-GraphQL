import { OrderService } from './OrderService';

export const buildResolvers = (orderService: OrderService) => ({
  Query: {
    getOrders: (_: any, _args: any, context: { userId?: string | null }) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }
      return orderService.getOrders(context.userId);
    },
  },
  Mutation: {
    createOrder: (_: any, { items }: { items: any[] }, context: { userId?: string | null }) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }
      return orderService.createOrder(context.userId, items);
    },
    resetOrders: () => orderService.resetOrders(),
  },
  OrderItem: {
    product: (item: any) => {
      return { __typename: 'Product', id: item.productId };
    }
  }
});