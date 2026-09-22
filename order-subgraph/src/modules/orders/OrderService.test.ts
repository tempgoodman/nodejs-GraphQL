import { OrderService } from './OrderService';
import Redis from 'ioredis';
import { Channel } from 'amqplib';

jest.mock('ioredis');

describe('OrderService (Enterprise Edition with Saga Rollback)', () => {
  let orderService: OrderService;
  let mockRedis: jest.Mocked<Redis>;
  let mockMqChannel: jest.Mocked<Channel>;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);

    mockRedis = new Redis() as jest.Mocked<Redis>;
    mockRedis.lpush = jest.fn().mockResolvedValue(1);

    mockMqChannel = {
      sendToQueue: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<Channel>;

    orderService = new OrderService(mockRedis, mockMqChannel);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('create order successfully and publish MQ event', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          decreaseProductStock: { id: 'prod_1', price: 150, stock: 8 }
        }
      })
    });

    const items = [{ productId: 'prod_1', quantity: 2 }];
    const result = await orderService.createOrder('user_123', items);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(fetchBody.variables.transactionId).toBe(result.id);
    expect(result.totalAmount).toBe(300);
    expect(mockRedis.lpush).toHaveBeenCalledTimes(1);

    expect(mockMqChannel.sendToQueue).toHaveBeenCalledWith(
      'order_created_events',
      expect.any(Buffer),
      expect.objectContaining({ persistent: true })
    );
  });

  it('cerate order failed due to insufficient stock, should not write to Redis or publish MQ event', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: { decreaseProductStock: null },
        errors: [{ message: 'Stock not enough' }]
      })
    });

    const items = [{ productId: 'prod_99', quantity: 5 }];

    await expect(orderService.createOrder('user_123', items)).rejects.toThrow('Product prod_99 stock not enough or does not exist.');

    expect(mockRedis.lpush).not.toHaveBeenCalled();
    expect(mockMqChannel.sendToQueue).not.toHaveBeenCalled();
  });

  it('Saga Rollback test: when Redis write fails, should automatically publish ROLLBACK_PRODUCT_STOCK event', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: {
          decreaseProductStock: { id: 'prod_1', price: 100, stock: 5 }
        }
      })
    });

    mockRedis.lpush.mockRejectedValue(new Error('Redis connection lost'));

    const items = [{ productId: 'prod_1', quantity: 1 }];

    await expect(orderService.createOrder('user_123', items)).rejects.toThrow('Order service busy(failed to write to Redis). Saga rollback triggered.');

    expect(mockMqChannel.sendToQueue).toHaveBeenCalledWith(
      'order_rollback_events',
      expect.any(Buffer),
      expect.objectContaining({ persistent: true })
    );
  });
});