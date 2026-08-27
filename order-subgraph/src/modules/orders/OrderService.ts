import { Channel } from 'amqplib';
import { Redis } from 'ioredis';

export class OrderService {
  constructor(private redis: Redis, private mqChannel: Channel) {}

async createOrder(userId: string, items: { productId: string, quantity: number }[]) {
    console.log(`User ${userId} is attempting to create an order.`);

    let totalAmount = 0;
    const orderItems = [];

    const deductPromises = items.map(async (item) => {
      const response = await fetch('http://localhost:4001/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation DecreaseStock($id: ID!, $quantity: Int!) {
              decreaseProductStock(id: $id, quantity: $quantity) {
                id
                price
              }
            }
          `,
          variables: { id: item.productId, quantity: item.quantity }
        })
      });
      const result = await response.json();
      if (result.errors || !result.data.decreaseProductStock) {
        throw new Error(`Product ${item.productId} stock not enough or does not exist.`);
      }
      return { 
        productId: item.productId, 
        quantity: item.quantity, 
        purchasePrice: result.data.decreaseProductStock.price
      };
    });

    let processedItems;
    try {
      processedItems = await Promise.all(deductPromises);
    } catch (error: any) {
      throw new Error(error.message);
    }
    
    for (const item of processedItems) {
      totalAmount += (item.purchasePrice * item.quantity);
      orderItems.push(item);
    }

    const orderId = `order_${Date.now()}`;
    const newOrder = {
      id: orderId,
      userId,
      status: 'PAID',
      createdAt: new Date().toISOString(),
      totalAmount,
      items: orderItems
    };

    try {
      await this.redis.lpush(`orders:${userId}`, JSON.stringify(newOrder));
      console.log(`Order ${orderId} created successfully.`);
      
      const eventPayload = {
        event: 'ORDER_CREATED',
        timestamp: new Date().toISOString(),
        data: newOrder
      };
      this.mqChannel.sendToQueue(
        'order_created_events', 
        Buffer.from(JSON.stringify(eventPayload)),
        { persistent: true }
      );

      return newOrder;

    } catch (redisError: any) {
      console.error(`Redis write failed, triggering Saga rollback.`);

      const rollbackPayload = {
        event: 'ROLLBACK_PRODUCT_STOCK',
        timestamp: new Date().toISOString(),
        items: processedItems
      };

      this.mqChannel.sendToQueue(
        'order_rollback_events', 
        Buffer.from(JSON.stringify(rollbackPayload)),
        { persistent: true }
      );

      throw new Error(`Order service busy(failed to write to Redis). Saga rollback triggered.`);
    }
  }

  async getOrders(userId: string) {
    const ordersStr = await this.redis.lrange(`orders:${userId}`, 0, -1);
    return ordersStr.map(order => JSON.parse(order));
  }

  async resetOrders() {
    const keys = await this.redis.keys('orders:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    return true;
  }
}