import { ProductService } from './ProductService';
import { IProductRepository } from './IProductRepository';
import { Redis } from 'ioredis';

describe('ProductService', () => {
  let productService: ProductService;
  let mockRepo: jest.Mocked<IProductRepository>;
  let mockRedis: jest.Mocked<any>; 


  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAndCount: jest.fn(),
      decreaseStock: jest.fn(),
      resetProduct: jest.fn(),
      findByIds: jest.fn(),
    };

    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
    };

    productService = new ProductService(mockRepo, mockRedis as any);
  });

  describe('getProduct', () => {
    it('Use dataloader for batch fetching', async () => {
      const mockResult = [
        { id: 'prod_1', name: 'MacBook Pro', price: 15000, stock: 10 },
        { id: 'prod_99', name: 'MacBook Pro3', price: 15000, stock: 10 }
      ];

      mockRepo.findByIds.mockResolvedValue(mockResult);
      const result = await productService.getProductBatch(['prod_1', 'prod_99']);
      expect(mockRepo.findByIds).toHaveBeenCalledTimes(1);
      expect(mockRepo.findByIds).toHaveBeenCalledWith(['prod_1', 'prod_99']);
      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe('MacBook Pro');
      expect(result[1]?.name).toBe('MacBook Pro3');
    });

    it('Scenario 1: Cache Hit (Redis has data), should return directly without calling DB', async () => {
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({ id: '1', name: 'Mock Milk', stock: 50 }));
      const result = await productService.getProduct('1');
      expect(result?.name).toBe('Mock Milk');
      expect(mockRedis.get).toHaveBeenCalledWith('product:1');
      expect(mockRepo.findById).not.toHaveBeenCalled(); 
    });

    it('Scenario 2: Cache Miss (Redis has no data), should call DB and write to Redis', async () => {
      mockRedis.get.mockResolvedValueOnce(null); 
      mockRepo.findById.mockResolvedValueOnce({ id: '2', name: 'Mock Banana', price: 1, stock: 100 });
      const result = await productService.getProduct('2', ['id', 'name', 'price', 'stock']);
      expect(result?.name).toBe('Mock Banana');
      expect(mockRepo.findById).toHaveBeenCalledWith('2', ['id', 'name', 'price', 'stock']); 
      expect(mockRedis.set).toHaveBeenCalled(); 
    });
  });

  describe('decreaseProductStock', () => {
    it('Scenario 3: After successfully decreasing stock, should delete the corresponding Redis cache (Cache Invalidation)', async () => {
      mockRepo.decreaseStock.mockResolvedValueOnce({ id: '1', name: 'Mock Milk', price: 1, stock: 48 });
      mockRedis.keys.mockResolvedValueOnce(['products:limit:10:offset:0']);
      const result = await productService.decreaseProductStock('1', 2);
      expect(result?.stock).toBe(48);
      expect(mockRepo.decreaseStock).toHaveBeenCalledWith('1', 2);
      expect(mockRedis.del).toHaveBeenCalledWith('product:1'); 
      expect(mockRedis.del).toHaveBeenCalledWith(['products:limit:10:offset:0']); 
    });
  });
});