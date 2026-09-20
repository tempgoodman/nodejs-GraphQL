import { Order, OrderItem } from './types.js';
import { Order as OrderDTO, OrderItem as OrderItemDTO } from '../../generated/graphql.js';

export class OrderMapper {
  static toGraphQLItem(item: OrderItem): OrderItemDTO {
    return {
      __typename: 'OrderItem',
      productId: item.productId,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice
    };
  }

  static toGraphQL(order: Order): OrderDTO {
    return {
      __typename: 'Order',
      id: order.id,
      userId: order.userId,
      status: order.status,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => OrderMapper.toGraphQLItem(item))
    };
  }

  static toGraphQLList(orders: Order[]): OrderDTO[] {
    return orders.map((order) => OrderMapper.toGraphQL(order));
  }
}
