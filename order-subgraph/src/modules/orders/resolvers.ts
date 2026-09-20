import { OrderService } from './OrderService.js';
import { OrderMapper } from './OrderMapper.js';

export const buildResolvers = (orderService: OrderService) => ({
  Query: {
    getOrders: async (_: any, _args: any, context: { userId?: string | null }) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }
      const orders = await orderService.getOrders(context.userId);
      return OrderMapper.toGraphQLList(orders);
    },
  },
  Mutation: {
    createOrder: async (_: any, { items }: { items: any[] }, context: { userId?: string | null }) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }
      const order = await orderService.createOrder(context.userId, items);
      return OrderMapper.toGraphQL(order);
    },
    resetOrders: () => orderService.resetOrders(),
  },
  OrderItem: {
    product: (item: any) => {
      return { __typename: 'Product', id: item.productId };
    }
  }
});